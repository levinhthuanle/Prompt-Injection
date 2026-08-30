"""Benchmark runner script."""
import sys
import os
import asyncio
import json
import uuid
from datetime import datetime, timezone
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pathlib import Path

ATTACKS_FILE = Path(__file__).parent.parent / "data" / "attacks" / "attack_cases.json"


def load_cases():
    with open(ATTACKS_FILE) as f:
        return json.load(f)


def test_load_cases():
    cases = load_cases()
    assert len(cases) >= 50, f"Expected at least 50 cases, got {len(cases)}"


def test_case_schema():
    cases = load_cases()
    required = {"id", "category", "name", "prompt", "target", "severity"}
    for case in cases:
        for field in required:
            assert field in case, f"Missing field '{field}' in case {case.get('id')}"


def test_categories_present():
    cases = load_cases()
    categories = {c["category"] for c in cases}
    assert "direct" in categories
    assert "indirect" in categories
    assert "tool_hijacking" in categories
    assert "data_exfiltration" in categories


def test_metrics_calculation():
    total = 50
    blocked = 40
    success = 10
    asr = success / total
    dsr = blocked / total
    assert round(asr, 2) == 0.2
    assert round(dsr, 2) == 0.8
    assert asr + dsr == 1.0
