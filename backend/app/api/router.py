from fastapi import APIRouter
from app.api.routes import chat, documents, attacks, benchmark, security

router = APIRouter()

router.include_router(chat.router, prefix="/chat", tags=["chat"])
router.include_router(documents.router, prefix="/documents", tags=["documents"])
router.include_router(attacks.router, prefix="/attacks", tags=["attacks"])
router.include_router(benchmark.router, prefix="/benchmark", tags=["benchmark"])
router.include_router(security.router, prefix="/security", tags=["security"])
