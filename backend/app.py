"""
FastAPI backend for Mental Health Monitoring System.
Exposes /analyze endpoint using MentalBERT for text classification.
"""
import os
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from model import analyze_text, load_model, get_loaded_model_id

app = FastAPI(
    title="DeepEcho Mental Health API",
    description="MentalBERT-powered text analysis for mental health monitoring.",
    version="0.1.0",
)

# CORS: localhost for dev; set CORS_ORIGINS to your Vercel URL in production (e.g. https://your-app.vercel.app)
_cors_origins = os.environ.get("CORS_ORIGINS", "").strip()
if _cors_origins:
    allow_origins = [o.strip() for o in _cors_origins.split(",") if o.strip()]
else:
    allow_origins = [
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:3001", "http://127.0.0.1:3001",
        "http://localhost:3002", "http://127.0.0.1:3002",
        "http://localhost:3003", "http://127.0.0.1:3003",
        "https://mental-health-monitoring-one.vercel.app",
        "http://mental-health-monitoring-one.vercel.app",
    ]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    text: str


@app.on_event("startup")
def startup():
    """Preload MentalBERT at startup. Fails if MentalBERT cannot be loaded."""
    load_model()
    model_id = get_loaded_model_id()
    print(f"MentalBERT loaded: {model_id}")


@app.get("/health")
def health():
    """Returns status and the model in use (MentalBERT id or finetuned path)."""
    model_id = get_loaded_model_id()
    return {"status": "ok", "model": model_id or "not loaded yet"}


@app.post("/analyze")
def analyze(request: AnalyzeRequest):
    try:
        result = analyze_text(request.text)
        result["timestamp"] = datetime.utcnow().isoformat() + "Z"
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()  # So you see the full error in the terminal
        msg = str(e).strip() or "Unknown error"
        raise HTTPException(status_code=500, detail=msg)


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
