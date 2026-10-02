"""
LifePass AI — AI-0 Contract & Schema Tests
Workstream 2: AI + Document Intelligence
Tests schema validation, serialization, deserialization, type bounds,
and failure envelopes for all frozen AI contracts.
"""

from datetime import date
import uuid
import pytest
from pydantic import ValidationError

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


# ============================================================
# 1. INTENT CONTRACT TESTS
# ============================================================

def test_intent_request_valid():
    req = IntentRequest(message="I want to apply for an education loan.")
    assert req.message == "I want to apply for an education loan."


def test_intent_request_empty_rejected():
    with pytest.raises(ValidationError):
        IntentRequest(message="")


def test_intent_result_valid_serialization():
    payload = {
        "intent": "loan_application",
        "task": "education_loan",
        "domain": "finance",
        "institution_type": "bank",
        "confidence": 0.94,
        "needs_clarification": False,
    }
    result = IntentResult(**payload)
    assert result.intent == "loan_application"
    assert result.task == "education_loan"
    assert result.domain == IntentDomain.FINANCE
    assert result.institution_type == InstitutionType.BANK
    assert result.confidence == 0.94
    assert result.needs_clarification is False

    # Round-trip serialization
    json_data = result.model_dump()
    assert json_data["domain"] == "finance"
    assert json_data["institution_type"] == "bank"


def test_intent_result_confidence_bounds():
    # Confidence > 1.0 must fail
    with pytest.raises(ValidationError):
        IntentResult(
            intent="loan_application",
            task="education_loan",
            domain=IntentDomain.FINANCE,
            institution_type=InstitutionType.BANK,
            confidence=1.05,
        )

    # Confidence < 0.0 must fail
    with pytest.raises(ValidationError):
        IntentResult(
            intent="loan_application",
            task="education_loan",
            domain=IntentDomain.FINANCE,
            institution_type=InstitutionType.BANK,
            confidence=-0.1,
        )


def test_intent_result_invalid_domain_rejected():
    with pytest.raises(ValidationError):
        IntentResult(
            intent="test",
            task="test",
            domain="invalid_domain",
            institution_type=InstitutionType.BANK,
            confidence=0.9,
        )


# ============================================================
# 2. DOCUMENT INTELLIGENCE CONTRACT TESTS
# ============================================================

def test_document_classification_valid():
    classification = DocumentClassificationResult(
        document_type=DocumentType.ACADEMIC_CERTIFICATE,
        category=DocumentCategory.EDUCATION,
        confidence=0.96,
        needs_review=False,
    )
    assert classification.document_type == DocumentType.ACADEMIC_CERTIFICATE
    assert classification.category == DocumentCategory.EDUCATION
    assert classification.confidence == 0.96
    assert classification.needs_review is False


def test_extracted_metadata_valid_and_optional_fields():
    metadata = ExtractedMetadata(
        holder_name="Alice Citizen",
        issuer_name="Apex University",
        issue_date=date(2024, 5, 15),
        expiry_date=None,
        document_number="DEG-2024-0891",
        academic_year="2023-2024",
        raw_fields={"gpa": "3.85"},
    )
    assert metadata.holder_name == "Alice Citizen"
    assert metadata.issue_date == date(2024, 5, 15)
    assert metadata.expiry_date is None
    assert metadata.raw_fields["gpa"] == "3.85"


def test_document_processing_result_contract():
    rec_id = uuid.uuid4()
    result = DocumentProcessingResult(
        record_id=rec_id,
        extracted_text="Apex University Degree Certificate awarded to Alice Citizen on 2024-05-15",
        classification=DocumentClassificationResult(
            document_type=DocumentType.ACADEMIC_CERTIFICATE,
            category=DocumentCategory.EDUCATION,
            confidence=0.96,
            needs_review=False,
        ),
        metadata=ExtractedMetadata(
            holder_name="Alice Citizen",
            issuer_name="Apex University",
            issue_date=date(2024, 5, 15),
            document_number="DEG-2024-0891",
        ),
        status=ProcessingStatus.READY_FOR_MATCHING,
        duplicate_warning=False,
        processing_version="v1.0.0-ocr-pipeline",
    )
    assert result.record_id == rec_id
    assert result.status == ProcessingStatus.READY_FOR_MATCHING
    assert result.classification.confidence == 0.96
    assert result.metadata.holder_name == "Alice Citizen"


def test_document_processing_request_validation():
    rec_id = uuid.uuid4()
    user_id = uuid.uuid4()
    req = DocumentProcessingRequest(
        record_id=rec_id,
        user_id=user_id,
        storage_path=f"records/{user_id}/{rec_id}.pdf",
        mime_type="application/pdf",
        file_size=102400,
    )
    assert req.mime_type == "application/pdf"
    assert req.file_size == 102400


# ============================================================
# 3. REQUIREMENT & RETRIEVAL CONTRACT TESTS
# ============================================================

