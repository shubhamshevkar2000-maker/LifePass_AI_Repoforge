"""
LifePass AI — Document Intelligence Schemas
Workstream 2: AI + Document Intelligence
Contract Version: 1.0 (Frozen Baseline)
Reference: docs/DOCUMENT_PIPELINE.md & docs/DATABASE_SCHEMA.md
"""

from datetime import date
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, Field
from app.schemas.common import ProcessingStatus


class DocumentCategory(str, Enum):
    """Broad categories for personal records."""
    IDENTITY = "identity"
    EDUCATION = "education"
    FINANCE = "finance"
    EMPLOYMENT = "employment"
    ADDRESS = "address"
    OTHER = "other"


class DocumentType(str, Enum):
    """Fine-grained classification of document types per DOCUMENT_PIPELINE.md."""
    IDENTITY_PROOF = "identity_proof"
    ADDRESS_PROOF = "address_proof"
    ACADEMIC_CERTIFICATE = "academic_certificate"
    TRANSCRIPT = "transcript"
    ADMISSION_LETTER = "admission_letter"
    INCOME_PROOF = "income_proof"
    EMPLOYMENT_RECORD = "employment_record"
    BANK_STATEMENT = "bank_statement"
    TAX_RETURN = "tax_return"
    UNKNOWN = "unknown"


class DocumentClassificationResult(BaseModel):
    """Classification outcome produced by the AI classification model."""
    document_type: DocumentType = Field(..., description="Classified document type")
    category: DocumentCategory = Field(..., description="Broad category")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    needs_review: bool = Field(default=False, description="True if confidence is below threshold (e.g. < 0.70)")
    alternative_types: List[Dict[str, Any]] = Field(default_factory=list, description="Top-k alternative candidate types")


class ExtractedMetadata(BaseModel):
    """
    Observable text fields extracted from document content.
    Note: Extraction is not authoritative verification.
    """
    holder_name: Optional[str] = Field(default=None, description="Extracted individual or applicant name")
    issuer_name: Optional[str] = Field(default=None, description="Extracted institution/issuing body name")
    issue_date: Optional[date] = Field(default=None, description="Extracted issue date")
    expiry_date: Optional[date] = Field(default=None, description="Extracted expiration date if present")
    document_number: Optional[str] = Field(default=None, description="Masked/normalized document identifier")
    academic_year: Optional[str] = Field(default=None, description="Academic year or semester if applicable")
    raw_fields: Dict[str, Any] = Field(default_factory=dict, description="Domain-specific raw key-value extractions")


class DocumentProcessingRequest(BaseModel):
    """Internal processing request passed to AI service to process an uploaded document."""
    record_id: UUID = Field(..., description="Target record UUID in public.records")
    user_id: UUID = Field(..., description="Record owner user UUID for isolation check")
    storage_path: str = Field(..., description="Private Supabase Storage object path")
    mime_type: str = Field(..., description="File MIME type e.g. application/pdf, image/jpeg")
    file_size: int = Field(..., description="File size in bytes")


class DocumentProcessingResult(BaseModel):
    """
    Complete document processing payload produced by AI pipeline.
    Maps directly to public.record_extractions table requirements.
    """
    record_id: UUID = Field(..., description="Target record UUID")
    extracted_text: str = Field(..., description="Raw text extracted by OCR engine")
    classification: DocumentClassificationResult = Field(..., description="Document classification")
    metadata: ExtractedMetadata = Field(..., description="Structured metadata extraction")
    status: ProcessingStatus = Field(..., description="Target processing status")
    duplicate_warning: bool = Field(default=False, description="Flag if potential duplicate hash/metadata detected")
    processing_version: str = Field(..., description="Version of OCR/prompt pipeline used")
