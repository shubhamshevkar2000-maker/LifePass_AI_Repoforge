"""
LifePass AI — In-Memory Integration Adapters & Test Fixtures
Workstream 2: AI + Document Intelligence (Stage AI-4)
Reference: docs/API_CONTRACT.md & docs/DEMO_FLOW.md

Implements deterministic in-memory adapters for test execution and mock flows.
Zero cloud dependencies, zero Supabase network requests, zero mock authorization logic.
"""

from typing import Dict, List, Optional
from uuid import UUID

from app.adapters.protocols import (
    AuthorizedRecordProvider,
    RequirementProfileProvider,
)
from app.context.kb import (
    CANONICAL_PROFILES,
    get_requirement_profile,
    list_supported_tasks,
)
from app.retrieval.fixtures import DEMO_RECORDS
from app.retrieval.index import RecordDocumentEntry
from app.schemas.requirement import RequirementProfileResult


class InMemoryRecordProvider(AuthorizedRecordProvider):
    """
    Deterministic in-memory record provider for AI integration testing and demonstration.
    Stores and filters records strictly by user_id without touching external databases.
    """
    def __init__(self, records: Optional[List[Dict]] = None):
        self._records: List[RecordDocumentEntry] = []
        raw_records = records if records is not None else DEMO_RECORDS
        for idx, r in enumerate(raw_records):
            entry = RecordDocumentEntry(
                vector_id=idx,
                record_id=r["record_id"],
                user_id=r["user_id"],
                document_type=r["document_type"],
                category=r["category"],
                status=r.get("status", "processed"),
                label=r.get("label"),
                metadata=r.get("metadata", {}),
                summary_text=r.get("text", "")[:300],
            )
            self._records.append(entry)

    def get_authorized_records(
        self,
        user_id: UUID,
        include_rejected: bool = False,
    ) -> List[RecordDocumentEntry]:
        """
        Retrieves all records belonging strictly to user_id.
        Optionally filters out inactive/rejected/archived records.
        """
        results = []
        for r in self._records:
            if r.user_id != user_id:
                continue
            if not include_rejected and r.status in ("rejected", "archived", "deleted"):
                continue
            results.append(r)
        return results

    def add_record(self, entry: RecordDocumentEntry) -> None:
        """Adds a record entry in memory."""
        self._records.append(entry)


class InMemoryRequirementProvider(RequirementProfileProvider):
    """
    Deterministic provider of canonical requirement profiles from the local knowledge base.
    """
    def get_profile(self, task_code: str) -> Optional[RequirementProfileResult]:
        return get_requirement_profile(task_code)

    def list_supported_task_codes(self) -> List[str]:
        return list_supported_tasks()
