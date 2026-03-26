"""
GET  /api/payments/history          — citizen's own transaction history
POST /api/payments/initialize       — create a new payment (citizen or collector cash)
GET  /api/payments/verify/{receipt} — verify a receipt (used by collector)
"""
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from models.transaction import Transaction
from models.user import User

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────
class PaymentRequest(BaseModel):
    levy_type:      str
    amount:         float
    payer_name:     str
    vehicle_number: str | None = None
    payment_method: str = "card"         # card | bank_transfer | cash
    otp:            str | None = None    # OTP the frontend sends; validate with Interswitch in prod
    phone:          str | None = None
    collected_by:   str | None = None   # collector name for cash payments


# ── Helpers ───────────────────────────────────────────────────────────────────
def _txn_dict(t: Transaction) -> dict:
    return {
        "id":             t.id,
        "receipt_id":     t.receipt_id,
        "payer_name":     t.payer_name,
        "levy_type":      t.levy_type,
        "amount":         t.amount,
        "payment_method": t.payment_method,
        "vehicle_number": t.vehicle_number,
        "status":         t.status,
        "is_valid":       t.status in ("paid", "completed"),
        "created_at":     t.created_at.isoformat() + "Z",
    }


def _generate_receipt_id() -> str:
    """RCT-XXXXX format."""
    short = str(uuid.uuid4()).replace("-", "").upper()[:5]
    return f"RCT-{short}"


# ── Routes ────────────────────────────────────────────────────────────────────
@router.get("/history")
def get_history(
    current_user: User     = Depends(get_current_user),
    db:           Session  = Depends(get_db),
):
    """Return all transactions for the currently logged-in citizen."""
    txns = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.created_at.desc())
        .all()
    )
    txn_list = [_txn_dict(t) for t in txns]
    paid_sum  = sum(t["amount"] for t in txn_list if t["status"] in ("paid", "completed"))

    return {
        "transactions": txn_list,
        "balance":      paid_sum,
    }


@router.post("/initialize", status_code=201)
def initialize_payment(
    body:         PaymentRequest,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    """
    Create a payment record.

    In production you would:
      1. Call the Interswitch payment API here with body.amount and body.payment_method.
      2. Validate body.otp with your OTP provider.
      3. Only mark status='paid' after the gateway confirms success.

    For local dev, every request succeeds immediately.
    """
    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")

    txn = Transaction(
        receipt_id     = _generate_receipt_id(),
        payer_name     = body.payer_name.strip(),
        levy_type      = body.levy_type,
        amount         = body.amount,
        payment_method = body.payment_method,
        vehicle_number = body.vehicle_number,
        phone          = body.phone,
        collected_by   = body.collected_by,
        status         = "paid",          # ← mark confirmed; swap for gateway result in prod
        user_id        = current_user.id,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)

    return _txn_dict(txn)


@router.get("/verify/{receipt_id}")
def verify_payment(
    receipt_id:   str,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    """Look up a receipt by its ID. Used by collectors to verify citizen payments."""
    txn = (
        db.query(Transaction)
        .filter(
            (Transaction.receipt_id == receipt_id) |
            (Transaction.id         == receipt_id)
        )
        .first()
    )
    if not txn:
        raise HTTPException(status_code=404, detail=f"Receipt '{receipt_id}' not found.")

    return _txn_dict(txn)
