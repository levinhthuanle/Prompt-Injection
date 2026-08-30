from fastapi import APIRouter
from app.services.security import get_recent_events, get_security_stats

router = APIRouter()


@router.get("/events")
def security_events(limit: int = 50):
    events = get_recent_events(limit)
    return {"events": events, "count": len(events)}


@router.get("/stats")
def security_stats():
    return get_security_stats()
