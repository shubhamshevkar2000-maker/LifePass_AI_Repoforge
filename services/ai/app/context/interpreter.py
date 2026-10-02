"""
LifePass AI — Deterministic Local Intent & Life-Stage Interpreter
Workstream 2: AI + Document Intelligence (Stage AI-2)
Reference: docs/AI_AGENT_SPEC.md Section 2.A & docs/TESTING_QA.md Section 6 ("Intent")
"""

import re
from typing import Dict, List, Optional, Tuple
from app.context.kb import CANONICAL_PROFILES, get_canonical_task_info
from app.schemas.intent import IntentDomain, InstitutionType
from app.schemas.context import TaskContext


# Deterministic pattern matching rules per canonical task
TASK_MATCHING_RULES: Dict[str, Tuple[List[str], List[str]]] = {
    # task_code: (high_weight_keywords, supporting_keywords)
    "education_loan": (
        ["education loan", "student loan", "study loan", "higher education loan", "college loan"],
        ["loan", "bank loan", "tuition loan", "borrow", "lender", "interest rate", "financing"],
    ),
    "college_admission": (
        ["college admission", "university admission", "apply to university", "apply to college", "higher education application"],
        ["admission", "admissions", "enrolment", "enrollment", "undergraduate", "postgraduate", "master's degree", "bachelor's degree"],
    ),
    "employment_verification": (
        ["employment verification", "background verification", "background check", "job verification", "pre-employment check"],
        ["job offer", "onboarding", "new employer", "join company", "relieving letter", "work experience", "joining"],
    ),
    "passport_application": (
        ["passport application", "apply for passport", "passport renewal", "reissue passport", "new passport"],
        ["passport office", "passport service", "consular passport", "travel document", "citizen passport"],
    ),
    "visa_application": (
        ["visa application", "apply for visa", "student visa", "travel visa", "work visa", "tourist visa"],
        ["embassy", "consulate", "immigration", "entry visa", "visa interview", "vfs"],
    ),
}

# Prompt injection markers to strip / ignore when interpreting
PROMPT_INJECTION_MARKERS = [
    r"system\s+override",
    r"ignore\s+(?:all\s+)?prior\s+instructions",
    r"ignore\s+(?:all\s+)?previous\s+instructions",
    r"grant\s+(?:me\s+)?(?:admin\s+)?access",
    r"mark\s+(?:me|this)?\s*(?:as)?\s*verified",
    r"approve\s+access",
    r"set\s+readiness\s*(?:to|=)?\s*100%?",
    r"become\s+admin",
    r"elevate\s+role",
    r"override\s+system",
    r"bypass\s+(?:rls|security|policy|consent)",
    r"change\s+user_id",
    r"ignore\s+consent",
]


def sanitize_input(text: str) -> str:
    """Removes leading/trailing whitespace and normalizes text for interpretation."""
    if not text:
        return ""
    return text.strip()


def interpret_task_deterministically(user_message: str) -> TaskContext:
    """
    Deterministically interprets user's goal into a TaskContext.
    
    1. Checks for empty or extremely vague inputs -> unknown_task + needs_clarification.
    2. Ignores embedded prompt injection commands.
    3. Evaluates weighted keywords against supported canonical tasks.
    4. Computes confidence and determines if clarification is needed.
    """
    clean_text = sanitize_input(user_message).lower()

    if not clean_text or len(clean_text) < 4:
        return TaskContext(
            type="unknown_task",
            label="Unrecognized Task",
            intent="unknown",
            domain=IntentDomain.GENERAL,
            institution_type=InstitutionType.OTHER,
            confidence=0.10,
            needs_clarification=True,
        )

    # Check for adversarial attempt with no genuine task
    for marker in PROMPT_INJECTION_MARKERS:
        clean_text = re.sub(marker, "", clean_text)
    clean_text = clean_text.strip()

    if not clean_text:
        # User input was purely injection command without any actual goal
        return TaskContext(
            type="unknown_task",
            label="Unrecognized Task",
            intent="unknown",
            domain=IntentDomain.GENERAL,
            institution_type=InstitutionType.OTHER,
            confidence=0.10,
            needs_clarification=True,
        )

    best_task = None
    best_score = 0.0

    for task_code, (primary_kws, supporting_kws) in TASK_MATCHING_RULES.items():
        score = 0.0

        for kw in primary_kws:
            if kw in clean_text:
                score += 5.0

        for kw in supporting_kws:
            if kw in clean_text:
                score += 1.5

        if score > best_score:
            best_score = score
            best_task = task_code

    if not best_task or best_score < 3.0:
        # Low confidence or ambiguous intent
        return TaskContext(
            type="unknown_task",
            label="Unrecognized Task",
            intent="general_inquiry",
            domain=IntentDomain.GENERAL,
            institution_type=InstitutionType.OTHER,
            confidence=0.25,
            needs_clarification=True,
        )

    info = get_canonical_task_info(best_task)
    if not info:
        return TaskContext(
            type="unknown_task",
            label="Unrecognized Task",
            intent="unknown",
            domain=IntentDomain.GENERAL,
            institution_type=InstitutionType.OTHER,
            confidence=0.20,
            needs_clarification=True,
        )

    # Compute normalized confidence (e.g. score >= 5 -> ~0.94; score=3 -> ~0.75)
    normalized_conf = min(0.96, best_score / (best_score + 0.35))
    confidence = round(normalized_conf, 2)

    needs_clarification = confidence < 0.70

    return TaskContext(
        type=best_task,
        label=info["label"],
        intent=info["intent"],
        domain=info["domain"],
        institution_type=info["institution_type"],
        confidence=confidence,
        needs_clarification=needs_clarification,
    )
