"""
LifePass AI — Document Intelligence Pipeline Coordinator
Workstream 2: AI + Document Intelligence (Stage AI-1)
Reference: docs/DOCUMENT_PIPELINE.md Section 2 ("Pipeline") & Section 12 ("Processing states")
"""

import hashlib
from typing import Optional
from uuid import UUID

from app.document.validator import (
    validate_document_intake,
    DocumentValidationError,
)
from app.document.extractor import extract_document_text
from app.document.classifier import classify_document_text
from app.document.metadata_extractor import extract_document_metadata
from app.document.ocr_adapter import TesseractOcrAdapter
from app.schemas.common import ProcessingStatus
from app.schemas.document import (
    DocumentClassificationResult,
    DocumentProcessingResult,
    DocumentType,
    DocumentCategory,
    ExtractedMetadata,
)

PROCESSING_PIPELINE_VERSION = "v1.1.0-doc-intelligence-foundation"


def process_document_pipeline(
    content: bytes,
    filename: str,
    record_id: UUID,
    user_id: Optional[UUID] = None,
    declared_mime_type: Optional[str] = None,
    ocr_engine: Optional[TesseractOcrAdapter] = None,
) -> DocumentProcessingResult:
    """
    Executes the end-to-end Document Intelligence pipeline:
    1. Validation: file format, size, magic bytes, structure.
    2. Text Extraction: embedded PDF text or OCR fallback.
    3. Normalization: clean Unicode, whitespace, control chars.
    4. Classification: deterministic mapping to canonical DocumentType.
    5. Metadata Extraction: regex-based extraction of observable facts.
    6. Assembles and validates DocumentProcessingResult contract.
    
    Security & Boundary Guarantees:
    - Never executes document content as instructions.
    - Never declares external authenticity.
    - Handles failures explicitly without crashing.
    """
    # Step 1: File Intake Validation
    try:
        val_result = validate_document_intake(
            content=content,
            filename=filename,
            declared_mime_type=declared_mime_type,
        )
    except DocumentValidationError as val_err:
        # Structured validation failure
        return DocumentProcessingResult(
            record_id=record_id,
            extracted_text="",
            classification=DocumentClassificationResult(
                document_type=DocumentType.UNKNOWN,
                category=DocumentCategory.OTHER,
                confidence=0.0,
                needs_review=True,
                alternative_types=[],
            ),
            metadata=ExtractedMetadata(
                raw_fields={
                    "validation_error_code": val_err.error_code,
                    "validation_error_message": val_err.message,
                }
            ),
            status=ProcessingStatus.FAILED,
            duplicate_warning=False,
            processing_version=PROCESSING_PIPELINE_VERSION,
        )

    # Step 2 & 3: Extraction & Normalization
    ext_result = extract_document_text(
        content=content,
        mime_type=val_result.detected_mime_type,
        ocr_engine=ocr_engine,
    )

    # If extraction completely failed (e.g. OCR required but engine unavailable)
    if not ext_result.success and not ext_result.normalized_text:
        err_code = "EXTRACTION_FAILED"
        err_msg = "No text could be extracted from document."
        if ext_result.ocr_result and not ext_result.ocr_result.success:
            err_code = ext_result.ocr_result.error_code or err_code
            err_msg = ext_result.ocr_result.error_message or err_msg

        return DocumentProcessingResult(
            record_id=record_id,
            extracted_text="",
            classification=DocumentClassificationResult(
                document_type=DocumentType.UNKNOWN,
                category=DocumentCategory.OTHER,
                confidence=0.0,
                needs_review=True,
                alternative_types=[],
            ),
            metadata=ExtractedMetadata(
                raw_fields={
                    "extraction_error_code": err_code,
                    "extraction_error_message": err_msg,
                    "extraction_method": ext_result.extraction_method,
                    "requires_ocr": str(ext_result.requires_ocr),
                }
            ),
            status=ProcessingStatus.NEEDS_REVIEW,
            duplicate_warning=False,
            processing_version=PROCESSING_PIPELINE_VERSION,
        )

    normalized_text = ext_result.normalized_text

    # Step 4: Deterministic Document Classification
    classification = classify_document_text(normalized_text)

    # Step 5: Structured Metadata Extraction
    metadata = extract_document_metadata(normalized_text, classification.document_type)

    # Record extraction metadata
    metadata.raw_fields["extraction_method"] = ext_result.extraction_method
    metadata.raw_fields["page_count"] = str(ext_result.page_count)
    metadata.raw_fields["content_sha256"] = hashlib.sha256(content).hexdigest()

    # Determine processing status
    if classification.needs_review or classification.document_type == DocumentType.UNKNOWN:
        status = ProcessingStatus.NEEDS_REVIEW
    else:
        status = ProcessingStatus.READY_FOR_MATCHING

    return DocumentProcessingResult(
        record_id=record_id,
        extracted_text=normalized_text,
        classification=classification,
        metadata=metadata,
        status=status,
        duplicate_warning=False,
        processing_version=PROCESSING_PIPELINE_VERSION,
    )
