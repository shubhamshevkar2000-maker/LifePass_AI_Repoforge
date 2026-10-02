"""
LifePass AI — Common Schemas & Envelopes
Workstream 2: AI + Document Intelligence
Contract Version: 1.0 (Frozen Baseline)
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Generic, Optional, TypeVar, Any, Dict
from pydantic import BaseModel, Field

T = TypeVar("T")


class ProcessingStatus(str, Enum):
    """Document lifecycle processing states as defined in DOCUMENT_PIPELINE.md."""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    PROCESSED = "processed"
    READY_FOR_MATCHING = "ready_for_matching"
    NEEDS_REVIEW = "needs_review"
    FAILED = "failed"


class ExternalVerificationStatus(str, Enum):
    """
    Authoritative external verification status as defined in BACKEND_SPEC.md.
    Strictly isolated: AI cannot set or infer this status.
    """
    NOT_VERIFIED = "not_verified"
    SOURCE_VERIFIED = "source_verified"
    SOURCE_REJECTED = "source_rejected"
    VERIFICATION_UNAVAILABLE = "verification_unavailable"


class AIErrorCode(str, Enum):
    """Standardized AI service error codes conforming to API_CONTRACT.md."""
    INVALID_INPUT = "INVALID_INPUT"
    UNAUTHENTICATED = "UNAUTHENTICATED"
    FORBIDDEN = "FORBIDDEN"
    AI_UNAVAILABLE = "AI_UNAVAILABLE"
    PROCESSING_FAILED = "PROCESSING_FAILED"
    REQUIREMENT_PROFILE_NOT_FOUND = "REQUIREMENT_PROFILE_NOT_FOUND"
    UNKNOWN_REQUIREMENT_PROFILE = "UNKNOWN_REQUIREMENT_PROFILE"
    PROMPT_INJECTION_DETECTED = "PROMPT_INJECTION_DETECTED"
    CONFIDENCE_LOW = "CONFIDENCE_LOW"


class AIErrorDetail(BaseModel):
    """Structured error payload for AI service responses."""
    code: AIErrorCode
    message: str
    details: Optional[Dict[str, Any]] = None


class AIResponseEnvelope(BaseModel, Generic[T]):
    """Standard response envelope wrapping AI service outputs."""
    success: bool = True
    data: Optional[T] = None
    error: Optional[AIErrorDetail] = None
    processing_version: str = "v1.0.0-phase1-baseline"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
