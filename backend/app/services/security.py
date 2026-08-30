import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.db.models import AuditLog
from app.core.config import settings

logger = logging.getLogger("uniguard.audit")

_in_memory_logs: list = []


def log_event(
    db: Session,
    request_id: str,
    user_id: str,
    role: str,
    event_type: str,
    security_mode: str,
    risk_score: Optional[float] = None,
    tool_name: Optional[str] = None,
    allowed: Optional[str] = None,
    reason: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
):
    entry = AuditLog(
        request_id=request_id,
        user_id=user_id,
        role=role,
        event_type=event_type,
        security_mode=security_mode,
        risk_score=risk_score,
        tool_name=tool_name,
        allowed=allowed,
        reason=reason,
        details=details,
    )
    try:
        db.add(entry)
        db.commit()
        db.refresh(entry)
        _in_memory_logs.append({
            "id": entry.id,
            "request_id": request_id,
            "timestamp": entry.timestamp.isoformat(),
            "user_id": user_id,
            "role": role,
            "event_type": event_type,
            "security_mode": security_mode,
            "risk_score": risk_score,
            "tool_name": tool_name,
            "allowed": allowed,
            "reason": reason,
        })
        if len(_in_memory_logs) > 500:
            _in_memory_logs.pop(0)
    except Exception as e:
        logger.error(f"Failed to write audit log: {e}")
        db.rollback()


def get_recent_events(limit: int = 100) -> list:
    return list(reversed(_in_memory_logs[-limit:]))


def get_security_stats() -> Dict[str, Any]:
    total = len(_in_memory_logs)
    suspicious = sum(1 for e in _in_memory_logs if e.get("event_type") == "PROMPT_INJECTION_DETECTED")
    blocked_tools = sum(1 for e in _in_memory_logs if e.get("event_type") == "TOOL_DENIED")
    blocked_outputs = sum(1 for e in _in_memory_logs if e.get("event_type") == "SENSITIVE_OUTPUT_BLOCKED")
    chat_requests = sum(1 for e in _in_memory_logs if e.get("event_type") == "CHAT_REQUEST")

    return {
        "security_mode": settings.security_mode,
        "total_requests": chat_requests,
        "suspicious_requests": suspicious,
        "blocked_tool_calls": blocked_tools,
        "blocked_sensitive_outputs": blocked_outputs,
    }
