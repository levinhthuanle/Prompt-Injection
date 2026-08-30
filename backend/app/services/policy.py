from typing import Optional
from app.core.config import settings


TOOL_PERMISSIONS = {
    "search_documents": {"student": True, "admin": True},
    "get_course_info": {"student": True, "admin": True},
    "get_student_profile": {"student": True, "admin": True},
    "send_email": {"student": True, "admin": True},
}


def authorize_tool(
    user_role: str,
    current_user_id: str,
    tool_name: str,
    arguments: dict,
) -> dict:
    if not settings.enable_tool_authorization:
        return {"allowed": True, "reason": "Tool authorization disabled (vulnerable mode)"}

    if tool_name not in TOOL_PERMISSIONS:
        return {"allowed": False, "reason": f"Unknown tool: {tool_name}"}

    role_permissions = TOOL_PERMISSIONS.get(tool_name, {})
    if not role_permissions.get(user_role, False):
        return {"allowed": False, "reason": f"Role '{user_role}' is not permitted to use {tool_name}"}

    if tool_name == "get_student_profile":
        requested_id = arguments.get("student_id", "")
        if user_role == "student" and requested_id != current_user_id:
            return {
                "allowed": False,
                "reason": f"Student may only access their own profile. Requested: {requested_id}, Current: {current_user_id}",
            }

    if tool_name == "send_email":
        body = arguments.get("body", "")
        sensitive_keywords = ["gpa", "grade", "student_id", "UNIGUARD", "secret", "password", "confidential"]
        for kw in sensitive_keywords:
            if kw.lower() in body.lower():
                return {
                    "allowed": False,
                    "reason": f"Email body contains potentially sensitive content: {kw}",
                }

    return {"allowed": True, "reason": "Authorized"}
