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
    RequirementProfileRequest,
    RequirementProfileResult,
    CandidateRecord,
    SemanticRetrievalResult,
    MatchStatus,
    RequirementRetrievalResult,
    SemanticRetrievalRequest,
)
from app.schemas.explanation import (
    ExplanationRequest,
    ExplanationResult,
)
from app.schemas.context import (
    TaskContext,
    ContextRequirementItem,
    LifeStageContextRequest,
    LifeStageContextResult,
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
    "RequirementProfileRequest",
    "RequirementProfileResult",
    "CandidateRecord",
    "SemanticRetrievalResult",
    "MatchStatus",
    "RequirementRetrievalResult",
    "SemanticRetrievalRequest",
    "ExplanationRequest",
    "ExplanationResult",
    "TaskContext",
    "ContextRequirementItem",
    "LifeStageContextRequest",
    "LifeStageContextResult",
]


