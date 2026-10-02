"""
LifePass AI — Deterministic & Structured Explanation Generator
Workstream 2: AI + Document Intelligence (Stage AI-2)
Reference: docs/AI_AGENT_SPEC.md Section 2.E & docs/API_CONTRACT.md POST /ai/explain
"""

from typing import List
from app.schemas.explanation import ExplanationRequest, ExplanationResult


def generate_readiness_explanation(request: ExplanationRequest) -> ExplanationResult:
    """
    Translates deterministic matching facts into understandable, human-friendly language.
    Strictly follows AI_AGENT_SPEC.md Section 2.E:
    "The explanation must use only supplied structured facts. Never guess or synthesize."
    """
    total_matched = len(request.matched)
    total_missing = len(request.missing)
    total_attention = len(request.attention_needed)
    total_required = total_matched + total_missing

    # 1. Executive Summary
    if total_missing == 0 and total_attention == 0:
        summary = (
            f"All {total_matched} required records are present and validated. "
            f"Your readiness is {int(request.readiness_percent)}%."
        )
    elif total_missing > 0:
        missing_names = [
            m.get("name") or m.get("requirement_name") or m.get("code") or m.get("requirement_code") or "Document"
            for m in request.missing
        ]
        missing_str = ", ".join(missing_names)
        summary = (
            f"You have {total_matched} of the {total_required} required records. "
            f"Your {missing_str} is missing."
        )
    else:
        summary = (
            f"You have matched {total_matched} required records, but {total_attention} "
            f"item(s) require review."
        )

    # 2. Matched Explanation
    if total_matched > 0:
        matched_labels = [
            m.get("name") or m.get("requirement_name") or m.get("code") or m.get("requirement_code") or "Record"
            for m in request.matched
        ]
        matched_explanation = (
            f"The following required records have been matched: {', '.join(matched_labels)}."
        )
    else:
        matched_explanation = "No matching records have been identified yet."

    # 3. Missing Explanation
    if total_missing > 0:
        missing_labels = [
            m.get("name") or m.get("requirement_name") or m.get("code") or m.get("requirement_code") or "Record"
            for m in request.missing
        ]
        missing_explanation = (
            f"The following required documents are still needed to complete your application: "
            f"{', '.join(missing_labels)}."
        )
    else:
        missing_explanation = "No required records are missing."

    # 4. Action Items
    action_items: List[str] = []
    for item in request.missing:
        name = item.get("name") or item.get("requirement_name") or item.get("code") or item.get("requirement_code") or "document"
        action_items.append(f"Upload or import your {name}.")

    for item in request.attention_needed:
        name = item.get("name", item.get("code", "record"))
        reason = item.get("reason", "requires attention")
        action_items.append(f"Review {name}: {reason}.")

    if not action_items:
        action_items.append("Your application package is complete and ready for review.")

    return ExplanationResult(
        summary=summary,
        matched_explanation=matched_explanation,
        missing_explanation=missing_explanation,
        action_items=action_items,
        confidence=1.0,
    )
