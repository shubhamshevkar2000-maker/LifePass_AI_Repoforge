"""
LifePass AI — Heuristic Document Classification
Workstream 2: AI + Document Intelligence (Stage AI-1)
Reference: docs/DOCUMENT_PIPELINE.md Section 6 ("Document classification")
"""

import re
from typing import Dict, List, Tuple
from app.schemas.document import (
    DocumentCategory,
    DocumentClassificationResult,
    DocumentType,
)

# Minimum confidence threshold to consider classification high-confidence without review
CONFIDENCE_REVIEW_THRESHOLD = 0.70

# Minimum evidence threshold to assign a specific type rather than UNKNOWN
CONFIDENCE_UNKNOWN_THRESHOLD = 0.30

# Weighted keyword patterns per canonical document type
CLASSIFICATION_RULES: Dict[DocumentType, Tuple[DocumentCategory, List[str], List[str]]] = {
    # (Category, High-weight title/header keywords, Supporting body keywords)
    DocumentType.ACADEMIC_CERTIFICATE: (
        DocumentCategory.EDUCATION,
        ["degree certificate", "diploma certificate", "provisional certificate", "bachelor of", "master of", "doctor of philosophy", "hereby confers"],
        ["graduated", "university", "faculty", "conferred", "chancellor", "academic record", "curriculum", "in witness whereof"],
    ),
    DocumentType.TRANSCRIPT: (
        DocumentCategory.EDUCATION,
        ["official transcript", "academic transcript", "grade report", "marksheet", "statement of marks", "grade card"],
        ["semester", "course code", "credits", "gpa", "cgpa", "letter grade", "marks obtained", "cumulative grade point"],
    ),
    DocumentType.ADMISSION_LETTER: (
        DocumentCategory.EDUCATION,
        ["letter of admission", "admission offer", "offer of admission", "acceptance letter", "letter of acceptance", "congratulations on your admission"],
        ["commencement date", "enrolment", "program of study", "department of", "tuition fee", "scholarship", "orientation", "intake"],
    ),
    DocumentType.IDENTITY_PROOF: (
        DocumentCategory.IDENTITY,
        ["passport", "national identity card", "driving licence", "driver license", "voter identity", "aadhaar", "permanent account number", "citizen card"],
        ["date of birth", "dob", "nationality", "gender", "identity number", "father's name", "place of birth", "republic of"],
    ),
    DocumentType.ADDRESS_PROOF: (
        DocumentCategory.ADDRESS,
        ["utility bill", "electricity bill", "water bill", "gas bill", "tenancy agreement", "lease agreement", "domicile certificate"],
        ["residential address", "permanent address", "consumer number", "meter number", "billing address", "premises", "tenant", "landlord"],
    ),
    DocumentType.INCOME_PROOF: (
        DocumentCategory.FINANCE,
        ["salary slip", "payslip", "pay stub", "income certificate", "salary certificate", "wage statement"],
        ["gross salary", "net pay", "deductions", "basic pay", "provident fund", "allowance", "earnings", "payroll"],
    ),
    DocumentType.BANK_STATEMENT: (
        DocumentCategory.FINANCE,
        ["bank statement", "account statement", "statement of account"],
        ["account number", "opening balance", "closing balance", "debit", "credit", "withdrawal", "deposit", "transaction date", "ifsc", "iban", "swift"],
    ),
    DocumentType.TAX_RETURN: (
        DocumentCategory.FINANCE,
        ["income tax return", "tax assessment", "form 16", "w-2", "1040", "internal revenue service", "tax acknowledgment"],
        ["assessment year", "financial year", "taxable income", "total tax", "pan number", "tax deducted at source", "gross total income"],
    ),
    DocumentType.EMPLOYMENT_RECORD: (
        DocumentCategory.EMPLOYMENT,
        ["experience certificate", "employment certificate", "service certificate", "appointment letter", "relieving letter"],
        ["designation", "date of joining", "date of leaving", "employee code", "tenure", "conduct", "full-time employment", "human resources"],
    ),
}


def classify_document_text(text: str) -> DocumentClassificationResult:
    """
    Deterministically classifies document content into canonical DocumentType & Category.
    
    1. Scans text against weighted title keywords (weight=3) and supporting keywords (weight=1).
    2. Computes normalized score per document type.
    3. Handles low-confidence or ambiguous classifications with 'needs_review = True'.
    4. Never claims legal authenticity; outputs 'this content appears consistent with X'.
    """
    if not text or len(text.strip()) < 10:
        return DocumentClassificationResult(
            document_type=DocumentType.UNKNOWN,
            category=DocumentCategory.OTHER,
            confidence=0.0,
            needs_review=True,
            alternative_types=[],
        )

    lower_text = text.lower()
    first_page_header = lower_text[:1000]

    scores: List[Tuple[DocumentType, DocumentCategory, float, int]] = []

    for doc_type, (category, title_keywords, body_keywords) in CLASSIFICATION_RULES.items():
        type_score = 0.0
        match_count = 0

        # Check title keywords (3.0 points in header, 2.0 in body)
        for kw in title_keywords:
            if kw in first_page_header:
                type_score += 3.0
                match_count += 1
            elif kw in lower_text:
                type_score += 2.0
                match_count += 1

        # Check supporting body keywords (1.0 point each)
        for kw in body_keywords:
            if kw in lower_text:
                type_score += 1.0
                match_count += 1

        if type_score > 0:
            scores.append((doc_type, category, type_score, match_count))

    if not scores:
        return DocumentClassificationResult(
            document_type=DocumentType.UNKNOWN,
            category=DocumentCategory.OTHER,
            confidence=0.1,
            needs_review=True,
            alternative_types=[],
        )

    # Sort descending by score
    scores.sort(key=lambda s: s[2], reverse=True)
    top_type, top_category, top_score, top_matches = scores[0]

    # Calculate normalized confidence (max ~0.98)
    # 8+ weighted score -> ~0.92-0.96; 5 -> ~0.80; 3 -> ~0.65; 1 -> ~0.35
    raw_confidence = min(0.98, top_score / (top_score + 2.5))
    confidence = round(raw_confidence, 2)

    needs_review = confidence < CONFIDENCE_REVIEW_THRESHOLD

    # If evidence is exceptionally weak, designate as UNKNOWN
    if confidence < CONFIDENCE_UNKNOWN_THRESHOLD:
        top_type = DocumentType.UNKNOWN
        top_category = DocumentCategory.OTHER
        needs_review = True

    # Assemble secondary candidates for transparency
    alternatives = []
    for doc_type, category, score, matches in scores[1:4]:
        alt_conf = round(min(0.95, score / (score + 3.0)), 2)
        alternatives.append({
            "document_type": doc_type.value,
            "category": category.value,
            "confidence": alt_conf,
        })

    return DocumentClassificationResult(
        document_type=top_type,
        category=top_category,
        confidence=confidence,
        needs_review=needs_review,
        alternative_types=alternatives,
    )
