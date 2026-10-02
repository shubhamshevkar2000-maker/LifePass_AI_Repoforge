"""
LifePass AI — Requirement & Semantic Retrieval Schemas
Workstream 2: AI + Document Intelligence
Contract Version: 1.0 (Frozen Baseline)
Reference: docs/AI_AGENT_SPEC.md & docs/DATABASE_SCHEMA.md
"""

from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class RequirementItemResult(BaseModel):
    """A single requirement item within a requirement profile."""
    id: UUID = Field(..., description="Requirement UUID")
    code: str = Field(..., description="Unique requirement code e.g. ID_PROOF")
    name: str = Field(..., description="Human-readable requirement name")
    category: str = Field(..., description="Category matching document categories")
    required: bool = Field(default=True, description="True if mandatory for task readiness")
    accepted_document_types: List[str] = Field(default_factory=list, description="List of accepted document types")
    rules: Optional[Dict[str, Any]] = Field(default=None, description="Deterministic validation rules")
    display_order: int = Field(default=1, description="Sort order for UI rendering")


class RequirementProfileRequest(BaseModel):
    """Input to POST /ai/requirements."""
    task: str = Field(..., min_length=1, max_length=100, description="Canonical task code e.g. education_loan")


class RequirementProfileResult(BaseModel):
    """
    Controlled requirement profile retrieved for a life-stage task.
    Strictly conforms to API_CONTRACT.md POST /ai/requirements response.
    """
    profile_id: UUID = Field(..., description="Requirement profile UUID")
    task_code: str = Field(..., description="Canonical task code e.g. education_loan")
    name: str = Field(..., description="Profile title e.g. Standard Education Loan Profile")
    domain: str = Field(..., description="Domain e.g. finance")
    version: str = Field(..., description="Profile version string e.g. 2026.1")
    description: str = Field(..., description="Purpose explanation for user and institution")
    requirements: List[RequirementItemResult] = Field(default_factory=list, description="Array of requirement items")


class CandidateRecord(BaseModel):
    """
    Candidate record discovered during semantic/vector search in user's records.
    Note: Candidate discovery is an input to deterministic evaluation, not final match state.
    """
    record_id: UUID = Field(..., description="User record UUID")
    document_type: str = Field(..., description="Classified document type of the record")
    category: str = Field(..., description="Category of the record")
    similarity_score: float = Field(..., ge=0.0, le=1.0, description="FAISS cosine/inner product similarity score")
    matched_requirement_code: str = Field(..., description="Requirement code candidate is mapped to")


class SemanticRetrievalResult(BaseModel):
    """Output of semantic retrieval stage before deterministic matching engine."""
    task_code: str = Field(..., description="Target task code")
    user_id: UUID = Field(..., description="User UUID")
    candidates: List[CandidateRecord] = Field(default_factory=list, description="Retrieved candidate records")
    retrieval_count: int = Field(..., description="Number of candidates evaluated")
