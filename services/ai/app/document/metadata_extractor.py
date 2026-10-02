"""
LifePass AI — Deterministic Metadata Extraction
Workstream 2: AI + Document Intelligence (Stage AI-1)
Reference: docs/DOCUMENT_PIPELINE.md Section 7 ("Metadata extraction")
"""

from datetime import date, datetime
import re
from typing import Dict, List, Optional, Tuple
from app.schemas.document import DocumentType, ExtractedMetadata

# Month mapping for English text dates
MONTH_MAP = {
    "jan": 1, "january": 1,
    "feb": 2, "february": 2,
    "mar": 3, "march": 3,
    "apr": 4, "april": 4,
    "may": 5,
    "jun": 6, "june": 6,
    "jul": 7, "july": 7,
    "aug": 8, "august": 8,
    "sep": 9, "september": 9,
    "oct": 10, "october": 10,
    "nov": 11, "november": 11,
    "dec": 12, "december": 12,
}


def parse_date_string(date_str: str) -> Optional[date]:
    """
    Parses common observable date formats deterministically into datetime.date.
    Returns None if unparseable or out of valid bounds.
    """
    if not date_str:
        return None
    
    clean_str = date_str.strip().strip(".,;:()")

    # 1. ISO format: YYYY-MM-DD
    match = re.match(r"^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$", clean_str)
    if match:
        year, month, day = int(match.group(1)), int(match.group(2)), int(match.group(3))
        try:
            return date(year, month, day)
        except ValueError:
            return None

    # 2. Day-first: DD/MM/YYYY or DD-MM-YYYY
    match = re.match(r"^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$", clean_str)
    if match:
        day, month, year = int(match.group(1)), int(match.group(2)), int(match.group(3))
        # Swap if day > 12 and month <= 12
        if month > 12 and day <= 12:
            day, month = month, day
        try:
            return date(year, month, day)
        except ValueError:
            return None

    # 3. Text Month: e.g. "15 May 2024" or "May 15, 2024"
    match = re.match(r"^(\d{1,2})\s+([A-Za-z]+)\s*,?\s*(\d{4})$", clean_str)
    if match:
        day, mon_text, year = int(match.group(1)), match.group(2).lower(), int(match.group(3))
        month = MONTH_MAP.get(mon_text)
        if month:
            try:
                return date(year, month, day)
            except ValueError:
                return None

    match = re.match(r"^([A-Za-z]+)\s+(\d{1,2})\s*,?\s*(\d{4})$", clean_str)
    if match:
        mon_text, day, year = match.group(1).lower(), int(match.group(2)), int(match.group(3))
        month = MONTH_MAP.get(mon_text)
        if month:
            try:
                return date(year, month, day)
            except ValueError:
                return None

    return None


