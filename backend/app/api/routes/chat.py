import uuid
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse, SecurityInfo
from app.services.agent import run_agent

router = APIRouter()

DEMO_USERS = {
    "STU1001": "student",
    "STU1002": "student",
    "STU1003": "student",
    "ADMIN001": "admin",
}


def get_current_user(
    x_demo_user_id: str = Header(default="STU1001"),
    x_demo_role: str = Header(default="student"),
):
    user_id = x_demo_user_id.strip()
    if user_id not in DEMO_USERS:
        raise HTTPException(status_code=403, detail="Unknown demo user")
    actual_role = DEMO_USERS[user_id]
    return {"user_id": user_id, "role": actual_role}


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    request_id = str(uuid.uuid4())[:8]
    result = await run_agent(
        message=request.message,
        user_id=user["user_id"],
        user_role=user["role"],
        request_id=request_id,
        db=db,
        conversation_history=request.history,
    )
    return ChatResponse(
        response=result["response"],
        security=SecurityInfo(**result["security"]),
        tools_used=result["tools_used"],
        sources=result["sources"],
        latency_ms=result["latency_ms"],
    )
