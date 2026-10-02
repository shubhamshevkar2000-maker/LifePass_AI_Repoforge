"""
LifePass AI — Document Intake Validation
Workstream 2: AI + Document Intelligence (Stage AI-1)
Reference: docs/DOCUMENT_PIPELINE.md Section 3 ("File validation")
"""

import io
import os
from typing import Optional, Set
from pydantic import BaseModel, Field
import pymupdf
from PIL import Image

# Maximum file size allowed for document processing (10 MB per MVP specification)
DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

SUPPORTED_MIME_TYPES: Set[str] = {
    "application/pdf",
    "image/jpeg",
    "image/png",
}

EXTENSION_MIME_MAP = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
}

MAGIC_BYTES = {
    "application/pdf": b"%PDF",
    "image/jpeg": b"\xff\xd8\xff",
    "image/png": b"\x89PNG\r\n\x1a\n",
}


class DocumentValidationError(Exception):
    """Structured validation error for document intake failures."""
    def __init__(self, error_code: str, message: str, details: Optional[dict] = None):
        super().__init__(message)
        self.error_code = error_code
        self.message = message
        self.details = details or {}


class ValidationResult(BaseModel):
    """Result returned upon successful document intake validation."""
    valid: bool = True
    detected_mime_type: str = Field(..., description="Canonical validated MIME type")
    file_size_bytes: int = Field(..., description="Size of the file in bytes")
    page_count: int = Field(default=1, description="Number of pages if PDF, 1 if image")
    filename: str = Field(..., description="Validated filename")


def validate_document_intake(
    content: bytes,
    filename: str,
    declared_mime_type: Optional[str] = None,
    max_size_bytes: int = DEFAULT_MAX_FILE_SIZE_BYTES,
) -> ValidationResult:
    """
    Validates document content, headers, signatures, extensions, and integrity.
    
    Raises DocumentValidationError with structured error_code on failure:
    - FILE_EMPTY
    - FILE_OVERSIZED
    - UNSUPPORTED_FILE_TYPE
    - EXTENSION_MIMETYPE_MISMATCH
    - MALFORMED_DOCUMENT
    - CORRUPT_DOCUMENT
    """
    # 1. Check empty file
    if not content or len(content) == 0:
        raise DocumentValidationError(
            error_code="FILE_EMPTY",
            message="Uploaded file is empty (0 bytes).",
            details={"filename": filename, "file_size": 0},
        )

    # 2. Check file size
    file_size = len(content)
    if file_size > max_size_bytes:
        raise DocumentValidationError(
            error_code="FILE_OVERSIZED",
            message=f"File size ({file_size} bytes) exceeds maximum allowed limit ({max_size_bytes} bytes).",
            details={"filename": filename, "file_size": file_size, "max_size": max_size_bytes},
        )

    # 3. Check filename extension
    _, ext = os.path.splitext(filename.lower())
    if not ext or ext not in EXTENSION_MIME_MAP:
        raise DocumentValidationError(
            error_code="UNSUPPORTED_FILE_TYPE",
            message=f"File extension '{ext}' is not supported. Supported extensions: .pdf, .jpg, .jpeg, .png",
            details={"filename": filename, "extension": ext},
        )

    expected_mime = EXTENSION_MIME_MAP[ext]

    # 4. Check declared MIME type consistency if provided
    if declared_mime_type and declared_mime_type.lower() != expected_mime:
        raise DocumentValidationError(
            error_code="EXTENSION_MIMETYPE_MISMATCH",
            message=f"Declared MIME type '{declared_mime_type}' does not match file extension '{ext}' (expected '{expected_mime}').",
            details={"filename": filename, "declared": declared_mime_type, "expected": expected_mime},
        )

    # 5. Magic Byte / File Signature Validation
    if expected_mime == "application/pdf":
        if not content.startswith(b"%PDF"):
            raise DocumentValidationError(
                error_code="MALFORMED_DOCUMENT",
                message="File header is missing valid PDF magic bytes (%PDF).",
                details={"filename": filename, "header": content[:8].hex()},
            )
    elif expected_mime == "image/jpeg":
        if not content.startswith(b"\xff\xd8\xff"):
            raise DocumentValidationError(
                error_code="MALFORMED_DOCUMENT",
                message="File header is missing valid JPEG magic bytes.",
                details={"filename": filename, "header": content[:8].hex()},
            )
    elif expected_mime == "image/png":
        if not content.startswith(b"\x89PNG\r\n\x1a\n"):
            raise DocumentValidationError(
                error_code="MALFORMED_DOCUMENT",
                message="File header is missing valid PNG magic bytes.",
                details={"filename": filename, "header": content[:8].hex()},
            )

    # 6. Deep Structural & Corruption Inspection
    page_count = 1
    if expected_mime == "application/pdf":
        try:
            doc = pymupdf.open(stream=content, filetype="pdf")
            page_count = len(doc)
            if page_count == 0:
                doc.close()
                raise DocumentValidationError(
                    error_code="CORRUPT_DOCUMENT",
                    message="PDF document contains zero readable pages.",
                    details={"filename": filename, "page_count": 0},
                )
            # Ensure at least first page is readable
            _ = doc[0].get_text()
            doc.close()
        except DocumentValidationError:
            raise
        except Exception as e:
            raise DocumentValidationError(
                error_code="CORRUPT_DOCUMENT",
                message="PDF document is corrupt or cannot be decoded.",
                details={"filename": filename, "error": str(e)},
            )
    else:
        # Validate image decoding
        try:
            image = Image.open(io.BytesIO(content))
            image.verify()
        except Exception as e:
            raise DocumentValidationError(
                error_code="CORRUPT_DOCUMENT",
                message="Image file is corrupt or cannot be decoded.",
                details={"filename": filename, "error": str(e)},
            )

    return ValidationResult(
        valid=True,
        detected_mime_type=expected_mime,
        file_size_bytes=file_size,
        page_count=page_count,
        filename=filename,
    )
