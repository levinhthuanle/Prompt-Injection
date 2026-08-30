from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = "default"
    history: Optional[List[Dict[str, str]]] = None


class SecurityInfo(BaseModel):
    risk_score: float
    blocked: bool
    reasons: List[str] = []
    event: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    security: SecurityInfo
    tools_used: List[Dict[str, Any]] = []
    sources: List[Dict[str, Any]] = []
    latency_ms: int = 0
