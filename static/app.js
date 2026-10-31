// 1. Names and interface text. No framework or browser storage is used.
const names = [
  ['소크라테스', 'Socrates'], ['니체', 'Nietzsche'],
  ['정약용', 'Jeong Yak-yong'], ['아리스토텔레스', 'Aristotle'],
  ['루소', 'Rousseau'], ['칸트', 'Kant'], ['사르트르', 'Sartre'],
  ['마키아벨리', 'Machiavelli'], ['마르크스', 'Marx'], ['공자', 'Confucius']
];
const words = {
  ko: {
    subtitle: '고전 사상가들의 관점으로 읽는 학술 심의록',
    title: '의회를 소집하십시오', sample: '예시 모드 · API 불필요', ai: 'AI 모드 · API 필요',
    sampleNote: '미리 작성한 “미루는 습관” 예시입니다. 아래 버튼을 누르면 바로 열립니다. 새로운 화두를 분석하는 기능은 아닙니다.',
    aiNote: '한 번의 AI 요청으로 여러 철학적 관점의 토론을 생성합니다. 독립 에이전트들의 순차 토론은 아닙니다.',
    concern: '화두(Aporia)를 제시하십시오', thinkers: '사상가 3~5명을 선택하십시오',
    key: 'OpenAI API 키', keyNote: '키는 이 탭에서만 유지됩니다. 사이트 서버를 거쳐 OpenAI로 전송하며 저장하지 않습니다. API 사용료가 발생할 수 있습니다.',
    runSample: '예시 심의록 열기', runAI: 'AI 심의 시작',
    loading: '현인들의 위원회(Concilium)가 논제를 숙의 중입니다…',
    proceedings: '학술 심의록', judge: '재판관 · 논리 검토', download: '심의록 다운로드 ↓',
    liveNote: 'AI가 한 번의 요청으로 생성한 철학적 시뮬레이션입니다. 실제 역사 인물의 발언이 아닙니다.',
    invalid: '화두를 3글자 이상 입력하고 서로 다른 사상가 3~5명을 선택해 주십시오.',
    missingKey: 'AI 모드에는 API 키가 필요합니다. 키 없이 실행하려면 예시 모드를 선택해 주십시오.',
    badKey: 'API 키가 유효하지 않거나 만료됐습니다. 키를 확인해 주십시오.',
    quota: 'OpenAI API 잔액 또는 사용 가능 크레딧이 부족합니다. 기다리거나 키만 다시 만들어도 해결되지 않습니다. API 결제 상태를 확인해 주십시오.',
    spend: 'OpenAI 계정·프로젝트의 지출 또는 사용 한도에 도달했습니다. API Limits 설정을 확인해 주십시오.',
    rate: 'OpenAI의 일시적인 요청 속도 제한입니다. 잠시 후 한 번만 다시 시도해 주십시오.',
    limitUnknown: 'OpenAI가 사용 제한(429)을 반환했습니다. 단순 요청 제한인지 잔액 문제인지 확인되지 않았습니다. API 결제·사용 한도를 확인해 주십시오.',
    accessDenied: '이 키의 프로젝트 권한 또는 지원 지역 문제로 모델에 접근할 수 없습니다.',
    network: '연결이 끊겼거나 응답 시간이 초과됐습니다. 잠시 후 다시 시도해 주십시오.',
    format: 'AI 응답의 형식이 맞지 않아 심의록을 표시하지 못했습니다. 다시 시도해 주십시오.',
    server: '서버가 요청을 완료하지 못했습니다. 예시 모드는 API 없이 사용할 수 있습니다.',
    billing: 'OpenAI API 결제 확인 ↗'
  },
  en: {
    subtitle: 'Proceedings of classical philosophical perspectives',
    title: 'Convene the Council', sample: 'Sample · no API needed', ai: 'AI · API required',
    sampleNote: 'A prewritten example about procrastination. Open it below without a key. It does not analyze a new question.',
    aiNote: 'One model request generates a debate across philosophical perspectives. These are not independent agents taking sequential turns.',
    concern: 'Present your aporia', thinkers: 'Choose 3–5 thinkers',
    key: 'OpenAI API key', keyNote: 'The key stays in this tab and passes through this site to OpenAI. It is not saved. OpenAI API usage may incur charges.',
    runSample: 'Open sample proceedings', runAI: 'Convene AI council',
    loading: 'The Concilium is deliberating upon the question…',
    proceedings: 'Proceedings', judge: 'The Judge · Logical Review', download: 'Download proceedings ↓',
    liveNote: 'A philosophical simulation generated in one model request, not authentic historical statements.',
    invalid: 'Enter at least 3 characters and choose 3–5 distinct thinkers.',
    missingKey: 'AI mode requires an API key. Choose Sample mode to run without one.',
    badKey: 'The API key is invalid or expired. Please check it.',
    quota: 'Your OpenAI API credits or quota are unavailable. Waiting or creating another key does not restore credits. Check API billing.',
    spend: 'An OpenAI account or project spending/usage limit has been reached. Check API Limits.',
    rate: 'OpenAI is temporarily limiting request speed. Wait, then try once more.',
    limitUnknown: 'OpenAI returned a usage restriction (429). The cause is not confirmed. Check API credits, billing and limits.',
    accessDenied: 'Project permissions or region restrictions prevent this key from accessing the model.',
    network: 'The connection failed or timed out. Try again later.',
    format: 'The AI response did not match the proceedings format. Please try again.',
    server: 'The server could not complete the request. Sample mode works without an API.',
    billing: 'Check OpenAI API billing ↗'
  }
};

