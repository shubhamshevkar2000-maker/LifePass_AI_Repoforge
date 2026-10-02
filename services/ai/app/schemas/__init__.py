"""
LifePass AI — Schemas Package Initialization
Workstream 2: AI + Document Intelligence
"""

from app.schemas.common import (
    ProcessingStatus,
    ExternalVerificationStatus,
    AIErrorCode,
    AIErrorDetail,
    AIResponseEnvelope,
)
from app.schemas.intent import (
    IntentDomain,
    InstitutionType,
    IntentRequest,
    IntentResult,
)
from app.schemas.document import (
    DocumentCategory,
    DocumentType,
    DocumentClassificationResult,
    ExtractedMetadata,
    DocumentProcessingRequest,
    DocumentProcessingResult,
)
from app.schemas.requirement import (
    RequirementItemResult,
    RequirementProfileResult,
    CandidateRecord,
    SemanticRetrievalResult,
)
from app.schemas.explanation import (
    ExplanationRequest,
    ExplanationResult,
)

__all__ = [
    "ProcessingStatus",
    "ExternalVerificationStatus",
    "AIErrorCode",
    "AIErrorDetail",
    "AIResponseEnvelope",
    "IntentDomain",
    "InstitutionType",
    "IntentRequest",
    "IntentResult",
    "DocumentCategory",
    "DocumentType",
    "DocumentClassificationResult",
    "ExtractedMetadata",
    "DocumentProcessingRequest",
    "DocumentProcessingResult",
    "RequirementItemResult",
    "RequirementProfileResult",
    "CandidateRecord",
    "SemanticRetrievalResult",
    "ExplanationRequest",
    "ExplanationResult",
]
