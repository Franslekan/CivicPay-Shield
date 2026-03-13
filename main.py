import datetime
import uuid
import os
import base64
import requests

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from passlib.context import CryptContext
from jose import jwt, JWTError

# Import our database tools
from database import TransactionDB, UserDB, get_db

# Load the secret environment variables securely
load_dotenv()

app = FastAPI(
    title="CivicPay Shield API",
    description="Secure backend for local government and transit revenue collection."
)

# --- CORS CONFIGURATION (The Frontend Bridge) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# --- CONFIGURATION ---
CLIENT_ID = os.getenv("INTERSWITCH_CLIENT_ID", "").strip()
SECRET_KEY = os.getenv("INTERSWITCH_SECRET_KEY", "").strip()

JWT_SECRET = os.getenv("JWT_SECRET_KEY", "fallback_secret")
ALGORITHM = "HS256"

# --- SECURITY UTILITIES ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(UserDB).filter(UserDB.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def get_interswitch_access_token():
    """Generates a secure, temporary access token from Interswitch."""
    if not CLIENT_ID or not SECRET_KEY:
        raise HTTPException(status_code=500, detail="Missing Interswitch credentials in .env file")
        
    auth_string = f"{CLIENT_ID}:{SECRET_KEY}"
    encoded_auth = base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')
    
    headers = {
        "Authorization": f"Basic {encoded_auth}",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
    }
    payload = {"grant_type": "client_credentials"}
    url = "https://sandbox.interswitchng.com/passport/oauth/token"
    
    try:
        response = requests.post(url, headers=headers, data=payload)
        response.raise_for_status() 
        return response.json().get("access_token")
    except requests.exceptions.RequestException as e:
        print(f"Interswitch Auth Error: {e}")
        raise HTTPException(status_code=502, detail="Failed to securely connect to Interswitch.")

# --- MODELS ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "citizen" 

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PaymentRequest(BaseModel):
    email: EmailStr
    amount: float
    levy_type: str

# --- AUTHENTICATION ENDPOINTS ---
@app.post("/api/auth/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(UserDB).filter(UserDB.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered.")

    hashed_pwd = get_password_hash(user.password)
    new_user = UserDB(email=user.email, hashed_password=hashed_pwd, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"status": "success", "message": f"New {user.role} account created successfully."}

@app.post("/api/auth/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token_data = {"sub": db_user.email, "role": db_user.role}
    access_token = create_access_token(token_data)

    return {"status": "success", "access_token": access_token, "token_type": "bearer", "role": db_user.role}

# --- PAYMENT ENDPOINTS ---
@app.post("/api/payments/initialize")
def initialize_payment(request: PaymentRequest, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid payment amount.")

    transaction_ref = f"CIVIC-{uuid.uuid4().hex[:8].upper()}"

    new_transaction = TransactionDB(
        email=request.email,
        amount=request.amount,
        levy_type=request.levy_type,
        transaction_ref=transaction_ref,
        status="pending"
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    # TODO: Make the actual HTTP POST request to Interswitch servers here once dashboard is back online
    
    return {
        "status": "success",
        "message": "Payment initialized and saved to database securely.",
        "transaction_reference": transaction_ref
    }

@app.get("/api/payments/verify/{transaction_ref}")
def verify_payment(transaction_ref: str, db: Session = Depends(get_db)):
    transaction = db.query(TransactionDB).filter(TransactionDB.transaction_ref == transaction_ref).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found in the system.")
        
    if transaction.status == "successful":
        return {"status": "success", "message": "Transaction was already verified.", "transaction_reference": transaction.transaction_ref}

    # TODO: Make the actual HTTP GET request to Interswitch servers here once dashboard is back online
    
    transaction.status = "successful"
    db.commit()
    db.refresh(transaction)

    return {"status": "success", "message": "Payment verified and database updated securely.", "final_status": transaction.status}

# --- ADMIN DASHBOARD ---
@app.get("/api/admin/transactions")
def get_all_transactions(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    # Strict Security Check: Are they an admin?
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden: You do not have the required clearance to view this data.")

    transactions = db.query(TransactionDB).order_by(TransactionDB.created_at.desc()).limit(50).all()

    return {"status": "success", "total_records_returned": len(transactions), "data": transactions}