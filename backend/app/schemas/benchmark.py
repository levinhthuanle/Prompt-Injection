from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class BenchmarkRunRequest(BaseModel):
    security_mode: Optional[str] = "protected"
    categories: Optional[List[str]] = None
    max_cases: Optional[int] = None
    request_delay_s: Optional[float] = 1.0


class BenchmarkResult(BaseModel):
    timestamp: str
    model: str
    security_mode: str
    total_cases: int
    successful_attacks: int
    blocked_attacks: int
    safe_responses: int
    errors: int
    attack_success_rate: float
    defense_success_rate: float
    false_positive_rate: float
    average_latency_ms: float
    by_category: Dict[str, Any] = {}
    cases: List[Dict[str, Any]] = []
