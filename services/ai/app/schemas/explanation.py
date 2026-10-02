"""
LifePass AI — AI Explanation Schemas
Workstream 2: AI + Document Intelligence
Contract Version: 1.0 (Frozen Baseline)
Reference: docs/AI_AGENT_SPEC.md & docs/API_CONTRACT.md
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ExplanationRequest(BaseModel):
    """
    Input to POST /ai/explain.
    Contains strictly deterministic system outputs — AI only explains these facts.
    """
    task_code: str = Field(..., description="Target task code e.g. education_loan")
    readiness_percent: float = Field(..., ge=0.0, le=100.0, description="Deterministic readiness percentage")
    matched: List[Dict[str, Any]] = Field(default_factory=list, description="List of matched requirements and records")
    missing: List[Dict[str, Any]] = Field(default_factory=list, description="List of missing required items")
    attention_needed: List[Dict[str, Any]] = Field(default_factory=list, description="List of items needing user review")


class ExplanationResult(BaseModel):
    """
    Natural language explanation generated strictly from supplied structured facts.
    Never fabricates missing records or claims verified status.
    """
    summary: str = Field(..., description="Executive summary of user readiness e.g. 'You have 4 of 5 required records.'")
    matched_explanation: Optional[str] = Field(default=None, description="Explanation of fulfilled requirements")
    missing_explanation: Optional[str] = Field(default=None, description="Explanation of missing records and next steps")
    action_items: List[str] = Field(default_factory=list, description="Actionable checklist for the user to reach 100% readiness")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Explanation confidence")
