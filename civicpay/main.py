from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, payments, admin
from core.database import init_db

app = FastAPI(title="CivicPay Shield API", version="1.0.0")

# ── CORS ─────────────────────────────────────────────────────────────────────
# Allow requests from your React dev server (Vite default: 5173, CRA: 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── STARTUP ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    init_db()

# ── ROUTERS ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(admin.router,    prefix="/api/admin",    tags=["Admin"])

# ── HEALTH ────────────────────────────────────────────────────────────────────
@app.get("/")
def health():
    return {"status": "ok", "service": "CivicPay Shield API"}
