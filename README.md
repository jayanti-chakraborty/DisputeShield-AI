
# DisputeShield AI

AI-Powered Payment Dispute Analysis and Management Platform.

## Overview

DisputeShield AI is a payment dispute management platform designed to help analyze customer disputes, identify relevant evidence, assess risk levels, and provide recommendations.

## Key Features

- Customer dispute submission
- PayPal Sandbox payment integration
- AI-powered dispute classification
- Evidence extraction
- Risk level assessment
- AI-generated recommendations
- Interactive dashboard

## Technologies Used

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Python
- FastAPI
- Pydantic

### Payment Integration
- PayPal Sandbox

### AI Integration
- Google Gemini API

## Project Structure

- backend/ — FastAPI backend
- frontend/ — User interface

## Setup Instructions

1. Clone this repository.
2. Navigate to the backend directory.
3. Create and activate a Python virtual environment.
4. Install dependencies:

```bash
pip install -r requirements.txt
```

5. Configure the required environment variables in a `.env` file.
6. Start the backend:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 2222
```

7. Open the frontend through the backend server.

## Security

Never share API keys, PayPal secrets, or private credentials.

## License

This project is licensed under the MIT License.
