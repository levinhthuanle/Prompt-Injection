from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging
from app.api.router import router
from app.db.database import check_db_health
from app.services.rag import check_chroma_health

setup_logging()

app = FastAPI(
    title="UniGuard AI",
    description="Security Evaluation Framework for Prompt Injection Attacks",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "db": "ok" if check_db_health() else "error",
        "chroma": "ok" if check_chroma_health() else "error",
        "gemini_configured": bool(settings.gemini_api_key),
        "security_mode": settings.security_mode,
    }
