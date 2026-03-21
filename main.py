import datetime
import uuid
import os
import base64
import requests
import random

from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    email: str
    password: str
    role: str
    secret_code: Optional[str] = None  # Add this line!
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
    allow_origins=["http://localhost:5173"], 
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

def generate_otp():
    """Generates a secure 6-digit One Time Password."""
    return str(random.randint(100000, 999999))

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
    # 1. Grab your secret keys securely from the .env file
    client_id = os.getenv("INTERSWITCH_CLIENT_ID").strip()
    secret_key = os.getenv("INTERSWITCH_SECRET_KEY").strip()

    print(f"DEBUG CHECK - Client ID ends in: {str(client_id)[-4:]}")
    print(f"DEBUG CHECK - Secret Key ends in: {str(secret_key)[-4:]}")

    if not client_id or not secret_key:
        raise HTTPException(status_code=500, detail="Interswitch credentials missing in environment.")

    # 2. Interswitch requires the keys to be combined and Base64 encoded
    auth_string = f"{client_id}:{secret_key}"
    encoded_auth = base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')

    # 3. Prepare the request
    url = "https://sandbox.interswitchng.com/passport/oauth/token"
    headers = {
        "Authorization": f"Basic {encoded_auth}",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
    }
    payload = {"grant_type": "client_credentials"}

    # 4. Knock on Interswitch's door
    try:
        response = requests.post(url, headers=headers, data=payload)
        response.raise_for_status()  # This will trigger the exception below if they reject us
        
        # 5. Success! Extract the golden ticket
        return response.json().get("access_token")
        
    except requests.exceptions.RequestException as e:
        print(f"Interswitch Auth Error: {e}")
        raise HTTPException(status_code=502, detail="Failed to securely connect to Interswitch servers.")

# --- MODELS ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "citizen" 

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PhoneRequest(BaseModel):
    phone_number: str

class OTPVerification(BaseModel):
    otp_code: str

class PaymentRequest(BaseModel):
    email: EmailStr
    amount: float
    levy_type: str

# --- AUTHENTICATION ENDPOINTS ---
@app.post("/api/auth/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    
    # --- SECURITY PATCH: Lock down privileged accounts ---
    if user.role in ["admin", "collector"]:
        # For the hackathon, we hardcode the master key. 
        if user.secret_code != "CIVIC_VIP_2026":
            raise HTTPException(
                status_code=403, 
                detail="Access Denied: Invalid security code for privileged role."
            )
    # --- END SECURITY PATCH ---

    existing_user = db.query(UserDB).filter(UserDB.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered.")

    hashed_pwd = get_password_hash(user.password)
    # Default to citizen if they try to bypass with a weird role
    safe_role = user.role if user.role in ["admin", "collector", "citizen"] else "citizen"
    
    new_user = UserDB(email=user.email, hashed_password=hashed_pwd, role=safe_role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"status": "success", "message": f"New {safe_role} account created successfully."}
@app.post("/api/auth/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token_data = {"sub": db_user.email, "role": db_user.role}
    access_token = create_access_token(token_data)

    return {"status": "success", "access_token": access_token, "token_type": "bearer", "role": db_user.role}

@app.post("/api/auth/send-otp")
def send_otp(request: PhoneRequest, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    """Generates an OTP, saves it, and simulates sending an SMS."""
    
    # 1. Generate the secure 6-digit code
    otp = generate_otp()
    
    # 2. Save their phone number and the secret code to the database
    current_user.phone_number = request.phone_number
    current_user.otp_code = otp
    db.commit()
    
    # 3. MOCK SMS PROVIDER (Saves us money on Twilio/Termii during the hackathon!)
    print("\n" + "=" * 50)
    print(f"📱 NEW SMS TO {request.phone_number}:")
    print(f"Your CivicPay Shield security code is: {otp}")
    print("=" * 50 + "\n")
    
    return {"status": "success", "message": "OTP sent successfully. Check your phone (or terminal!)."}

@app.post("/api/auth/verify-otp")
def verify_otp(request: OTPVerification, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    """Checks if the citizen provided the correct OTP."""
    
    # 1. Did they guess wrong?
    if not current_user.otp_code or current_user.otp_code != request.otp_code:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")
        
    # 2. They got it right! Upgrade their account security status
    current_user.is_phone_verified = True
    current_user.otp_code = None # Clear it out so it can't be used twice
    db.commit()
    
    return {"status": "success", "message": "Phone number fully verified! Your account is secured."}

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

# HACKATHON BYPASS MODE
# Set this to False later when Interswitch servers fix themselves!
MOCK_INTERSWITCH = True 

@app.get("/api/payments/verify/{transaction_ref}")
def verify_payment(transaction_ref: str, db: Session = Depends(get_db)):
    if MOCK_INTERSWITCH:
        print("⚠️ USING MOCKED INTERSWITCH RESPONSE")
        
        # 1. Update your local database (Simulating a successful payment)
        db_transaction = db.query(TransactionDB).filter(TransactionDB.transaction_ref == transaction_ref).first()
        if db_transaction:
            db_transaction.status = "paid"
            db.commit()
            
        return {
            "status": "success",
            "message": "Payment securely verified (HACKATHON MOCK MODE).",
            "transaction_reference": transaction_ref,
            "interswitch_payload": {
                "ResponseCode": "00", 
                "Amount": 5000,
                "PaymentDate": "2026-03-18T09:30:00"
            }
        }

    # --- THE REAL CODE (Runs when MOCK_INTERSWITCH = False) ---
    token = get_interswitch_access_token()
    url = f"https://sandbox.interswitchng.com/api/v2/quickteller/transactions/query?transactionReference={transaction_ref}"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    try:
        response = requests.get(url, headers=headers)
        interswitch_data = response.json()
        return {
            "status": "success",
            "message": "Transaction securely verified with Interswitch.",
            "transaction_reference": transaction_ref,
            "interswitch_payload": interswitch_data
        }
    except requests.exceptions.RequestException as e:
        print(f"Interswitch Verification Error: {e}")
        raise HTTPException(status_code=502, detail="Could not reach Interswitch verification servers.")

# --- ADMIN DASHBOARD ---
@app.get("/api/admin/transactions")
def get_all_transactions(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    # Strict Security Check: Are they an admin?
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden: You do not have the required clearance to view this data.")

    transactions = db.query(TransactionDB).order_by(TransactionDB.created_at.desc()).limit(50).all()

    return {"status": "success", "total_records_returned": len(transactions), "data": transactions}

# --- CITIZEN DASHBOARD ---
@app.get("/api/payments/history")
def get_citizen_history(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    # 1. Strict Security Check: Ensure admins don't accidentally use the citizen portal
    if current_user.role != "citizen":
        raise HTTPException(status_code=403, detail="Forbidden: This portal is for citizens only.")

    # 2. Query the database, filtering ONLY by the logged-in user's email
    transactions = db.query(TransactionDB).filter(
        TransactionDB.email == current_user.email
    ).order_by(TransactionDB.created_at.desc()).all()

    # 3. Return their personal receipt history
    return {
        "status": "success",
        "message": "Personal payment history retrieved successfully.",
        "total_records": len(transactions),
        "data": transactions
    }