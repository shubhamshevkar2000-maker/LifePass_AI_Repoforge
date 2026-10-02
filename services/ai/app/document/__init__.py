"""
LifePass AI — Document Intelligence Module
Workstream 2: AI + Document Intelligence (Stage AI-1)
"""

from app.document.validator import (
    validate_document_intake,
    DocumentValidationError,
    ValidationResult,
)
from app.document.normalizer import normalize_extracted_text
from app.document.ocr_adapter import OcrAdapter, OcrResult, OcrEngineUnavailableError
from app.document.extractor import extract_document_text, ExtractionResult
from app.document.classifier import classify_document_text
from app.document.metadata_extractor import extract_document_metadata
from app.document.pipeline import process_document_pipeline

__all__ = [
    "validate_document_intake",
    "DocumentValidationError",
    "ValidationResult",
    "normalize_extracted_text",
    "OcrAdapter",
    "OcrResult",
    "OcrEngineUnavailableError",
    "extract_document_text",
    "ExtractionResult",
    "classify_document_text",
    "extract_document_metadata",
    "process_document_pipeline",
]
