import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id             = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    receipt_id     = Column(String, unique=True, index=True, nullable=False)
    payer_name     = Column(String, nullable=False)
    levy_type      = Column(String, nullable=False)
    amount         = Column(Float,  nullable=False)
    payment_method = Column(String, default="card")   # card | bank_transfer | cash
    vehicle_number = Column(String, nullable=True)
    phone          = Column(String, nullable=True)
    collected_by   = Column(String, nullable=True)    # collector name for cash payments
    status         = Column(String, default="pending") # pending | paid | flagged
    user_id        = Column(String, ForeignKey("users.id"), nullable=True)
    created_at     = Column(DateTime, default=datetime.utcnow)
    updated_at     = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
