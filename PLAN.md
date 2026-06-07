# QuantArena — Execution Plan

## Overview
LeetCode-style platform for quant strategies. Users submit Python trading strategies, which get backtested against hidden market data across multiple regimes (bull, bear, sideways). Scored on multiple factors.

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React + Monaco Editor (code editor) |
| Backend API | FastAPI (Python) |
| Database | PostgreSQL |
| Job Queue | Celery + Redis |
| Sandbox | RestrictedPython (MVP) → Docker (future) |
| Auth | JWT (access + refresh tokens) |
| Data | Daily OHLCV + precomputed indicators (RSI, SMA, EMA, MACD, Bollinger) |

---

## Phase 1: Foundation (Days 1-3)

### 1.1 Project Structure
```
quantArena/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry
│   │   ├── config.py            # Settings, env vars
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── routers/             # API routes
│   │   ├── services/            # Business logic
│   │   ├── engine/              # Backtest engine
│   │   ├── sandbox/             # RestrictedPython execution
│   │   └── worker/              # Celery tasks
│   ├── migrations/              # Alembic
│   ├── data/                    # Market data (hidden, not in git)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml           # Postgres, Redis, API, Worker, Frontend
├── .env.example
└── README.md
```

### 1.2 Database Schema
- **users** — id, email, password_hash, username, created_at
- **competitions** — id, title, description, dataset_id, start_date, end_date, is_active
- **strategies** — id, user_id, competition_id, code, mode (code/rule), status (pending/running/done/failed), submitted_at
- **results** — id, strategy_id, total_return, sharpe_ratio, max_drawdown, win_rate, calmar_ratio, regime_scores (JSONB), equity_curve (JSONB), completed_at
- **datasets** — id, name, regime_tags (bull/bear/sideways), is_revealed, file_path

### 1.3 Docker Compose
- PostgreSQL 15
- Redis 7
- FastAPI (uvicorn)
- Celery worker
- React dev server

---

## Phase 2: Auth & Core API (Days 4-5)

### 2.1 Auth
- POST /auth/register — email, username, password
- POST /auth/login — returns JWT access + refresh token
- GET /auth/me — current user profile

### 2.2 Competitions API
- GET /competitions — list active competitions
- GET /competitions/{id} — details + revealed dataset info

### 2.3 Strategy Submission API
- POST /strategies — submit code, validate, save as pending
- GET /strategies/{id} — get strategy + result if done
- GET /strategies/me — user's submissions

---

## Phase 3: Backtest Engine (Days 6-9)

### 3.1 Engine Core
- Load OHLCV + indicators for a dataset
- Define strategy interface:
  ```python
  def strategy(data, portfolio):
      # data = current candle + indicators + lookback window
      # return: "BUY", "SELL", or "HOLD"
  ```
- Loop candle-by-candle, call strategy, update portfolio
- Track: cash, holdings, trades, equity curve

### 3.2 Scoring
- Total return (%)
- Sharpe ratio (annualized)
- Max drawdown (%)
- Win rate (% of profitable trades)
- Calmar ratio (return / max drawdown)
- Regime breakdown — separate scores for bull/bear/sideways segments

### 3.3 Sandbox Execution
- RestrictedPython compiles user code
- Blocked: imports (except math, numpy), file I/O, network, exec/eval
- Time limit: 30 seconds
- Memory limit: 256MB

---

## Phase 4: Celery Worker (Day 10)

### 4.1 Task Flow
1. Strategy saved with status=pending
2. Celery task `run_backtest` picks it up
3. Updates status to running
4. Executes strategy in sandbox against hidden dataset
5. Computes scores
6. Writes results to DB, status=done (or failed with error message)

### 4.2 Error Handling
- Syntax errors → immediate fail with message
- Runtime errors → fail with traceback (sanitized)
- Timeout → fail with "exceeded time limit"
- Sandbox violations → fail with "restricted operation"

---

## Phase 5: Frontend (Days 11-15)

### 5.1 Pages
- **Landing** — what is QuantArena, CTA to register
- **Login/Register**
- **Competitions List** — browse active competitions
- **Competition Detail** — description, revealed data preview, submit button
- **Strategy Editor** — Monaco editor, submit button, status indicator
- **Results** — score card, equity curve chart, regime breakdown
- **Leaderboard** — ranked by composite score

### 5.2 Key Components
- Monaco code editor with Python syntax
- Polling for result status (every 3s)
- Chart.js or Recharts for equity curves
- Score radar chart (optional) for regime performance

---

## Phase 6: Data Pipeline (Days 16-17)

### 6.1 Data Sourcing
- Source: Yahoo Finance (yfinance) or similar free API
- Assets: Major indices/stocks (S&P500, NIFTY50, or top 10-20 liquid stocks)
- Timeframe: 10-15 years daily OHLCV

### 6.2 Indicator Precomputation
- RSI (14-day)
- SMA (20, 50, 200)
- EMA (12, 26)
- MACD (12, 26, 9)
- Bollinger Bands (20, 2)
- ATR (14)
- Volume SMA (20)

### 6.3 Regime Tagging
- Label date ranges as bull/bear/sideways based on:
  - 200-day SMA trend
  - Drawdown from peak
  - Volatility clustering
- Split into revealed (training) and hidden (test) segments

---

## Phase 7: Polish & Deploy (Days 18-20)

- Rate limiting on submissions
- Basic admin panel (manage competitions, view submissions)
- Error pages, loading states
- Deploy: Docker Compose on a VPS (DigitalOcean/AWS EC2)
- Domain + HTTPS (Caddy or nginx + Let's Encrypt)
- Seed with 1-2 sample competitions

---

## Rule-Based Strategy Mode (Parallel Track)

For non-coders:
- UI to build rules: IF indicator {operator} value THEN action
- Stored as JSON in strategies table
- Engine converts rules to equivalent logic before running
- Same scoring pipeline

---

## Future (Post-MVP)
- WebSocket for live result push
- Docker-based sandboxing
- Multi-asset strategies
- Custom indicator uploads
- Team competitions
- Strategy marketplace
- More granular data (hourly, minute)
