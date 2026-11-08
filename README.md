# 🌿 Neem & Teak - Autonomous AI Customer Support Agent & Dashboard

> Simple help for everyday home and kitchen needs.

![System Architecture](docs/images/customer_support_architecture.jpg)

An end-to-end autonomous customer support automation system with an AI pipeline, safety guardrails, human escalation, and a modern React + shadcn/ui operational dashboard.

---

## ✨ Features

- **Autonomous Inbox Polling**: Automatically polls Gmail on a recurring interval via a non-blocking background lifecycle task, with zero delay and automatic deduplication.
- **Multi-Layer Safety Guardrails**:
  - Filters out newsletters, marketing blasts, and auto-replies using RFC headers (`List-Unsubscribe`, `Precedence: bulk`).
  - Detects automated sender patterns (`noreply`, `mailer-daemon`, `notifications`, etc.).
  - Filters Gmail system categories (`CATEGORY_PROMOTIONS`, `CATEGORY_SOCIAL`, `CATEGORY_FORUMS`, `SPAM`, `TRASH`).
  - Ignores delivery failure notices, OTPs, and security alerts to prevent infinite reply loops.
- **AI Classification & Grounded Answering**:
  - Fast classifier (Claude 3.5 Haiku) tags intent and category (`mixer_grinders`, `bookshelves`, `returns_warranty`, `shipping`).
  - Response generator (Claude 3.5 Sonnet) retrieves factual store policies dynamically from PostgreSQL knowledge base using Pydantic AI tools.
- **Human-in-the-Loop Escalation**:
  - Complex tickets (damaged goods, replacement parts, refund requests) are automatically tagged with the `needs-human` label in Gmail and marked `escalated` in the database.
  - Human colleagues retain ownership of the thread until resolved.
- **Multi-Digit Ticket Threading (`NT-10021`)**:
  - Every customer inquiry is assigned a unique multi-digit reference (e.g. `NT-10021`).
  - Outgoing email subjects include `Re: [NT-10021] ...` so customer replies automatically thread to the exact same ticket.
  - All pipeline events for that conversation are linked under the same ticket number.
- **Modern Operational Dashboard**:
  - Built with **React 19**, **Vite**, **Tailwind CSS v4**, and **shadcn/ui**.
  - **Events Tab**: Real-time pipeline log with metric cards, instant search, and status filtering.
  - **Tickets Tab**: Interactive 12-column split view displaying ticket metadata, status badges, and chronological thread message histories.
  - **Knowledge Base Tab**: Live markdown editor to update customer support policies on the fly without redeploying code.
  - Protected with HTTP Basic Authentication (`admin` + custom password) and dark/light mode toggle.

---

## 🏗️ Architecture

```
                 ┌────────────────────────────────────────┐
                 │             Gmail Inbox                │
                 └──────────────────┬─────────────────────┘
                                    │ (list unread)
                                    ▼
                 ┌────────────────────────────────────────┐
                 │           app/guards.py                │
                 │ (Filters noreply, newsletters, spam)   │
                 └──────────────────┬─────────────────────┘
                                    │ (valid customer email)
                                    ▼
                 ┌────────────────────────────────────────┐
                 │      Pydantic AI Classifier            │
                 │      (Claude 3.5 Haiku)                │
                 └──────────────────┬─────────────────────┘
                                    │
                                    ▼
                 ┌────────────────────────────────────────┐
                 │       Pydantic AI Agent                │
                 │       (Claude 3.5 Sonnet + RAG)        │
                 └──────┬──────────────────────────┬──────┘
                        │                          │
                 [Action: Answer]           [Action: Escalate]
                        │                          │
                        ▼                          ▼
               Send Reply [NT-10021]        Add 'needs-human' label
                        │                          │
                        └───────────┬──────────────┘
                                    │
                                    ▼
                 ┌────────────────────────────────────────┐
                 │       Supabase (PostgreSQL)            │
                 │ (events, tickets, messages, knowledge) │
                 └──────────────────┬─────────────────────┘
                                    │
                                    ▼
                 ┌────────────────────────────────────────┐
                 │     React + shadcn/ui Dashboard        │
                 │   (Served securely via FastAPI)        │
                 └────────────────────────────────────────┘
```

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Python 3.13+ with [uv](https://github.com/astral-sh/uv)
- Node.js 20+ and npm
- A PostgreSQL database (e.g., Supabase)
- Google Cloud OAuth credentials (Gmail API)
- Anthropic API Key

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Sayan-CtrlZ/ai-customer-support.git
cd ai-customer-support

# Install Python virtual environment & packages
uv sync

# Install Frontend dependencies
cd dashboard
npm install
cd ..
```

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```
Key variables:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`
- `ANTHROPIC_API_KEY`
- `DATABASE_URL` (PostgreSQL connection string)
- `DASHBOARD_USERNAME=admin`
- `DASHBOARD_PASSWORD=<your-secure-password>`

### 3. Database Migration & Knowledge Base Seeding
```bash
uv run python scripts/seed_knowledge_base.py
```

### 4. Running the Application

**Option A: Dual-Server Development Mode (with Vite HMR)**
```bash
# Terminal 1: Backend API + Automated Background Poller
uv run fastapi dev app/main.py

# Terminal 2: React Dashboard with Hot Reloading
cd dashboard && npm run dev
```
- Dashboard runs at `http://localhost:5173`
- Backend runs at `http://127.0.0.1:8000`

**Option B: Production Mode (All-in-One)**
```bash
# Build the React frontend
cd dashboard && npm run build && cd ..

# Start FastAPI serving both API and Frontend
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Open `http://127.0.0.1:8000` in your browser.

---

## 🐳 Docker Deployment

The project includes a production-ready, multi-stage [`Dockerfile`](./Dockerfile) that builds the React assets and packages the Python backend with `uv`.

```bash
# Build Docker image
docker build -t neem-teak-support .

# Run container
docker run -d \
  --name support-bot \
  --restart unless-stopped \
  --env-file .env \
  -p 127.0.0.1:8080:8080 \
  neem-teak-support
```

### Deploying to DigitalOcean Droplet
1. Create an Ubuntu 24.04 LTS Droplet.
2. Enable UFW: `ufw allow OpenSSH && ufw enable`.
3. Install Docker: `apt update && apt install -y docker.io git`.
4. Clone repo, set `.env`, and run with Docker binding to `127.0.0.1:8080`.
5. Connect securely from your laptop via SSH Tunnel:
   ```bash
   ssh -N -L 8080:localhost:8080 root@<YOUR_DROPLET_IP>
   ```
6. Access dashboard at `http://localhost:8080`.

---

## 🛡️ License

MIT License. Designed and built for Neem & Teak Customer Support.
