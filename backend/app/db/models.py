from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone = Column(String(20))
    major = Column(String(100))
    year = Column(Integer)
    gpa = Column(Float)

    enrollments = relationship("Enrollment", back_populates="student")
    grades = relationship("Grade", back_populates="student")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    course_code = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    instructor = Column(String(100))
    credits = Column(Integer)

    enrollments = relationship("Enrollment", back_populates="course")
    grades = relationship("Grade", back_populates="course")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    semester = Column(String(20))

    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    grade = Column(String(5))

    student = relationship("Student", back_populates="grades")
    course = relationship("Course", back_populates="grades")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(50), index=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    user_id = Column(String(50))
    role = Column(String(20))
    event_type = Column(String(50))
    risk_score = Column(Float, nullable=True)
    tool_name = Column(String(50), nullable=True)
    allowed = Column(String(5), nullable=True)
    reason = Column(Text, nullable=True)
    details = Column(JSON, nullable=True)
    security_mode = Column(String(20))
