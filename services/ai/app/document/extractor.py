"""
LifePass AI — Document Text Extraction
Workstream 2: AI + Document Intelligence (Stage AI-1)
Reference: docs/DOCUMENT_PIPELINE.md Section 2 ("Pipeline") & Section 5 ("OCR")
"""

import io
from typing import Optional
from pydantic import BaseModel, Field
import pymupdf
from PIL import Image

from app.document.normalizer import normalize_extracted_text
from app.document.ocr_adapter import OcrAdapter, OcrResult, TesseractOcrAdapter

# Minimum characters across document required to consider embedded PDF text sufficient
MIN_EMBEDDED_TEXT_THRESHOLD = 40


class ExtractionResult(BaseModel):
    """Structured outcome of text extraction."""
    success: bool = Field(..., description="True if text was extracted (either embedded or via OCR)")
    raw_text: str = Field(default="", description="Extracted raw text before normalization")
    normalized_text: str = Field(default="", description="Cleaned and normalized text")
    page_count: int = Field(default=1, description="Total document pages processed")
    extraction_method: str = Field(..., description="Method used: 'embedded_pdf_text', 'ocr', 'hybrid', or 'none'")
    requires_ocr: bool = Field(default=False, description="True if document had insufficient embedded text")
    ocr_result: Optional[OcrResult] = Field(default=None, description="Details of OCR operation if executed")


def extract_document_text(
    content: bytes,
    mime_type: str,
    ocr_engine: Optional[TesseractOcrAdapter] = None,
) -> ExtractionResult:
    """
    Extracts text from a document (PDF or image).
    
    1. For PDFs: extracts embedded text using PyMuPDF page by page.
    2. If embedded text is insufficient (< 40 chars), renders pages to images and invokes OCR.
    3. For images: directly invokes OCR.
    4. Applies deterministic text normalization.
    5. Returns structured ExtractionResult. Never fabricates text on failure.
    """
    ocr = ocr_engine or OcrAdapter

    # Case A: Image documents (JPEG, PNG)
    if mime_type in ("image/jpeg", "image/png"):
        ocr_res = ocr.extract_text_from_bytes(content)
        if ocr_res.success and ocr_res.extracted_text:
            normalized = normalize_extracted_text(ocr_res.extracted_text)
            return ExtractionResult(
                success=True,
                raw_text=ocr_res.extracted_text,
                normalized_text=normalized,
                page_count=1,
                extraction_method="ocr",
                requires_ocr=True,
                ocr_result=ocr_res,
            )
        else:
            return ExtractionResult(
                success=False,
                raw_text="",
                normalized_text="",
                page_count=1,
                extraction_method="none",
                requires_ocr=True,
                ocr_result=ocr_res,
            )

    # Case B: PDF documents
    doc = pymupdf.open(stream=content, filetype="pdf")
    page_count = len(doc)
    page_texts = []

    for page_idx in range(page_count):
        page = doc[page_idx]
        text = page.get_text().strip()
        if text:
            page_texts.append(f"--- Page {page_idx + 1} ---\n{text}")

    doc_embedded_text = "\n\n".join(page_texts)

    # Check if embedded text is sufficient
    total_embedded_chars = sum(len(p.replace(f"--- Page {i+1} ---", "").strip()) for i, p in enumerate(page_texts))

    if total_embedded_chars >= MIN_EMBEDDED_TEXT_THRESHOLD:
        doc.close()
        normalized = normalize_extracted_text(doc_embedded_text)
        return ExtractionResult(
            success=True,
            raw_text=doc_embedded_text,
            normalized_text=normalized,
            page_count=page_count,
            extraction_method="embedded_pdf_text",
            requires_ocr=False,
            ocr_result=None,
        )

    # Scanned PDF or insufficient text -> Fallback to OCR
    ocr_page_texts = []
    last_ocr_res = None
    all_ocr_success = True

    for page_idx in range(page_count):
        page = doc[page_idx]
        # Render page to pixmap (image)
        pix = page.get_pixmap(dpi=150)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        ocr_res = ocr.extract_text_from_image(img)
        last_ocr_res = ocr_res

        if ocr_res.success and ocr_res.extracted_text:
            ocr_page_texts.append(f"--- Page {page_idx + 1} ---\n{ocr_res.extracted_text}")
        else:
            all_ocr_success = False

    doc.close()

    if ocr_page_texts:
        combined_ocr = "\n\n".join(ocr_page_texts)
        normalized = normalize_extracted_text(combined_ocr)
        return ExtractionResult(
            success=True,
            raw_text=combined_ocr,
            normalized_text=normalized,
            page_count=page_count,
            extraction_method="ocr",
            requires_ocr=True,
            ocr_result=last_ocr_res,
        )
    else:
        # OCR failed or was unavailable
        return ExtractionResult(
            success=False,
            raw_text=doc_embedded_text,
            normalized_text=normalize_extracted_text(doc_embedded_text),
            page_count=page_count,
            extraction_method="none",
            requires_ocr=True,
            ocr_result=last_ocr_res,
        )
