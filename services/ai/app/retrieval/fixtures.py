"""
LifePass AI — Synthetic Demo Records & Test Fixtures
Workstream 2: AI + Document Intelligence (Stage AI-3)
Reference: docs/DEMO_FLOW.md Section 2 ("Demo account") & docs/TESTING_QA.md
"""

from typing import Any, Dict, List
from uuid import UUID
from app.retrieval.index import FaissVectorStore

# Stable test user UUIDs
ALICE_USER_ID = UUID("aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa")
BOB_USER_ID = UUID("bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb")

# Synthetic Demo Records for Golden Path Testing
DEMO_RECORDS: List[Dict[str, Any]] = [
    {
        "record_id": UUID("aaaaaaaa-0001-4aaa-aaaa-000000000001"),
        "user_id": ALICE_USER_ID,
        "document_type": "identity_proof",
        "category": "identity",
        "label": "National Passport (Alice)",
        "status": "processed",
        "metadata": {"holder_name": "Alice Citizen", "document_number": "P99881122"},
        "text": (
            "REPUBLIC OF PASSPORT Name Alice Citizen Date of Birth 1995-05-15 "
            "Nationality Republic Passport No P99881122 Valid Till 2030-05-14 "
            "National Identity Card"
        ),
    },
    {
        "record_id": UUID("aaaaaaaa-0002-4aaa-aaaa-000000000002"),
        "user_id": ALICE_USER_ID,
        "document_type": "address_proof",
        "category": "address",
        "label": "Electricity Utility Bill (Alice)",
        "status": "processed",
        "metadata": {"holder_name": "Alice Citizen", "issuer_name": "Electricity Corp"},
        "text": (
            "ELECTRICITY DISTRIBUTION CORP Electricity Bill Consumer No ELEC-99812 "
            "Residential Address Alice Citizen 123 Tech Park Residency City Premises Meter"
        ),
    },
    {
        "record_id": UUID("aaaaaaaa-0003-4aaa-aaaa-000000000003"),
        "user_id": ALICE_USER_ID,
        "document_type": "academic_certificate",
        "category": "education",
        "label": "Bachelor of Technology Degree (Alice)",
        "status": "processed",
        "metadata": {"holder_name": "Alice Citizen", "issuer_name": "Apex University"},
        "text": (
            "APEX UNIVERSITY OF TECHNOLOGY Bachelor of Technology Degree Certificate "
            "Hereby confers upon Alice Citizen who has graduated with first class honours "
            "Degree Certificate In witness whereof"
        ),
    },
    {
        "record_id": UUID("aaaaaaaa-0004-4aaa-aaaa-000000000004"),
        "user_id": ALICE_USER_ID,
        "document_type": "income_proof",
        "category": "finance",
        "label": "Monthly Salary Payslip (Alice)",
        "status": "processed",
        "metadata": {"holder_name": "Alice Citizen", "issuer_name": "Acme Corp"},
        "text": (
            "ACME CORP Salary Slip Payslip Employee Alice Citizen Basic Pay Gross Salary "
            "Deductions Net Pay Bank Transfer Earnings Payroll"
        ),
    },
    {
        "record_id": UUID("aaaaaaaa-0005-4aaa-aaaa-000000000005"),
        "user_id": ALICE_USER_ID,
        "document_type": "bank_statement",
        "category": "finance",
        "label": "Recent Bank Statement (Alice)",
        "status": "processed",
        "metadata": {"holder_name": "Alice Citizen", "issuer_name": "Metro Bank"},
        "text": (
            "METRO BANK Bank Statement Account Statement Account No 88992211 "
            "Alice Citizen Opening Balance Closing Balance Deposits Withdrawals Transactions"
        ),
    },
    # Bob's record for multi-user isolation verification
    {
        "record_id": UUID("bbbbbbbb-0001-4bbb-bbbb-000000000001"),
        "user_id": BOB_USER_ID,
        "document_type": "transcript",
        "category": "education",
        "label": "Official Academic Transcript (Bob)",
        "status": "processed",
        "metadata": {"holder_name": "Bob Citizen", "issuer_name": "Institute of Science"},
        "text": (
            "INSTITUTE OF SCIENCE Official Academic Transcript Bob Citizen Grade Report "
            "Marksheet Cumulative Grade Point Average CGPA 9.2 Course Credits Letter Grade"
        ),
    },
]


def populate_demo_vector_store(store: FaissVectorStore) -> None:
    """Populates a vector store with standard synthetic demo records."""
    store.clear()
    for rec in DEMO_RECORDS:
        store.add_record(
            record_id=rec["record_id"],
            user_id=rec["user_id"],
            document_type=rec["document_type"],
            category=rec["category"],
            text=rec["text"],
            label=rec["label"],
            metadata=rec["metadata"],
            status=rec["status"],
        )
