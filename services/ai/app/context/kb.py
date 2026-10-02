"""
LifePass AI — Canonical Requirement Knowledge Base
Workstream 2: AI + Document Intelligence (Stage AI-2)
Reference: docs/AI_AGENT_SPEC.md, docs/PRODUCT_SPEC.md, docs/AI_BACKEND_REQUESTS.md
"""

from typing import Dict, List, Optional
from uuid import UUID
from app.schemas.intent import IntentDomain, InstitutionType
from app.schemas.requirement import RequirementItemResult, RequirementProfileResult
from app.schemas.context import ContextRequirementItem


# Canonical Requirement Profiles supported by LifePass
CANONICAL_PROFILES: Dict[str, Dict] = {
    "education_loan": {
        "profile_id": UUID("11111111-1111-4111-8111-111111111111"),
        "task_code": "education_loan",
        "name": "Education Loan Application",
        "label": "Education Loan Application",
        "intent": "loan_application",
        "domain": IntentDomain.FINANCE,
        "institution_type": InstitutionType.BANK,
        "version": "2026.1",
        "description": "Standard education loan document package for higher education financing.",
        "requirements": [
            {
                "id": UUID("11111111-0001-4111-8111-000000000001"),
                "code": "ID_PROOF",
                "name": "Identity Proof",
                "label": "Identity Proof (Passport, PAN, or Aadhaar)",
                "category": "identity",
                "document_type": "identity_proof",
                "required": True,
                "accepted_document_types": ["identity_proof"],
                "description": "Government-issued photo identification",
                "display_order": 1,
            },
            {
                "id": UUID("11111111-0002-4111-8111-000000000002"),
                "code": "ADDRESS_PROOF",
                "name": "Address Proof",
                "label": "Address Proof (Utility Bill or Tenancy Agreement)",
                "category": "address",
                "document_type": "address_proof",
                "required": True,
                "accepted_document_types": ["address_proof"],
                "description": "Proof of permanent or current residential address",
                "display_order": 2,
            },
            {
                "id": UUID("11111111-0003-4111-8111-000000000003"),
                "code": "ACADEMIC_RECORD",
                "name": "Academic Certificate",
                "label": "Academic Certificate / Degree",
                "category": "education",
                "document_type": "academic_certificate",
                "required": True,
                "accepted_document_types": ["academic_certificate", "transcript"],
                "description": "Qualifying degree or graduation certificate",
                "display_order": 3,
            },
            {
                "id": UUID("11111111-0004-4111-8111-000000000004"),
                "code": "INCOME_PROOF",
                "name": "Income Proof",
                "label": "Income Proof / Salary Slip / Tax Return",
                "category": "finance",
                "document_type": "income_proof",
                "required": True,
                "accepted_document_types": ["income_proof", "tax_return", "bank_statement"],
                "description": "Applicant or co-borrower proof of income",
                "display_order": 4,
            },
            {
                "id": UUID("11111111-0005-4111-8111-000000000005"),
                "code": "ADMISSION_LETTER",
                "name": "University Admission Letter",
                "label": "University Admission Letter",
                "category": "education",
                "document_type": "admission_letter",
                "required": True,
                "accepted_document_types": ["admission_letter"],
                "description": "Official acceptance / admission offer letter from university",
                "display_order": 5,
            },
            {
                "id": UUID("11111111-0006-4111-8111-000000000006"),
                "code": "BANK_STATEMENT",
                "name": "Bank Statement",
                "label": "Recent Bank Statement (Recommended)",
                "category": "finance",
                "document_type": "bank_statement",
                "required": False,
                "accepted_document_types": ["bank_statement"],
                "description": "6 months banking transactions for fast-track processing",
                "display_order": 6,
            },
        ],
    },
    "college_admission": {
        "profile_id": UUID("22222222-2222-4222-8222-222222222222"),
        "task_code": "college_admission",
        "name": "University & College Admission",
        "label": "University & College Admission",
        "intent": "admission_application",
        "domain": IntentDomain.EDUCATION,
        "institution_type": InstitutionType.UNIVERSITY,
        "version": "2026.1",
        "description": "Undergraduate and postgraduate university admission document verification.",
        "requirements": [
            {
                "id": UUID("22222222-0001-4222-8222-000000000001"),
                "code": "ID_PROOF",
                "name": "Identity Proof",
                "label": "Identity Proof (Passport or National ID)",
                "category": "identity",
                "document_type": "identity_proof",
                "required": True,
                "accepted_document_types": ["identity_proof"],
                "description": "Official identity verification",
                "display_order": 1,
            },
            {
                "id": UUID("22222222-0002-4222-8222-000000000002"),
                "code": "ACADEMIC_RECORD",
                "name": "Graduation / Degree Certificate",
                "label": "Degree / Diploma Certificate",
                "category": "education",
                "document_type": "academic_certificate",
                "required": True,
                "accepted_document_types": ["academic_certificate"],
                "description": "Previous qualification certificate",
                "display_order": 2,
            },
            {
                "id": UUID("22222222-0003-4222-8222-000000000003"),
                "code": "TRANSCRIPT",
                "name": "Official Academic Transcript",
                "label": "Academic Transcript / Marksheet",
                "category": "education",
                "document_type": "transcript",
                "required": True,
                "accepted_document_types": ["transcript"],
                "description": "Detailed grade report or semester marksheets",
                "display_order": 3,
            },
            {
                "id": UUID("22222222-0004-4222-8222-000000000004"),
                "code": "ADDRESS_PROOF",
                "name": "Domicile / Address Proof",
                "label": "Address / Domicile Certificate (Recommended)",
                "category": "address",
                "document_type": "address_proof",
                "required": False,
                "accepted_document_types": ["address_proof"],
                "description": "Proof of residence or local quota qualification",
                "display_order": 4,
            },
        ],
    },
    "employment_verification": {
        "profile_id": UUID("33333333-3333-4333-8333-333333333333"),
        "task_code": "employment_verification",
        "name": "Employment Background Verification",
        "label": "Employment Background Verification",
        "intent": "background_check",
        "domain": IntentDomain.EMPLOYMENT,
        "institution_type": InstitutionType.EMPLOYER,
        "version": "2026.1",
        "description": "Employment onboarding and background verification document submission.",
        "requirements": [
            {
                "id": UUID("33333333-0001-4333-8333-000000000001"),
                "code": "ID_PROOF",
                "name": "Identity Proof",
                "label": "Government Photo Identity",
                "category": "identity",
                "document_type": "identity_proof",
                "required": True,
                "accepted_document_types": ["identity_proof"],
                "description": "Identity card or passport",
                "display_order": 1,
            },
            {
                "id": UUID("33333333-0002-4333-8333-000000000002"),
                "code": "EMPLOYMENT_RECORD",
                "name": "Relieving / Experience Certificate",
                "label": "Relieving Letter or Experience Certificate",
                "category": "employment",
                "document_type": "employment_record",
                "required": True,
                "accepted_document_types": ["employment_record"],
                "description": "Proof of prior employment experience and conduct",
                "display_order": 2,
            },
            {
                "id": UUID("33333333-0003-4333-8333-000000000003"),
                "code": "INCOME_PROOF",
                "name": "Recent Payslip",
                "label": "Recent Payslip or Salary Certificate",
                "category": "finance",
                "document_type": "income_proof",
                "required": True,
                "accepted_document_types": ["income_proof"],
                "description": "Last drawn salary confirmation",
                "display_order": 3,
            },
            {
                "id": UUID("33333333-0004-4333-8333-000000000004"),
                "code": "ACADEMIC_RECORD",
                "name": "Highest Degree Certificate",
                "label": "Degree Certificate (Recommended)",
                "category": "education",
                "document_type": "academic_certificate",
                "required": False,
                "accepted_document_types": ["academic_certificate"],
                "description": "Proof of highest educational degree",
                "display_order": 4,
            },
        ],
    },
    "passport_application": {
        "profile_id": UUID("44444444-4444-4444-8444-444444444444"),
        "task_code": "passport_application",
        "name": "Passport & Identity Application",
        "label": "Passport & Identity Application",
        "intent": "passport_issuance",
        "domain": IntentDomain.IDENTITY,
        "institution_type": InstitutionType.GOVERNMENT,
        "version": "2026.1",
        "description": "Official citizen passport issuance verification.",
        "requirements": [
            {
                "id": UUID("44444444-0001-4444-8444-000000000001"),
                "code": "ID_PROOF",
                "name": "Proof of Identity & Birth",
                "label": "National ID / Birth Proof",
                "category": "identity",
                "document_type": "identity_proof",
                "required": True,
                "accepted_document_types": ["identity_proof"],
                "description": "Proof of identity and birth details",
                "display_order": 1,
            },
            {
                "id": UUID("44444444-0002-4444-8444-000000000002"),
                "code": "ADDRESS_PROOF",
                "name": "Proof of Present Address",
                "label": "Present Residential Address Proof",
                "category": "address",
                "document_type": "address_proof",
                "required": True,
                "accepted_document_types": ["address_proof"],
                "description": "Electricity bill, water bill, or registered rent agreement",
                "display_order": 2,
            },
        ],
    },
    "visa_application": {
        "profile_id": UUID("55555555-5555-4555-8555-555555555555"),
        "task_code": "visa_application",
        "name": "Visa & Travel Clearance",
        "label": "Visa & Travel Clearance",
        "intent": "visa_application",
        "domain": IntentDomain.GENERAL,
        "institution_type": InstitutionType.GOVERNMENT,
        "version": "2026.1",
        "description": "Consular visa processing document checklist.",
        "requirements": [
            {
                "id": UUID("55555555-0001-4555-8555-000000000001"),
                "code": "ID_PROOF",
                "name": "Valid Passport",
                "label": "Valid Passport ID Page",
                "category": "identity",
                "document_type": "identity_proof",
                "required": True,
                "accepted_document_types": ["identity_proof"],
                "description": "Valid passport with at least 6 months validity",
                "display_order": 1,
            },
            {
                "id": UUID("55555555-0002-4555-8555-000000000002"),
                "code": "BANK_STATEMENT",
                "name": "Bank Statement / Proof of Funds",
                "label": "Bank Statement (Proof of Funds)",
                "category": "finance",
                "document_type": "bank_statement",
                "required": True,
                "accepted_document_types": ["bank_statement"],
                "description": "Financial proof showing sufficient funds",
                "display_order": 2,
            },
            {
                "id": UUID("55555555-0003-4555-8555-000000000003"),
                "code": "INCOME_PROOF",
                "name": "Tax Return / Income Proof",
                "label": "Income Tax Return / Salary Proof",
                "category": "finance",
                "document_type": "tax_return",
                "required": True,
                "accepted_document_types": ["tax_return", "income_proof"],
                "description": "Tax acknowledgment or employment payslips",
                "display_order": 3,
            },
            {
                "id": UUID("55555555-0004-4555-8555-000000000004"),
                "code": "ADMISSION_LETTER",
                "name": "Invitation / Admission Letter",
                "label": "Admission or Invitation Letter (Recommended)",
                "category": "education",
                "document_type": "admission_letter",
                "required": False,
                "accepted_document_types": ["admission_letter"],
                "description": "Official letter of invitation or university offer",
                "display_order": 4,
            },
        ],
    },
}


