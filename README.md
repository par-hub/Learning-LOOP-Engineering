# Self-Correcting Multi-Agent System

A small web application that uses a multi-agent workflow to explain a topic. A writer creates an answer, a reviewer checks it, and a reviser improves it when needed. The reviewer can send the revised answer through another review until it passes or the revision limit is reached.

## How it works

1. Enter a topic in the browser.
2. The frontend sends it to the FastAPI endpoint `POST /api/run`.
3. LangGraph runs the writer, reviewer, and reviser workflow. The reviewer can return the answer for revision up to the configured limit.
4. The API returns the workflow events and final answer. The page displays the draft, review decisions, feedback, revisions, and result.

The language model is accessed through Groq using `langchain-groq`. The current model is configured as `openai/gpt-oss-120b` in `backend.py`.

## Project structure

```text
.
|-- app.py                 # FastAPI application and web/API routes
|-- backend.py             # LangGraph workflow and Groq model calls
|-- Templates/
|   `-- index.html         # Main page template
|-- static/
|   |-- app.js             # Form submission and workflow rendering
|   `-- style.css          # Page styles and responsive layout
|-- requirment.text        # Python dependencies
`-- .env                   # Local configuration (keep private)
```

## Requirements

- Python 3.11 or newer
- A Groq API key
- Internet access for model requests (and for the optional Google Fonts used by the page)

## Run locally on Windows

Open PowerShell in the project directory and run:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirment.text
```

Create or update `.env` in the project directory with your own key:

```dotenv
GROQ_API_KEY=your_groq_api_key
MAX_REVISIONS=2
```

Keep `.env` private. Do not commit it or share its contents. Start the web server:

```powershell
uvicorn app:app --reload
```

Open <http://127.0.0.1:8000> in your browser. Stop the server with `Ctrl+C`.

## Run locally on macOS or Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirment.text
```

Add `GROQ_API_KEY` and optionally `MAX_REVISIONS` to `.env`, then start the server:

```bash
uvicorn app:app --reload
```

Open <http://127.0.0.1:8000>.

## Useful routes

- `GET /` - serves the web interface.
- `POST /api/run` - runs the workflow. Send JSON such as `{"topic":"What is an AI agent?"}`.
- `GET /docs` - interactive FastAPI API documentation.

## Configuration

- `GROQ_API_KEY` - required to call the Groq API.
- `MAX_REVISIONS` - maximum number of revisions; defaults to `2`.
- The model name is currently set by `MODEL` in `backend.py`.

The first model call may take a little while. If a run fails, check that the server is running, the API key is valid, and the Groq account can access the configured model.
