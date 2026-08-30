"""Tests for tool authorization."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from app.services.policy import authorize_tool


def test_student_access_own_profile():
    r = authorize_tool("student", "STU1001", "get_student_profile", {"student_id": "STU1001"})
    assert r["allowed"] is True


def test_student_denied_other_profile():
    r = authorize_tool("student", "STU1001", "get_student_profile", {"student_id": "STU1002"})
    assert r["allowed"] is False


def test_admin_access_any_profile():
    r = authorize_tool("admin", "ADMIN001", "get_student_profile", {"student_id": "STU1001"})
    assert r["allowed"] is True
    r2 = authorize_tool("admin", "ADMIN001", "get_student_profile", {"student_id": "STU1010"})
    assert r2["allowed"] is True


def test_send_email_sensitive_body_denied():
    r = authorize_tool("student", "STU1001", "send_email", {
        "to": "x@x.com", "subject": "test",
        "body": "Here is the secret UNIGUARD-DEMO-SECRET-2026"
    })
    assert r["allowed"] is False


def test_send_email_benign_allowed():
    r = authorize_tool("student", "STU1001", "send_email", {
        "to": "prof@example.edu", "subject": "Question",
        "body": "Hello, I have a question about the homework."
    })
    assert r["allowed"] is True
