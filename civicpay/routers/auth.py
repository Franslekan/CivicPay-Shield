"""
POST /api/auth/register  — create a new account
POST /api/auth/login     — return JWT + user object
"""
import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import hash_password, verify_password, create_access_token
from models.user import User

router = APIRouter()

# Secret passcode collectors must supply at registration.
# Set COLLECTOR_SECRET in your .env; defaults to "civicpay2026" for local dev.
COLLECTOR_SECRET = os.getenv("COLLECTOR_SECRET", "civicpay2026")


# ── Schemas ───────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name:        str
    email:       EmailStr
    phone:       str | None = None
    password:    str
    role:        str = "citizen"          # citizen | collector
    secret_code: str | None = None        # required when role == collector


class LoginRequest(BaseModel):
    identifier: str    # email or phone
    password:   str
    role:       str = "citizen"


# ── Helpers ───────────────────────────────────────────────────────────────────
def _user_payload(user: User) -> dict:
    return {
        "id":    user.id,
        "name":  user.name,
        "email": user.email,
        "phone": user.phone,
        "role":  user.role,
    }


# ── Routes ────────────────────────────────────────────────────────────────────
@router.post("/register", status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    # Validate role
    if body.role not in ("citizen", "collector"):
        raise HTTPException(status_code=400, detail="Role must be 'citizen' or 'collector'.")

    # Collectors need the secret passcode
    if body.role == "collector":
        if not body.secret_code or body.secret_code.strip() != COLLECTOR_SECRET:
            raise HTTPException(status_code=403, detail="Invalid collector passcode.")

    # Duplicate check
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = User(
        name      = body.name.strip(),
        email     = body.email.lower().strip(),
        phone     = body.phone,
        role      = body.role,
        hashed_pw = hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "Account created successfully.", "user": _user_payload(user)}


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    # Look up by email or phone
    user = (
        db.query(User)
        .filter(
            (User.email == body.identifier.lower().strip()) |
            (User.phone == body.identifier.strip())
        )
        .first()
    )

    if not user or not verify_password(body.password, user.hashed_pw):
        raise HTTPException(status_code=401, detail="Incorrect email/phone or password.")

    # Role check — prevent citizen logging in as collector and vice-versa
    if body.role and user.role != body.role and user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail=f"This account is registered as '{user.role}', not '{body.role}'."
        )

    token = create_access_token({"sub": user.id, "role": user.role})

    return {
        "access_token": token,
        "token_type":   "bearer",
        "user":         _user_payload(user),
    }