def test_requirement_profile_result_structure():
    prof_id = uuid.uuid4()
    item_id = uuid.uuid4()
    profile = RequirementProfileResult(
        profile_id=prof_id,
        task_code="education_loan",
        name="Standard Education Loan Profile",
        domain="finance",
        version="2026.1",
        description="Required document package for education loan applications",
        requirements=[
            RequirementItemResult(
                id=item_id,
                code="ID_PROOF",
                name="Identity Proof",
                category="identity",
                required=True,
                accepted_document_types=["identity_proof"],
                display_order=1,
            )
        ],
    )
    assert profile.profile_id == prof_id
    assert len(profile.requirements) == 1
    assert profile.requirements[0].code == "ID_PROOF"
    assert profile.requirements[0].required is True


def test_semantic_retrieval_candidate_record():
    rec_id = uuid.uuid4()
    candidate = CandidateRecord(
        record_id=rec_id,
        document_type="academic_certificate",
        category="education",
        similarity_score=0.91,
        matched_requirement_code="ACADEMIC_RECORD",
    )
    assert candidate.similarity_score == 0.91
    assert candidate.matched_requirement_code == "ACADEMIC_RECORD"


def test_semantic_retrieval_result_payload():
    user_id = uuid.uuid4()
    rec_id = uuid.uuid4()
    res = SemanticRetrievalResult(
        task_code="education_loan",
        user_id=user_id,
        candidates=[
            CandidateRecord(
                record_id=rec_id,
                document_type="identity_proof",
                category="identity",
                similarity_score=0.88,
                matched_requirement_code="ID_PROOF",
            )
        ],
        retrieval_count=1,
    )
    assert res.task_code == "education_loan"
    assert res.retrieval_count == 1


# ============================================================
# 4. EXPLANATION CONTRACT TESTS
# ============================================================

def test_explanation_request_validation():
    req = ExplanationRequest(
        task_code="education_loan",
        readiness_percent=80.0,
        matched=[{"code": "ID_PROOF", "status": "matched"}],
        missing=[{"code": "ADMISSION_LETTER", "status": "missing"}],
        attention_needed=[],
    )
    assert req.readiness_percent == 80.0
    assert len(req.matched) == 1
    assert len(req.missing) == 1


def test_explanation_request_readiness_bounds():
    # readiness_percent > 100 must fail
    with pytest.raises(ValidationError):
        ExplanationRequest(
            task_code="education_loan",
            readiness_percent=101.0,
        )

    # readiness_percent < 0 must fail
    with pytest.raises(ValidationError):
        ExplanationRequest(
            task_code="education_loan",
            readiness_percent=-5.0,
        )


def test_explanation_result_payload():
    res = ExplanationResult(
        summary="You have 4 of the 5 required records. Your admission letter is missing.",
        matched_explanation="Identity, address, income, and academic records are matched.",
        missing_explanation="Official university admission letter is required for an education loan.",
        action_items=["Upload your university admission letter to reach 100% readiness."],
        confidence=1.0,
    )
    assert "admission letter is missing" in res.summary
    assert len(res.action_items) == 1
    assert res.confidence == 1.0


# ============================================================
# 5. ENVELOPE & ERROR HANDLING TESTS
# ============================================================

def test_ai_response_envelope_success():
    intent_data = IntentResult(
        intent="loan_application",
        task="education_loan",
        domain=IntentDomain.FINANCE,
        institution_type=InstitutionType.BANK,
        confidence=0.95,
    )
    envelope = AIResponseEnvelope[IntentResult](
        success=True,
        data=intent_data,
        error=None,
        processing_version="v1.0.0-phase1-baseline",
    )
    assert envelope.success is True
    assert envelope.data is not None
    assert envelope.data.task == "education_loan"
    assert envelope.error is None
    assert envelope.timestamp is not None


def test_ai_response_envelope_error():
    err_detail = AIErrorDetail(
        code=AIErrorCode.AI_UNAVAILABLE,
        message="LLM inference service is temporarily unreachable.",
        details={"retry_after_seconds": 5},
    )
    envelope = AIResponseEnvelope[IntentResult](
        success=False,
        data=None,
        error=err_detail,
        processing_version="v1.0.0-phase1-baseline",
    )
    assert envelope.success is False
    assert envelope.data is None
    assert envelope.error is not None
    assert envelope.error.code == AIErrorCode.AI_UNAVAILABLE
    assert envelope.error.details["retry_after_seconds"] == 5


def test_external_verification_status_isolation():
    """
    Verifies ExternalVerificationStatus enum exists but is strictly isolated
    from AI document processing states.
    """
    assert ExternalVerificationStatus.NOT_VERIFIED == "not_verified"
    assert ExternalVerificationStatus.SOURCE_VERIFIED == "source_verified"
    # Ensure ProcessingStatus and ExternalVerificationStatus are separate types
    assert ProcessingStatus.PROCESSED != ExternalVerificationStatus.SOURCE_VERIFIED
