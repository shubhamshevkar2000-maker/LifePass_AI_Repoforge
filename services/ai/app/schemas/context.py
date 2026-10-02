"""
LifePass AI — Life-Stage Context Engine Schemas
Workstream 2: AI + Document Intelligence (Stage AI-2)
Contract Version: 1.0 (Frozen Baseline)
Reference: docs/AI_AGENT_SPEC.md, docs/API_CONTRACT.md, docs/PRODUCT_SPEC.md
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.intent import IntentDomain, InstitutionType


class TaskContext(BaseModel):
    """
    Structured representation of an interpreted life-stage task.
    """
    type: str = Field(..., description="Canonical task code e.g. education_loan, college_admission")
    label: str = Field(..., description="Human-readable task label e.g. Education Loan Application")
    intent: str = Field(default="application", description="High-level intent category e.g. loan_application")
    domain: IntentDomain = Field(..., description="Life-stage domain")
    institution_type: InstitutionType = Field(..., description="Target institution category")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Classification confidence between 0.0 and 1.0")
    needs_clarification: bool = Field(default=False, description="True if task intent is ambiguous or unconfident")


class ContextRequirementItem(BaseModel):
    """
    A structured document requirement item returned by the Context Engine.
    Preserves strict distinction between mandatory required and recommended documents.
    """
    code: str = Field(..., description="Unique requirement code e.g. ADMISSION_LETTER")
    label: str = Field(..., description="Human-readable requirement label e.g. University Admission Letter")
    document_type: str = Field(..., description="Canonical document type e.g. admission_letter")
    category: str = Field(..., description="Document category matching canonical record categories")
    required: bool = Field(default=True, description="True if mandatory; False if recommended / potentially useful")
    description: Optional[str] = Field(default=None, description="Requirement explanation or guidance")


class LifeStageContextRequest(BaseModel):
    """Natural language user message submitted to the Context Engine."""
    message: str = Field(..., min_length=1, max_length=2000, description="Raw user prompt or life-stage goal")


class LifeStageContextResult(BaseModel):
    """
    Unified, machine-consumable Life-Stage Context Engine response.
    Fully compatible with the conceptual contract:
    {
      "task": {
        "type": "...",
        "label": "...",
        "confidence": 0.0
      },
      "requirements": [
        {
          "document_type": "...",
          "label": "...",
          "required": true
        }
      ],
      "summary": "..."
    }
    """
    task: TaskContext = Field(..., description="Structured task interpretation")
    requirements: List[ContextRequirementItem] = Field(
        default_factory=list,
        description="Structured document requirements with required vs recommended distinction"
    )
    summary: str = Field(..., description="Concise explanation and overview of requirements")
    clarification_prompt: Optional[str] = Field(default=None, description="Prompt when task is ambiguous")
    source: str = Field(default="deterministic_kb", description="Resolution source: 'groq_llm' or 'deterministic_kb'")
