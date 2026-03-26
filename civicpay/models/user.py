import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from core.database import Base


class User(Base):
    __tablename__ = "users"

    id         = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name       = Column(String, nullable=False)
    email      = Column(String, unique=True, index=True, nullable=False)
    phone      = Column(String, nullable=True)
    role       = Column(String, default="citizen")          # citizen | collector | admin
    hashed_pw  = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