const $ = id => document.getElementById(id);
let language = 'ko';
let examples = null;
let reportURL = '';

// 2. Display the form in the chosen language.
async function loadExample() {
  if (!examples) {
    const response = await fetch('/static/demo.json');
    if (!response.ok) throw new Error('network');
    examples = await response.json();
  }
  return examples[language];
}

function mode() {
  return document.querySelector('input[name="mode"]:checked').value;
}

async function updateForm() {
  const w = words[language];
  document.documentElement.lang = language;
  $('subtitle').textContent = w.subtitle;
  $('formTitle').textContent = w.title;
  $('sampleLabel').textContent = w.sample;
  $('aiLabel').textContent = w.ai;
  $('questionLabel').textContent = w.concern;
  $('thinkersLabel').textContent = w.thinkers;
  $('keyLabel').textContent = w.key;
  $('keyNote').textContent = w.keyNote;
  $('billing').textContent = w.billing;
  $('result').hidden = true;
  $('error').hidden = true;
  $('status').textContent = '';
  const sample = mode() === 'sample';
  $('modeNote').textContent = sample ? w.sampleNote : w.aiNote;
  $('run').textContent = sample ? w.runSample : w.runAI;
  $('keyBox').hidden = sample;
  $('concern').disabled = sample;
  $('thinkers').replaceChildren();
  names.forEach((pair, index) => {
    const label = document.createElement('label');
    label.className = 'thinker';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = index;
    checkbox.checked = [0, 1, 5].includes(index);
    checkbox.disabled = sample;
    label.append(checkbox, document.createTextNode(pair[language === 'ko' ? 0 : 1]));
    $('thinkers').append(label);
  });
  try {
    const example = await loadExample();
    if (sample) $('concern').value = example.concern;
    else if (Object.values(examples).some(item => item.concern === $('concern').value)) $('concern').value = '';
  } catch {
    showError({code: 'network'});
  }
}

function showError(error) {
  const w = words[language];
  $('errorText').textContent = w[error.code] || w.server;
  if (error.providerCode) $('errorText').textContent += ` (${error.providerCode})`;
  $('billing').hidden = !['quota', 'spend', 'limitUnknown'].includes(error.code);
  $('error').hidden = false;
}

// 3. Safely build cards using textContent, not AI-generated HTML.
function element(tag, text, className = '') {
  const item = document.createElement(tag);
  item.textContent = text;
  item.className = className;
  return item;
}

function showCouncil(data, sample) {
  const w = words[language];
  $('resultTitle').textContent = w.proceedings;
  $('resultNote').textContent = sample ? data.notice : w.liveNote;
  $('thesis').textContent = data.thesis;
  $('rounds').replaceChildren();
  const concern = sample ? data.concern : $('concern').value.trim();
  let markdown = `# Concilium\n\n${$('resultNote').textContent}\n\n## Aporia\n${concern}\n\n## Question\n${data.thesis}\n`;
  data.rounds.forEach(round => {
    $('rounds').append(element('h3', round.label));
    markdown += `\n## ${round.label}\n`;
    round.items.forEach(item => {
      const card = element('article', '', 'card');
      card.append(element('h4', item.name), element('p', item.text));
      $('rounds').append(card);
      markdown += `\n### ${item.name}\n${item.text}\n`;
    });
    const judge = element('aside', '', 'judge');
    judge.append(element('h4', w.judge), element('p', round.judge));
    $('rounds').append(judge);
    markdown += `\n### ${w.judge}\n${round.judge}\n`;
  });
  if (reportURL) URL.revokeObjectURL(reportURL);
  reportURL = URL.createObjectURL(new Blob([markdown], {type: 'text/markdown;charset=utf-8'}));
  $('download').href = reportURL;
  $('download').textContent = w.download;
  $('result').hidden = false;
  $('result').scrollIntoView({behavior: 'smooth'});
}

// 4. Sample mode reads a local JSON file. AI mode makes ONE server request.
$('councilForm').addEventListener('submit', async event => {
  event.preventDefault();
  $('error').hidden = true;
  $('result').hidden = true;
  const sample = mode() === 'sample';
  const selected = [...document.querySelectorAll('#thinkers input:checked')].map(input => Number(input.value));
  if (!sample && ($('concern').value.trim().length < 3 || selected.length < 3 || selected.length > 5)) {
    showError({code: 'invalid'}); return;
  }
  if (!sample && !$('apiKey').value.trim()) { showError({code: 'missingKey'}); return; }
  const controls = [...$('councilForm').elements, $('language')];
  const wasDisabled = controls.map(control => control.disabled);
  controls.forEach(control => control.disabled = true);
  $('status').textContent = sample ? '' : words[language].loading;
  try {
    if (sample) showCouncil(await loadExample(), true);
    else {
      const response = await fetch('/api/council', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({language, thinkers: selected, concern: $('concern').value.trim(), apiKey: $('apiKey').value.trim()}),
        signal: AbortSignal.timeout(120000)
      });
      let data;
      try { data = await response.json(); } catch { throw {code: 'server'}; }
      if (!response.ok) throw data;
      showCouncil(data, false);
    }
  } catch (error) {
    showError(error.code ? error : {code: 'network'});
  } finally {
    controls.forEach((control, index) => control.disabled = wasDisabled[index]);
    $('status').textContent = '';
  }
});
$('language').addEventListener('change', event => { language = event.target.value; updateForm(); });
document.querySelectorAll('input[name="mode"]').forEach(input => input.addEventListener('change', updateForm));
updateForm();
