"""Concilium Simple: one AI request for one complete council.
Install: pip install -r requirements.txt
Run: uvicorn main:app --reload
"""
import json
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI
from openai import APIStatusError

ROOT = Path(__file__).resolve().parent
PROMPT = (ROOT / 'council_prompt.txt').read_text(encoding='utf-8')
NAMES = [
    ['소크라테스', 'Socrates'], ['니체', 'Nietzsche'],
    ['정약용', 'Jeong Yak-yong'], ['아리스토텔레스', 'Aristotle'],
    ['루소', 'Rousseau'], ['칸트', 'Kant'], ['사르트르', 'Sartre'],
    ['마키아벨리', 'Machiavelli'], ['마르크스', 'Marx'], ['공자', 'Confucius']
]
app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
app.mount('/static', StaticFiles(directory=ROOT / 'static'), name='static')


def failure(code, status=400, provider_code=None):
    body = {'code': code}
    if isinstance(provider_code, str) and provider_code.replace('_', '').isalnum():
        body['providerCode'] = provider_code[:80]
    return JSONResponse(body, status_code=status, headers={'Cache-Control': 'no-store'})


@app.exception_handler(RequestValidationError)
async def validation_error(request, error):
    return failure('invalid')  # Never include submitted keys in error details.


@app.get('/')
def home():
    return FileResponse(ROOT / 'static' / 'index.html')


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.post('/api/council')
async def council(request: Request):
    # Only accept requests from the website itself.
    from urllib.parse import urlparse
    if urlparse(request.headers.get('origin', '')).netloc != request.headers.get('host'):
        return failure('accessDenied', 403)
    raw = bytearray()
    async for chunk in request.stream():
        raw.extend(chunk)
        if len(raw) > 16000:
            return failure('invalid', 413)
    try:
        data = json.loads(raw)
        language, ids = data['language'], data['thinkers']
        concern, key = data['concern'].strip(), data['apiKey'].strip()
        assert language in ['ko', 'en']
        assert 3 <= len(ids) <= 5 and len(set(ids)) == len(ids)
        assert all(type(i) is int and 0 <= i < 10 for i in ids)
        assert 3 <= len(concern) <= 2000
        assert key.startswith('sk-') and len(key) <= 512
    except (KeyError, TypeError, ValueError, AttributeError, AssertionError):
        return failure('invalid')
    selected = [NAMES[i][0 if language == 'ko' else 1] for i in ids]
    try:
        # One model, one request. No automatic retries that could hide quota errors.
        model = ChatOpenAI(model='gpt-4o-mini', api_key=key, temperature=0.7,
                           max_tokens=4000, timeout=90, max_retries=0)
        model = model.bind(response_format={'type': 'json_object'})
        response = await model.ainvoke([
            SystemMessage(content=PROMPT),
            HumanMessage(content=json.dumps({'language': language, 'selected': selected, 'concern': concern}, ensure_ascii=False))
        ])
        result = json.loads(response.content)
        assert isinstance(result['thesis'], str) and result['thesis'].strip()
        assert len(result['rounds']) == 3
        for round in result['rounds']:
            assert [item['name'] for item in round['items']] == selected
            assert isinstance(round['label'], str) and isinstance(round['judge'], str)
            assert all(isinstance(item['text'], str) and item['text'].strip() for item in round['items'])
        return JSONResponse(result, headers={'Cache-Control': 'no-store'})
    except APIStatusError as error:
        body = error.body if isinstance(error.body, dict) else {}
        detail = body.get('error', body)
        if not isinstance(detail, dict): detail = {}
        code, kind = detail.get('code', ''), detail.get('type', '')
        if error.status_code == 401:
            return failure('badKey', 401)
        if error.status_code == 403:
            return failure('accessDenied', 403)
        if error.status_code == 429:
            if code in ['organization_spend_limit_exceeded', 'project_spend_limit_exceeded', 'organization_usage_limit_exceeded', 'usage_limit_exceeded']:
                return failure('spend', 429, code)
            if kind == 'insufficient_quota' or code in ['insufficient_quota', 'credit_balance_exhausted', 'billing_hard_limit_reached']:
                return failure('quota', 429, code)
            if code in ['rate_limit_exceeded', 'slow_down'] or kind in ['rate_limit_error', 'requests', 'tokens']:
                return failure('rate', 429, code)
            return failure('limitUnknown', 429, code)
        return failure('server', 502)
    except (ValueError, KeyError, TypeError, AssertionError):
        return failure('format', 502)
    except Exception:
        return failure('network', 502)
