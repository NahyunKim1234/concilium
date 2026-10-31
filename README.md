# Concilium

**A small philosophical council built with Python and JavaScript.**

Concilium presents a single question through different philosophical perspectives. It supports both Korean and English, 10 thinker profiles, 3 rounds of discussion with logical reviews, and Markdown export.

## Why this project?

A smooth, fluent answer often hides its underlying assumptions. This project explores whether exposing disagreements between different philosophical thinkers makes those assumptions easier to notice. 

The UI features a dark charcoal background, antique gold accents, and serif typography to mimic academic proceedings.

## Two Modes

- **Sample Mode:** Opens a prewritten discussion about procrastination. No API key or model request needed.
- **AI Mode:** Takes a user question and 3–5 thinkers. Generates a philosophical debate including opening positions, rebuttals, final advice, and Judge reviews.

> **Note on Architecture:** The current version uses **a single LLM call** to generate the complete discussion (via `gpt-4o-mini` and LangChain) rather than multi-agent communication. Thinker profiles and Judge evaluations are simulated and do not represent authentic historical quotations.

## How It Works

1. The browser collects the language, question, selected thinkers, and your OpenAI API key.
2. FastAPI validates the input and loads `council_prompt.txt`.
3. LangChain's `ChatOpenAI` sends a single request to `gpt-4o-mini` expecting a structured JSON response.
4. The server verifies that the response contains three rounds and the correct speakers.
5. JavaScript renders the discussion cards and enables Markdown export.

## Project Structure

| File | Purpose |
|---|---|
| `main.py` | FastAPI backend, input validation, and single LLM call handling. |
| `council_prompt.txt` | Thinker profiles, debate instructions, and JSON schema. |
| `static/index.html` | UI controls for language, mode, question, thinkers, and API key. |
| `static/style.css` | Styling (dark mode, serif typography, card layout). |
| `static/app.js` | Frontend logic, API requests, card rendering, and Markdown export. |
| `static/demo.json` | Prewritten sample proceedings (KO/EN). |
| `requirements.txt` | Python dependencies. |
| `render.yaml`, `railway.toml` | Deployment configurations. |
| `DEVLOG.md` | Development log and trial-and-error notes (in Korean). |
| `NEXT_STEPS.md` | Planned improvements and ideas (in Korean). |

## AI-Assisted Development

Throughout the development process, AI tools were utilized for documentation organizing, troubleshooting bugs, and iterative feedback refinement. All core problem definitions, feature prioritization, and final code decisions were independently guided and verified by the creator.

## Run Locally

Python 3.12 is required. Run the following commands in your terminal:

```bash
pip install -r requirements.txt
uvicorn main:app --reload
