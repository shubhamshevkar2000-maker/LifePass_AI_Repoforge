"""
LifePass AI — Text Normalization
Workstream 2: AI + Document Intelligence (Stage AI-1)
Deterministic text cleaning and structural normalization.
"""

import re
import unicodedata


def normalize_extracted_text(text: str) -> str:
    """
    Applies deterministic text normalization to raw extracted OCR/PDF text.
    
    Operations:
    1. Unicode NFKC normalization (unifies composite glyphs, symbols, spaces).
    2. Strips non-printable control characters (retaining standard whitespace and newlines).
    3. Normalizes horizontal spaces (tabs, non-breaking spaces -> single standard space).
    4. Trims trailing/leading whitespace per line.
    5. Collapses excessive vertical whitespace (max 2 consecutive newlines).
    6. Normalizes page boundary separators.
    """
    if not text:
        return ""

    # 1. Unicode NFKC normalization
    normalized = unicodedata.normalize("NFKC", text)

    # 2. Filter control characters (retain \n, \r, \t)
    normalized = "".join(
        ch for ch in normalized
        if unicodedata.category(ch)[0] != "C" or ch in ("\n", "\r", "\t")
    )

    # 3. Standardize carriage returns
    normalized = normalized.replace("\r\n", "\n").replace("\r", "\n")

    # 4. Process line by line
    cleaned_lines = []
    for line in normalized.split("\n"):
        # Replace multiple tabs / spaces with single space
        cleaned_line = re.sub(r"[ \t]+", " ", line).strip()
        cleaned_lines.append(cleaned_line)

    # 5. Join lines and collapse excessive blank lines
    combined = "\n".join(cleaned_lines)
    collapsed = re.sub(r"\n{3,}", "\n\n", combined)

    # 6. Normalize page break markers
    collapsed = re.sub(r"---+\s*Page\s*(\d+)\s*---+", r"--- Page \1 ---", collapsed, flags=re.IGNORECASE)

    return collapsed.strip()
