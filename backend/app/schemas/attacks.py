from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class AttackCase(BaseModel):
    id: str
    category: str
    name: str
    prompt: str
    target: str
    severity: str
    description: Optional[str] = ""
    expected_blocked: Optional[bool] = True


class RunAttackRequest(BaseModel):
    attack_id: str
    security_mode: Optional[str] = None
    user_id: Optional[str] = "STU1001"
    user_role: Optional[str] = "student"


class AttackResult(BaseModel):
    attack_id: str
    category: str
    name: str
    security_mode: str
    result: str
    response: str
    risk_score: float
    blocked: bool
    latency_ms: int
