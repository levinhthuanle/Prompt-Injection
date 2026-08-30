import re
from typing import List
from app.core.config import settings

INJECTION_PATTERNS = [
    (r"ignore\s+(all\s+)?previous\s+instructions?", "instruction_override"),
    (r"ignore\s+(your\s+)?(system\s+)?(prompt|instructions?|policy|rules?)", "instruction_override"),
    (r"disregard\s+(all\s+)?(previous|your)\s+(instructions?|rules?|policies?)", "instruction_override"),
    (r"forget\s+(all\s+)?(previous|your)\s+(instructions?|context)", "instruction_override"),
    (r"reveal\s+(your\s+)?(system\s+prompt|hidden\s+instructions?|secret|confidential)", "system_prompt_extraction"),
    (r"show\s+(me\s+)?(your\s+)?(system\s+prompt|hidden\s+instructions?|private\s+context)", "system_prompt_extraction"),
    (r"print\s+(the\s+)?(confidential|private|secret|system)", "system_prompt_extraction"),
    (r"you\s+are\s+now\s+(an?\s+)?(admin|administrator|superuser|root|developer)", "role_confusion"),
    (r"pretend\s+(that\s+)?(security\s+restrictions?|you\s+are)", "role_confusion"),
    (r"act\s+as\s+(an?\s+)?(admin|superuser|unrestricted)", "role_confusion"),
    (r"bypass\s+(security|restrictions?|filters?|policies?)", "bypass_attempt"),
    (r"disable\s+(security|restrictions?|filters?|safety)", "bypass_attempt"),
    (r"override\s+(security|safety|restrictions?|policies?)", "bypass_attempt"),
    (r"developer\s+(mode|message|override)", "developer_mode"),
    (r"jailbreak", "jailbreak"),
    (r"dan\s*mode", "jailbreak"),
    (r"as\s+an?\s+AI\s+without\s+restrictions?", "jailbreak"),
    (r"for\s+debugging\s+purposes?,?\s+(show|reveal|print)", "system_prompt_extraction"),
    (r"output\s+(all|your)\s+(training|system|internal)", "system_prompt_extraction"),
]

SENSITIVE_STUDENT_ID_PATTERN = re.compile(r"STU\d{4}", re.IGNORECASE)
SENSITIVE_EMAIL_PATTERN = re.compile(r"\b[a-z0-9._%+-]+@[a-z0-9.-]+\.(edu|com)\b", re.IGNORECASE)
SENSITIVE_PHONE_PATTERN = re.compile(r"\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b")
SENSITIVE_GPA_PATTERN = re.compile(r"\bGPA[:\s]+[0-9]\.[0-9]+\b", re.IGNORECASE)
SENSITIVE_GRADE_PATTERN = re.compile(r"\b(grade[:\s]+[ABCDF][+-]?|[ABCDF][+-]?\s+grade)\b", re.IGNORECASE)


def detect_injection(text: str) -> dict:
    if not settings.enable_input_detection:
        return {"is_suspicious": False, "risk_score": 0.0, "reasons": []}

    reasons: List[str] = []
    score = 0.0
    lower = text.lower()

    for pattern, reason in INJECTION_PATTERNS:
        if re.search(pattern, lower):
            if reason not in reasons:
                reasons.append(reason)
            score += 0.35

    score = min(score, 1.0)
    return {
        "is_suspicious": bool(reasons),
        "risk_score": round(score, 2),
        "reasons": reasons,
    }


def detect_sensitive_output(text: str) -> dict:
    if not settings.enable_output_filter:
        return {"has_sensitive": False, "findings": []}

    findings = []
    internal_secret = settings.uniguard_internal_secret

    if internal_secret and internal_secret in text:
        findings.append("internal_secret")

    if SENSITIVE_STUDENT_ID_PATTERN.search(text):
        findings.append("student_id")
    if SENSITIVE_EMAIL_PATTERN.search(text):
        findings.append("email")
    if SENSITIVE_PHONE_PATTERN.search(text):
        findings.append("phone")
    if SENSITIVE_GPA_PATTERN.search(text):
        findings.append("gpa")
    if SENSITIVE_GRADE_PATTERN.search(text):
        findings.append("grade")

    return {"has_sensitive": bool(findings), "findings": findings}


def redact_sensitive(text: str) -> str:
    text = SENSITIVE_STUDENT_ID_PATTERN.sub("[STUDENT_ID REDACTED]", text)
    text = SENSITIVE_EMAIL_PATTERN.sub("[EMAIL REDACTED]", text)
    text = SENSITIVE_PHONE_PATTERN.sub("[PHONE REDACTED]", text)
    internal_secret = settings.uniguard_internal_secret
    if internal_secret:
        text = text.replace(internal_secret, "[SECRET REDACTED]")
    return text
