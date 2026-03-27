"""
GET  /api/admin/transactions                    — all transactions + stats (collector/admin)
POST /api/admin/transactions/{id}/approve       — mark a transaction as paid
POST /api/admin/transactions/{id}/flag          — flag a transaction for review
"""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import require_collector
from models.transaction import Transaction
from models.user import User

router = APIRouter()


def _txn_dict(t: Transaction) -> dict:
    return {
        "id":             t.id,
        "receipt_id":     t.receipt_id,
        "payer_name":     t.payer_name,
        "levy_type":      t.levy_type,
        "amount":         t.amount,
        "payment_method": t.payment_method,
        "collected_by":   t.collected_by,
        "status":         t.status,
        "is_valid":       t.status in ("paid", "completed"),
        "created_at":     t.created_at.isoformat() + "Z",
    }


@router.get("/transactions")
def get_all_transactions(
    current_user: User    = Depends(require_collector),
    db:           Session = Depends(get_db),
):
    """Return every transaction with aggregate stats."""
    txns = db.query(Transaction).order_by(Transaction.created_at.desc()).all()

    txn_list = [_txn_dict(t) for t in txns]

    stats = {
        "total_volume":      sum(t["amount"] for t in txn_list),
        "transaction_count": len(txn_list),
        "verified_count":    sum(1 for t in txn_list if t["status"] in ("paid", "completed")),
        "pending_count":     sum(1 for t in txn_list if t["status"] == "pending"),
    }

    return {"transactions": txn_list, "stats": stats}


@router.post("/transactions/{transaction_id}/approve")
def approve_transaction(
    transaction_id: str,
    current_user:   User    = Depends(require_collector),
    db:             Session = Depends(get_db),
):
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    txn.status     = "paid"
    txn.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(txn)

    return {"message": "Transaction approved.", "transaction": _txn_dict(txn)}


@router.post("/transactions/{transaction_id}/flag")
def flag_transaction(
    transaction_id: str,
    current_user:   User    = Depends(require_collector),
    db:             Session = Depends(get_db),
):
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    txn.status     = "flagged"
    txn.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(txn)

    return {"message": "Transaction flagged for review.", "transaction": _txn_dict(txn)}
