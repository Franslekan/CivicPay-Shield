from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker
import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./civicpay.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 1. The User Table
class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="citizen")
    
    # --- NEW SECURITY & OTP FIELDS ---
    phone_number = Column(String, nullable=True)
    is_phone_verified = Column(Boolean, default=False)
    otp_code = Column(String, nullable=True)

# 2. The Transaction Table
class TransactionDB(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    amount = Column(Float)
    levy_type = Column(String)
    transaction_ref = Column(String, unique=True, index=True)
    status = Column(String, default="pending") 
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()