from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create the app instance FIRST
app = FastAPI()

# THEN add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Your existing routes go here
@app.get("/")
async def root():
    return {"message": "CivicPay Shield API is running"}

@app.post("/api/auth/register")
async def register():
    # Your registration logic here
    return {"message": "Registration endpoint"}

@app.post("/api/auth/login")
async def login():
    # Your login logic here
    return {"message": "Login endpoint"}

@app.post("/api/payments/initialize")
async def initialize_payment():
    # Your payment initialization logic here
    return {"message": "Payment initialization endpoint"}

@app.get("/api/admin/transactions")
async def get_transactions():
    # Your admin transactions logic here
    return {"message": "Admin transactions endpoint"}