def get_canonical_task_info(task_code: str) -> Optional[Dict]:
    """Returns canonical metadata for a known task code."""
    return CANONICAL_PROFILES.get(task_code)


def get_requirement_profile(task_code: str) -> Optional[RequirementProfileResult]:
    """
    Retrieves the canonical requirement profile for a task code.
    Returns None if the task is unknown (never invents requirements).
    """
    raw = CANONICAL_PROFILES.get(task_code)
    if not raw:
        return None

    items = [
        RequirementItemResult(
            id=r["id"],
            code=r["code"],
            name=r["name"],
            category=r["category"],
            required=r["required"],
            accepted_document_types=r["accepted_document_types"],
            rules={"description": r["description"]},
            display_order=r["display_order"],
        )
        for r in raw["requirements"]
    ]

    return RequirementProfileResult(
        profile_id=raw["profile_id"],
        task_code=raw["task_code"],
        name=raw["name"],
        domain=raw["domain"].value if hasattr(raw["domain"], "value") else str(raw["domain"]),
        version=raw["version"],
        description=raw["description"],
        requirements=items,
    )


def get_context_requirements(task_code: str) -> List[ContextRequirementItem]:
    """
    Returns structured requirement items for the Context Engine response,
    distinguishing required vs recommended items.
    """
    raw = CANONICAL_PROFILES.get(task_code)
    if not raw:
        return []

    return [
        ContextRequirementItem(
            code=r["code"],
            label=r["label"],
            document_type=r["document_type"],
            category=r["category"],
            required=r["required"],
            description=r.get("description"),
        )
        for r in raw["requirements"]
    ]


def list_supported_tasks() -> List[str]:
    """Returns all canonical task codes recognized by the Knowledge Base."""
    return list(CANONICAL_PROFILES.keys())
