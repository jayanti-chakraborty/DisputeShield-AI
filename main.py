



from pathlib import Path
import os
import json
import re

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.genai import types

from paypal_service import create_order, capture_order, CLIENT_ID


# App setup
app = FastAPI(title="DisputeShield AI")

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("Gemini API Key not found in .env")


# Gemini Client (Fixed syntax for google-genai)
client = genai.Client(
    api_key=GEMINI_API_KEY
)


# Project folders
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

print("Frontend:", FRONTEND_DIR)
print("Transactions exists:", (FRONTEND_DIR / "transactions.html").exists())
print("Recommendations exists:", (FRONTEND_DIR / "recommendations.html").exists())


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:2222", "http://localhost:2222"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Frontend connection
app.mount(
    "/frontend",
    StaticFiles(directory=str(FRONTEND_DIR), html=True),
    name="frontend"
)


# Dispute validation
class Dispute(BaseModel):
    transaction_id: str = Field(min_length=3)
    customer_email: str
    amount: float = Field(gt=0)
    dispute_reason: str
    description: str = Field(min_length=10, max_length=2000)


# Payment validation
class PaymentRequest(BaseModel):
    amount: float = Field(gt=0)
    currency: str = "USD"


class CaptureRequest(BaseModel):
    order_id: str = Field(min_length=1)


# Home route
@app.get("/")
def home():
    return {
        "project": "DisputeShield AI",
        "status": "Running"
    }


# Status route
@app.get("/status")
def status():
    return {
        "project": "DisputeShield AI",
        "status": "Running"
    }


# PayPal configuration
@app.get("/paypal-config")
def paypal_config():
    if not CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="PayPal Client ID missing"
        )

    return {
        "client_id": CLIENT_ID,
        "currency": "USD"
    }


# Submit dispute
@app.post("/submit-dispute")
def submit_dispute(data: Dispute):
    return {
        "status": "success",
        "message": "Dispute submitted successfully",
        "transaction_id": data.transaction_id
    }


# Create PayPal order
@app.post("/create-paypal-order")
def create_paypal_order(data: PaymentRequest):
    try:
        return create_order(data.amount, data.currency)
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"PayPal order creation failed: {str(error)}"
        )


# Capture PayPal order
@app.post("/capture-paypal-order")
def capture_paypal_order(data: CaptureRequest):
    try:
        return capture_order(data.order_id)
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"PayPal capture failed: {str(error)}"
        )


# AI Dispute Analysis
from pathlib import Path
import os
import json
import re

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.genai import types

from paypal_service import create_order, capture_order, CLIENT_ID


# App setup
app = FastAPI(title="DisputeShield AI")

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("Gemini API Key not found in .env")


# Gemini Client (Fixed syntax for google-genai)
client = genai.Client(
    api_key=GEMINI_API_KEY
)


# Project folders
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

print("Frontend:", FRONTEND_DIR)
print("Transactions exists:", (FRONTEND_DIR / "transactions.html").exists())
print("Recommendations exists:", (FRONTEND_DIR / "recommendations.html").exists())


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:2222", "http://localhost:2222"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Frontend connection
app.mount(
    "/frontend",
    StaticFiles(directory=str(FRONTEND_DIR), html=True),
    name="frontend"
)


# Dispute validation
class Dispute(BaseModel):
    transaction_id: str = Field(min_length=3)
    customer_email: str
    amount: float = Field(gt=0)
    dispute_reason: str
    description: str = Field(min_length=10, max_length=2000)


# Payment validation
class PaymentRequest(BaseModel):
    amount: float = Field(gt=0)
    currency: str = "USD"


class CaptureRequest(BaseModel):
    order_id: str = Field(min_length=1)


# Home route
@app.get("/")
def home():
    return {
        "project": "DisputeShield AI",
        "status": "Running"
    }


# Status route
@app.get("/status")
def status():
    return {
        "project": "DisputeShield AI",
        "status": "Running"
    }


