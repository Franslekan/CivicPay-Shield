# CivicPay Shield 🛡️

> **Enyata × Interswitch Buildathon 2026**  
> A secure, real-time government levy payment and verification platform built for citizens and revenue collectors.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

CivicPay Shield is a full-stack web application that digitises the collection and verification of government levies in Nigeria. It eliminates cash leakage, provides a tamper-proof audit trail, and gives revenue collectors real-time tools to verify citizen payments on the spot — via QR code or receipt ID.

Built for the **Enyata × Interswitch Buildathon 2026**, it is powered by **Interswitch's payment infrastructure** and secured with **JWT authentication** and **256-bit TLS encryption**.

---

## Features

### 👤 Citizen
- Register and log in securely
- Pay levies online (Transport, Market, Signage, Waste, Development)
- Choose from preset amounts or enter a custom value
- Authorise payments via a 6-digit OTP
- View full transaction history with receipts
- Real-time payment status tracking

### 🔍 Collector
- Verify citizen payments by scanning a QR code or entering a receipt ID
- Approve or flag suspicious transactions
- Log street-level cash collections on behalf of citizens
- View all transactions with live aggregate stats (total volume, pending, verified)
- Full audit trail with collector name and timestamp

### 🔒 Security
- Bcrypt password hashing
- JWT access tokens (24-hour expiry)
- Role-based access control (citizen / collector / admin)
- CORS protection configured per environment
- Collector registration gated behind a secret passcode

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, CSS-in-JS |
| **Backend** | FastAPI (Python 3.11+) |
| **Database** | SQLite (local) / PostgreSQL (production) |
| **Auth** | JWT via `python-jose`, bcrypt password hashing |
| **ORM** | SQLAlchemy 2.0 |
| **Payments** | Interswitch Payment Gateway |
| **Hosting** | Render (backend) / Vercel (frontend) |

---

## Project Structure

```
CivicPay-Shield/
├── civicpay/                  # Backend (FastAPI)
│   ├── main.py                # App entry point + CORS config
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables (local only)
│   ├── core/
│   │   ├── database.py        # SQLAlchemy engine + session + init_db
│   │   └── security.py        # JWT + bcrypt helpers + auth dependencies
│   ├── models/
│   │   ├── user.py            # User table
│   │   └── transaction.py     # Transaction table
│   └── routers/
│       ├── auth.py            # POST /api/auth/register & /login
│       ├── payments.py        # GET /history, POST /initialize, GET /verify/{id}
│       └── admin.py           # GET /transactions, POST /approve & /flag
│
└── frontend/                  # Frontend (React + Vite)
    ├── index.html
    ├── src/
    │   ├── main.jsx           # React entry point
    │   ├── index.css          # Global reset styles
    │   └── App.jsx            # CivicPayShield root component
    └── package.json
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- **Python 3.11+** — `python3 --version`
- **Node.js 18+** — `node --version`
- **npm or yarn** — `npm --version`

---

### Backend Setup

```bash
# 1. Navigate into the backend folder
cd CivicPay-Shield/civicpay

# 2. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env .env.local              # Edit values as needed (see Environment Variables below)

# 5. Start the development server
uvicorn main:app --reload --port 8000
```

The API will be live at **http://localhost:8000**  
Interactive docs (Swagger UI) at **http://localhost:8000/docs**

---

### Frontend Setup

```bash
# 1. Navigate into the frontend folder
cd CivicPay-Shield/frontend     # or wherever your React project lives

# 2. Install dependencies
npm install

# 3. Set the backend URL
# Open src/App.jsx and confirm this line at the top:
# const API_BASE = "http://localhost:8000";

# 4. Start the development server
npm run dev
```

The app will be live at **http://localhost:5173**

---

## Environment Variables

Create a `.env` file inside the `civicpay/` folder with the following values:

```env
# Database — SQLite for local dev (file auto-created), swap for PostgreSQL in production
DATABASE_URL=sqlite:///./civicpay.db

# JWT secret — use a long random string in production
SECRET_KEY=your_secret_key_here

# Token lifetime in minutes (default: 1440 = 24 hours)
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Passcode required when registering a Collector account
# Share this with authorised collectors only
COLLECTOR_SECRET=civicpay2026
```

> ⚠️ Never commit your `.env` file to version control. It is already listed in `.gitignore`.

---

## API Reference

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Create a new citizen or collector account | None |
| `POST` | `/api/auth/login` | Log in and receive a JWT token | None |

### Payments

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/payments/history` | Get logged-in citizen's transaction history | Citizen |
| `POST` | `/api/payments/initialize` | Create a new levy payment | Any |
| `GET` | `/api/payments/verify/{receipt_id}` | Verify a payment by receipt ID | Any |

### Admin (Collector only)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/admin/transactions` | Get all transactions + aggregate stats | Collector |
| `POST` | `/api/admin/transactions/{id}/approve` | Approve a transaction | Collector |
| `POST` | `/api/admin/transactions/{id}/flag` | Flag a transaction for review | Collector |

### Example: Login Request

```json
POST /api/auth/login
{
  "identifier": "citizen@example.com",
  "password": "yourpassword",
  "role": "citizen"
}
```

### Example: Login Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "citizen@example.com",
    "role": "citizen"
  }
}
```

---

## User Roles

### Citizen
Register at `/register` with role set to **Citizen**.  
No special passcode required.

### Collector
Register at `/register` with role set to **Collector**.  
You will be prompted for a **VIP Security Passcode** — this must match the `COLLECTOR_SECRET` value in the backend `.env` file (default for local dev: `civicpay2026`).

> In production, only share this passcode with authorised revenue collectors via a secure channel.

---

## Deployment

### Backend (Render)

1. Push your code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set the build command: `pip install -r requirements.txt`
4. Set the start command: `uvicorn main:app --host 0.0.0.0 --port 8000`
5. Add your environment variables in the Render dashboard
6. Switch `DATABASE_URL` to a PostgreSQL connection string

### Frontend (Vercel)

1. Import your GitHub repo on [Vercel](https://vercel.com)
2. Set the root directory to your frontend folder
3. Update `API_BASE` in `src/App.jsx` to your Render backend URL:
   ```js
   const API_BASE = "https://your-app.onrender.com";
   ```
4. Deploy — Vercel handles the rest automatically

### Update CORS for Production

In `civicpay/main.py`, add your Vercel frontend URL to `allow_origins`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-app.vercel.app",   # ← add this
    ],
    ...
)
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feat/your-feature-name`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## License

This project was built for the **Enyata × Interswitch Buildathon 2026**.  
© 2026 CivicPay Shield. All rights reserved.

---

<div align="center">
  <sub>Built with ❤️ · Secured by Interswitch · 256-bit TLS</sub>
</div>
