
import os
import requests
from dotenv import load_dotenv

load_dotenv()

PAYPAL_BASE_URL = os.getenv(
    "PAYPAL_BASE_URL",
    "https://api-m.sandbox.paypal.com"
)

CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")


def get_access_token():

    if not CLIENT_ID or not CLIENT_SECRET:
        raise ValueError("PayPal credentials missing in .env")

    response = requests.post(
        f"{PAYPAL_BASE_URL}/v1/oauth2/token",
        auth=(CLIENT_ID, CLIENT_SECRET),
        data={"grant_type": "client_credentials"},
        headers={"Accept": "application/json"},
        timeout=30
    )

    response.raise_for_status()
    return response.json()["access_token"]


def create_order(amount, currency="USD"):

    token = get_access_token()

    response = requests.post(
        f"{PAYPAL_BASE_URL}/v2/checkout/orders",
        json={
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "amount": {
                        "currency_code": currency,
                        "value": f"{float(amount):.2f}"
                    }
                }
            ]
        },
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        },
        timeout=30
    )

    response.raise_for_status()
    return response.json()


def capture_order(order_id):

    token = get_access_token()

    response = requests.post(
        f"{PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}/capture",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        },
        timeout=30
    )

    response.raise_for_status()
    return response.json()