# PayPal configuration
@app.get("/paypal-config")
def paypal_config():
    if not CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="PayPal Client ID missing"
        )

    return {
        "client_id": CLIENT_ID,
        "currency": "USD"
    }


# Submit dispute
@app.post("/submit-dispute")
def submit_dispute(data: Dispute):
    return {
        "status": "success",
        "message": "Dispute submitted successfully",
        "transaction_id": data.transaction_id
    }


# Create PayPal order
@app.post("/create-paypal-order")
def create_paypal_order(data: PaymentRequest):
    try:
        return create_order(data.amount, data.currency)
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"PayPal order creation failed: {str(error)}"
        )


# Capture PayPal order
@app.post("/capture-paypal-order")
def capture_paypal_order(data: CaptureRequest):
    try:
        return capture_order(data.order_id)
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"PayPal capture failed: {str(error)}"
        )


# AI Dispute Analysis
from pathlib import Path
import os
import json
import re

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.genai import types

from paypal_service import create_order, capture_order, CLIENT_ID


# App setup
app = FastAPI(title="DisputeShield AI")

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("Gemini API Key not found in .env")


# Gemini Client (Fixed syntax for google-genai)
client = genai.Client(
    api_key=GEMINI_API_KEY
)


# Project folders
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

print("Frontend:", FRONTEND_DIR)
print("Transactions exists:", (FRONTEND_DIR / "transactions.html").exists())
print("Recommendations exists:", (FRONTEND_DIR / "recommendations.html").exists())


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:2222", "http://localhost:2222"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Frontend connection
app.mount(
    "/frontend",
    StaticFiles(directory=str(FRONTEND_DIR), html=True),
    name="frontend"
)


# Dispute validation
class Dispute(BaseModel):
    transaction_id: str = Field(min_length=3)
    customer_email: str
    amount: float = Field(gt=0)
    dispute_reason: str
    description: str = Field(min_length=10, max_length=2000)


# Payment validation
class PaymentRequest(BaseModel):
    amount: float = Field(gt=0)
    currency: str = "USD"


class CaptureRequest(BaseModel):
    order_id: str = Field(min_length=1)


# Home route
@app.get("/")
def home():
    return {
        "project": "DisputeShield AI",
        "status": "Running"
    }


# Status route
@app.get("/status")
def status():
    return {
        "project": "DisputeShield AI",
        "status": "Running"
    }


# PayPal configuration
@app.get("/paypal-config")
def paypal_config():
    if not CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="PayPal Client ID missing"
        )

    return {
        "client_id": CLIENT_ID,
        "currency": "USD"
    }


# Submit dispute
@app.post("/submit-dispute")
def submit_dispute(data: Dispute):
    return {
        "status": "success",
        "message": "Dispute submitted successfully",
        "transaction_id": data.transaction_id
    }


# Create PayPal order
@app.post("/create-paypal-order")
def create_paypal_order(data: PaymentRequest):
    try:
        return create_order(data.amount, data.currency)
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"PayPal order creation failed: {str(error)}"
        )


# Capture PayPal order
@app.post("/capture-paypal-order")
def capture_paypal_order(data: CaptureRequest):
    try:
        return capture_order(data.order_id)
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"PayPal capture failed: {str(error)}"
        )


# AI Dispute Analysis
@app.post("/analyze-dispute")
def analyze_dispute(data: Dispute):
   
    analysis_data = {
        "dispute_classification": "Fraudulent Transaction / Unauthorized Charge",
        "complaint_analysis": "The customer claims they did not authorize this transaction and noticed the charge unexpectedly.",
        "extracted_evidence": ["Transaction ID match", "Customer email verified", "Dispute reason provided"],
        "recommendations": ["Verify IP address logs", "Check shipping confirmation", "Issue temporary hold if necessary"],
        "risk_level": "Medium"
    }

    return {
        "status": "success",
        "transaction_id": data.transaction_id,
        "analysis": analysis_data
    }