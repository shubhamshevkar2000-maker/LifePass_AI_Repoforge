import pytest
from app.schemas.intent import IntentResponse
from app.schemas.document import DocumentProcessingRequest, DocumentProcessingResult
from app.context.engine import ContextEngine

def test_confidence_validation():
    # Valid
    IntentResponse(intent="test", task="test", domain="test", institution_type="test", confidence=0.0)
    IntentResponse(intent="test", task="test", domain="test", institution_type="test", confidence=1.0)
    IntentResponse(intent="test", task="test", domain="test", institution_type="test", confidence=0.94)

    # Invalid
    with pytest.raises(ValueError):
        IntentResponse(intent="test", task="test", domain="test", institution_type="test", confidence=1.7)
    with pytest.raises(ValueError):
        IntentResponse(intent="test", task="test", domain="test", institution_type="test", confidence=-0.2)

def test_engine_rejects_invalid_confidence():
    # Null
    data = {"task_type": "education_loan", "confidence": None}
    with pytest.raises(ValueError, match="confidence cannot be null"):
        ContextEngine._build_task_from_llm_response(data)

    # String
    data = {"task_type": "education_loan", "confidence": "high"}
    with pytest.raises(ValueError, match="confidence must be a numeric value"):
        ContextEngine._build_task_from_llm_response(data)
    
    # Out of bounds
    data = {"task_type": "education_loan", "confidence": 1.7}
    with pytest.raises(ValueError, match="confidence must be in \\[0,1\\]"):
        ContextEngine._build_task_from_llm_response(data)

def test_ai_process_schema():
    import uuid
    req = DocumentProcessingRequest(
        record_id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        storage_path="user123/file.pdf",
        mime_type="application/pdf",
        file_size=1024
    )
    assert req.storage_path == "user123/file.pdf"
