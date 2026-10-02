"""
LifePass AI — OCR Adapter & Abstraction
Workstream 2: AI + Document Intelligence (Stage AI-1)
Reference: docs/DOCUMENT_PIPELINE.md Section 5 ("OCR")
"""

import io
from typing import Optional, Protocol, runtime_checkable
from pydantic import BaseModel, Field
from PIL import Image
import pytesseract


class OcrEngineUnavailableError(Exception):
    """Raised when an external OCR engine runtime (e.g. tesseract.exe) is not installed."""
    def __init__(self, message: str = "Tesseract OCR binary is not installed or not found on PATH."):
        super().__init__(message)
        self.message = message


class OcrResult(BaseModel):
    """Result of an OCR operation on a document page or image."""
    success: bool = Field(..., description="True if OCR successfully extracted text")
    extracted_text: str = Field(default="", description="Text extracted by OCR")
    engine_name: str = Field(default="pytesseract", description="Name of OCR engine used")
    error_code: Optional[str] = Field(default=None, description="Error code if OCR failed or engine unavailable")
    error_message: Optional[str] = Field(default=None, description="Descriptive error message")


@runtime_checkable
class OcrEngine(Protocol):
    """Protocol for OCR engine implementations."""
    def is_available(self) -> bool:
        ...

    def extract_text_from_image(self, image: Image.Image) -> OcrResult:
        ...


class TesseractOcrAdapter:
    """
    Standard OCR adapter using pytesseract.
    Strictly checks for local Tesseract binary installation before invoking.
    Never fabricates text if the engine is unavailable.
    """
    def __init__(self, tesseract_cmd: Optional[str] = None):
        if tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
        self._available: Optional[bool] = None

    def is_available(self) -> bool:
        """Checks if the tesseract executable is callable in the current environment."""
        if self._available is not None:
            return self._available
        try:
            _ = pytesseract.get_tesseract_version()
            self._available = True
        except Exception:
            self._available = False
        return self._available

    def extract_text_from_image(self, image: Image.Image) -> OcrResult:
        """
        Extracts text from a PIL Image.
        Raises OcrEngineUnavailableError or returns failure if Tesseract is not installed.
        """
        if not self.is_available():
            return OcrResult(
                success=False,
                extracted_text="",
                engine_name="pytesseract",
                error_code="OCR_ENGINE_UNAVAILABLE",
                error_message=(
                    "Tesseract OCR binary is not installed on this host. "
                    "Install Tesseract (e.g. via Windows installer or apt-get install tesseract-ocr) "
                    "or ensure tesseract.exe is on PATH."
                ),
            )

        try:
            raw_text = pytesseract.image_to_string(image)
            return OcrResult(
                success=True,
                extracted_text=raw_text.strip(),
                engine_name="pytesseract",
            )
        except Exception as e:
            return OcrResult(
                success=False,
                extracted_text="",
                engine_name="pytesseract",
                error_code="OCR_EXTRACTION_FAILED",
                error_message=f"OCR execution failed: {str(e)}",
            )

    def extract_text_from_bytes(self, image_bytes: bytes) -> OcrResult:
        """Extracts text from raw image bytes."""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            return self.extract_text_from_image(image)
        except Exception as e:
            return OcrResult(
                success=False,
                extracted_text="",
                engine_name="pytesseract",
                error_code="INVALID_IMAGE_DATA",
                error_message=f"Could not decode image for OCR: {str(e)}",
            )


# Global default adapter instance
OcrAdapter = TesseractOcrAdapter()
