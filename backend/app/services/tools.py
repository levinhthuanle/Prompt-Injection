import logging
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.db.models import Student, Course, Enrollment, Grade
from app.core.config import settings

logger = logging.getLogger("uniguard.tools")


def search_documents_tool(query: str) -> Dict[str, Any]:
    from app.services.rag import search_documents
    docs = search_documents(query, n_results=3)
    return {"results": docs, "count": len(docs)}


def get_course_info_tool(course_code: str, db: Session) -> Dict[str, Any]:
    course = db.query(Course).filter(Course.course_code == course_code.upper()).first()
    if not course:
        courses = db.query(Course).all()
        for c in courses:
            if course_code.lower() in c.name.lower():
                course = c
                break
    if not course:
        return {"error": f"Course '{course_code}' not found"}
    return {
        "course_code": course.course_code,
        "name": course.name,
        "description": course.description,
        "instructor": course.instructor,
        "credits": course.credits,
    }


def get_student_profile_tool(
    student_id: str,
    current_user_id: str,
    user_role: str,
    db: Session,
) -> Dict[str, Any]:
    if user_role == "student" and student_id != current_user_id:
        return {"error": "Access denied: students may only view their own profile"}

    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        return {"error": f"Student '{student_id}' not found"}

    profile: Dict[str, Any] = {
        "student_id": student.student_id,
        "name": student.name,
        "major": student.major,
        "year": student.year,
    }
    if user_role in ("admin", "self"):
        profile["email"] = student.email
        profile["phone"] = student.phone
        profile["gpa"] = student.gpa

    enrollments = (
        db.query(Enrollment, Course)
        .join(Course, Enrollment.course_id == Course.id)
        .filter(Enrollment.student_id == student.id)
        .all()
    )
    profile["enrolled_courses"] = [
        {"code": c.course_code, "name": c.name, "semester": e.semester}
        for e, c in enrollments
    ]
    return profile


def send_email_tool(
    to: str,
    subject: str,
    body: str,
    current_user_id: str,
) -> Dict[str, Any]:
    logger.info(f"[SIMULATED EMAIL] from={current_user_id} to={to} subject={subject}")
    return {
        "status": "simulated",
        "message": "Email action simulated successfully. No real email was sent.",
        "to": to,
        "subject": subject,
    }
