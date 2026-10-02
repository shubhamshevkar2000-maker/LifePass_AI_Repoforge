"""
LifePass AI — Intent & Life-Stage Understanding Schemas
Workstream 2: AI + Document Intelligence
Contract Version: 1.0 (Frozen Baseline)
Reference: docs/AI_AGENT_SPEC.md & docs/API_CONTRACT.md
"""

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class IntentDomain(str, Enum):
    """Life-stage domains supported by LifePass."""
    EDUCATION = "education"
    FINANCE = "finance"
    EMPLOYMENT = "employment"
    IDENTITY = "identity"
    GENERAL = "general"


class InstitutionType(str, Enum):
    """Target institution types mapped to life-stage workflows."""
    BANK = "bank"
    UNIVERSITY = "university"
    EMPLOYER = "employer"
    GOVERNMENT = "government"
    OTHER = "other"


class IntentRequest(BaseModel):
    """Natural language user message submitted to /ai/intent."""
    message: str = Field(..., min_length=1, max_length=2000, description="Raw user prompt or life-stage goal")


class IntentResult(BaseModel):
    """
    Structured intent representation parsed by LLM.
    Strictly conforms to API_CONTRACT.md POST /ai/intent schema.
    """
    intent: str = Field(..., description="High-level intent code, e.g. loan_application")
    task: str = Field(..., description="Specific task code, e.g. education_loan")
    domain: IntentDomain = Field(..., description="Life-stage domain")
    institution_type: InstitutionType = Field(..., description="Target institution category")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model classification confidence between 0.0 and 1.0")
    needs_clarification: bool = Field(default=False, description="Flag set if intent is ambiguous or confidence is low")
    clarification_prompt: Optional[str] = Field(default=None, description="Prompt to request more user context if needed")