def extract_holder_name(text: str) -> Optional[str]:
    """Extracts applicant / holder / student name from observable patterns."""
    patterns = [
        # Explicit labels: Name: John Doe
        r"(?:candidate|student|applicant|holder|employee|name)\s*(?:name)?\s*[:\-]\s*([A-Za-z\s\.\']{2,40})",
        # Certificate phrasing: "certify that Alice Citizen has completed" or "Awarded to Alice Citizen"
        r"(?:certify that|awarded to|conferred upon|certifies that)\s+([A-Za-z\s\.\']{2,40}?)(?:\s+has|\s+for|\s+of|\s+bearing|\s*,|\r?\n|$)",
        # Salutation prefix: "Mr. / Ms. Alice Citizen"
        r"(?:Mr\.|Ms\.|Mrs\.|Dr\.)\s+([A-Za-z\s\.\']{2,35})",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            candidate = m.group(1).strip().strip(".,;:()")
            if candidate.isupper():
                candidate = candidate.title()
            # Sanity check: between 1 and 5 words, no digits or prohibited instruction keywords
            words = candidate.split()
            if 1 <= len(words) <= 5 and not any(ch.isdigit() for ch in candidate):
                if not any(bad in candidate.lower() for bad in ["university", "institute", "authority", "certify", "ignore", "degree", "certificate"]):
                    return candidate
    return None


def extract_issuer_name(text: str) -> Optional[str]:
    """Extracts issuing institution / organization name."""
    patterns = [
        # Explicit label: "Issued by: Apex University"
        r"(?:issued by|issuing authority|issuer)\s*[:\-]\s*([A-Za-z\s&.,]{3,50})",
        # Prominent line containing University / Institute / Authority / Bank
        r"(?:^|\n)\s*([A-Za-z\s&.,]{3,60}(?:University|Institute of Technology|College of Engineering|Authority|Bank|Department of [A-Za-z\s]+)(?:[A-Za-z\s&.,]{0,30}))(?:\r?\n|$)",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            candidate = m.group(1).strip().strip(".,;:()")
            if candidate.isupper():
                candidate = candidate.title()
            if 1 <= len(candidate.split()) <= 10:
                return candidate
    return None


def extract_dates(text: str) -> Tuple[Optional[date], Optional[date]]:
    """Extracts issue date and expiry date if explicitly labeled."""
    issue_date = None
    expiry_date = None

    # Issue date patterns
    issue_patterns = [
        r"(?:date of issue|issued on|issue date|dated|date)\s*[:\-]\s*(\d{1,4}[-/.][A-Za-z0-9]+[-/.]\d{1,4}|\d{1,2}\s+[A-Za-z]+\s*,?\s*\d{4}|[A-Za-z]+\s+\d{1,2}\s*,?\s*\d{4})",
    ]
    for pat in issue_patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            parsed = parse_date_string(m.group(1))
            if parsed:
                issue_date = parsed
                break

    # Expiry date patterns
    expiry_patterns = [
        r"(?:date of expiry|expiry date|valid till|valid through|expires on|expires)\s*[:\-]\s*(\d{1,4}[-/.][A-Za-z0-9]+[-/.]\d{1,4}|\d{1,2}\s+[A-Za-z]+\s*,?\s*\d{4}|[A-Za-z]+\s+\d{1,2}\s*,?\s*\d{4})",
    ]
    for pat in expiry_patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            parsed = parse_date_string(m.group(1))
            if parsed:
                expiry_date = parsed
                break

    return issue_date, expiry_date


def extract_document_number(text: str) -> Optional[str]:
    """Extracts document identifier e.g. certificate number, ID number, registration number."""
    patterns = [
        r"(?:certificate no|registration no|reg no|roll no|document no|id no|license no|licence no|account no|passport no|pan no|aadhaar no)\s*[:\.\-]?\s*([A-Z0-9\-\/]{4,25})",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            candidate = m.group(1).strip().strip(".,;:()")
            if any(ch.isalnum() for ch in candidate):
                return candidate
    return None


def extract_academic_year(text: str) -> Optional[str]:
    """Extracts academic year or session (e.g. 2023-2024, 2023-24, 2024)."""
    patterns = [
        r"(?:academic year|session|class of|batch)\s*[:\-]?\s*(\d{4}\s*[-–/]\s*\d{2,4})",
        r"\b(20\d{2}\s*[-–]\s*20\d{2})\b",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            return re.sub(r"\s+", "", m.group(1))
    return None


def extract_raw_key_value_fields(text: str) -> Dict[str, str]:
    """Extracts observable 'Key: Value' pairs from document text."""
    fields: Dict[str, str] = {}
    for line in text.split("\n"):
        if ":" in line:
            parts = line.split(":", 1)
            k = parts[0].strip().lower()
            v = parts[1].strip()
            # Retain clean, short keys
            if 2 <= len(k) <= 30 and 1 <= len(v) <= 100:
                clean_k = re.sub(r"[^a-z0-9_]", "_", k)
                if not any(bad in clean_k for bad in ["ignore", "prompt", "instruction"]):
                    fields[clean_k] = v
    return fields


def extract_document_metadata(
    text: str,
    doc_type: Optional[DocumentType] = None,
) -> ExtractedMetadata:
    """
    Deterministically extracts structured metadata from observable document content.
    Never hallucinates or synthesizes missing information.
    """
    holder = extract_holder_name(text)
    issuer = extract_issuer_name(text)
    issue_dt, expiry_dt = extract_dates(text)
    doc_num = extract_document_number(text)
    acad_yr = extract_academic_year(text)
    raw_kv = extract_raw_key_value_fields(text)

    return ExtractedMetadata(
        holder_name=holder,
        issuer_name=issuer,
        issue_date=issue_dt,
        expiry_date=expiry_dt,
        document_number=doc_num,
        academic_year=acad_yr,
        raw_fields=raw_kv,
    )
