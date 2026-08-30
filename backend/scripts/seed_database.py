#!/usr/bin/env python3
"""Seed the database with synthetic university data."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal, engine
from app.db.models import Base, Student, Course, Enrollment, Grade

STUDENTS = [
    {"student_id": "STU1001", "name": "Alex Nguyen", "email": "alex.nguyen@example.edu",
     "phone": "555-101-0001", "major": "Computer Science", "year": 2, "gpa": 3.7},
    {"student_id": "STU1002", "name": "Minh Tran", "email": "minh.tran@example.edu",
     "phone": "555-101-0002", "major": "Data Science", "year": 3, "gpa": 3.5},
    {"student_id": "STU1003", "name": "Linh Pham", "email": "linh.pham@example.edu",
     "phone": "555-101-0003", "major": "Cybersecurity", "year": 1, "gpa": 3.9},
    {"student_id": "STU1004", "name": "Khoa Le", "email": "khoa.le@example.edu",
     "phone": "555-101-0004", "major": "Software Engineering", "year": 4, "gpa": 3.2},
    {"student_id": "STU1005", "name": "Hoa Bui", "email": "hoa.bui@example.edu",
     "phone": "555-101-0005", "major": "Computer Science", "year": 2, "gpa": 3.6},
    {"student_id": "STU1006", "name": "Duc Vo", "email": "duc.vo@example.edu",
     "phone": "555-101-0006", "major": "Information Systems", "year": 3, "gpa": 3.1},
    {"student_id": "STU1007", "name": "Thu Dang", "email": "thu.dang@example.edu",
     "phone": "555-101-0007", "major": "Data Science", "year": 1, "gpa": 3.8},
    {"student_id": "STU1008", "name": "Nam Hoang", "email": "nam.hoang@example.edu",
     "phone": "555-101-0008", "major": "Cybersecurity", "year": 4, "gpa": 2.9},
    {"student_id": "STU1009", "name": "Lan Ngo", "email": "lan.ngo@example.edu",
     "phone": "555-101-0009", "major": "Computer Science", "year": 2, "gpa": 3.4},
    {"student_id": "STU1010", "name": "Tuan Dinh", "email": "tuan.dinh@example.edu",
     "phone": "555-101-0010", "major": "Software Engineering", "year": 3, "gpa": 3.0},
    {"student_id": "ADMIN001", "name": "Admin User", "email": "admin@example.edu",
     "phone": "555-000-0000", "major": "Administration", "year": 0, "gpa": 0.0},
]

COURSES = [
    {"course_code": "CS101", "name": "Introduction to Programming",
     "description": "Fundamentals of programming using Python. Topics include variables, loops, functions, and basic data structures.",
     "instructor": "Prof. Johnson", "credits": 3},
    {"course_code": "CS201", "name": "Data Structures and Algorithms",
     "description": "Advanced data structures including trees, graphs, and hash tables. Algorithm analysis and design.",
     "instructor": "Prof. Smith", "credits": 4},
    {"course_code": "CS301", "name": "Operating Systems",
     "description": "Process management, memory management, file systems, and concurrency.",
     "instructor": "Prof. Williams", "credits": 3},
    {"course_code": "CS401", "name": "Computer Networks",
     "description": "Network architecture, protocols, TCP/IP, routing, and network security basics.",
     "instructor": "Prof. Brown", "credits": 3},
    {"course_code": "SEC101", "name": "Introduction to Cybersecurity",
     "description": "Foundational security concepts, threat modeling, cryptography basics, and security policies.",
     "instructor": "Prof. Davis", "credits": 3},
    {"course_code": "SEC201", "name": "Network Security",
     "description": "Firewalls, intrusion detection, VPNs, and secure network design.",
     "instructor": "Prof. Wilson", "credits": 3},
    {"course_code": "DS101", "name": "Introduction to Data Science",
     "description": "Data analysis with Python, statistical methods, and visualization techniques.",
     "instructor": "Prof. Anderson", "credits": 3},
    {"course_code": "DS201", "name": "Machine Learning",
     "description": "Supervised and unsupervised learning algorithms, model evaluation, and practical applications.",
     "instructor": "Prof. Taylor", "credits": 4},
    {"course_code": "MATH101", "name": "Calculus I",
     "description": "Limits, derivatives, and integrals of single-variable functions.",
     "instructor": "Prof. Martinez", "credits": 4},
    {"course_code": "MATH201", "name": "Linear Algebra",
     "description": "Vectors, matrices, linear transformations, eigenvalues, and applications to computer science.",
     "instructor": "Prof. Garcia", "credits": 3},
]

ENROLLMENTS = [
    ("STU1001", "CS101", "Fall 2025"), ("STU1001", "CS201", "Spring 2026"),
    ("STU1001", "MATH101", "Fall 2025"), ("STU1002", "DS101", "Fall 2025"),
    ("STU1002", "DS201", "Spring 2026"), ("STU1002", "MATH201", "Spring 2026"),
    ("STU1003", "SEC101", "Fall 2025"), ("STU1003", "CS101", "Fall 2025"),
    ("STU1003", "SEC201", "Spring 2026"), ("STU1004", "CS301", "Fall 2025"),
    ("STU1004", "CS401", "Spring 2026"), ("STU1005", "CS101", "Fall 2025"),
    ("STU1005", "MATH101", "Fall 2025"), ("STU1006", "DS101", "Fall 2025"),
    ("STU1007", "CS101", "Fall 2025"), ("STU1007", "DS101", "Fall 2025"),
    ("STU1008", "SEC101", "Fall 2025"), ("STU1008", "SEC201", "Spring 2026"),
    ("STU1009", "CS101", "Fall 2025"), ("STU1009", "CS201", "Spring 2026"),
    ("STU1010", "CS301", "Fall 2025"), ("STU1010", "CS401", "Spring 2026"),
]

GRADES = [
    ("STU1001", "CS101", "A"), ("STU1001", "MATH101", "B+"),
    ("STU1002", "DS101", "A-"), ("STU1002", "MATH201", "B"),
    ("STU1003", "SEC101", "A+"), ("STU1003", "CS101", "A"),
    ("STU1004", "CS301", "B+"), ("STU1005", "CS101", "A-"),
    ("STU1005", "MATH101", "B"), ("STU1006", "DS101", "B+"),
    ("STU1007", "CS101", "A"), ("STU1008", "SEC101", "B"),
    ("STU1009", "CS101", "B+"), ("STU1010", "CS301", "C+"),
]


def seed():
    print("Seeding database...")
    db = SessionLocal()
    try:
        if db.query(Student).count() > 0:
            print("Database already seeded. Skipping.")
            return

        student_map = {}
        for s in STUDENTS:
            obj = Student(**s)
            db.add(obj)
            db.flush()
            student_map[s["student_id"]] = obj.id

        course_map = {}
        for c in COURSES:
            obj = Course(**c)
            db.add(obj)
            db.flush()
            course_map[c["course_code"]] = obj.id

        for sid, cid, sem in ENROLLMENTS:
            if sid in student_map and cid in course_map:
                db.add(Enrollment(student_id=student_map[sid], course_id=course_map[cid], semester=sem))

        for sid, cid, grade in GRADES:
            if sid in student_map and cid in course_map:
                db.add(Grade(student_id=student_map[sid], course_id=course_map[cid], grade=grade))

        db.commit()
        print(f"Seeded {len(STUDENTS)} students, {len(COURSES)} courses, {len(ENROLLMENTS)} enrollments, {len(GRADES)} grades.")
    except Exception as e:
        print(f"Seed error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
