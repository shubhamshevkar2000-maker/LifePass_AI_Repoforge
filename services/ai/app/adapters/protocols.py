"""
LifePass AI — Backend Integration Protocols & Boundary Interfaces
Workstream 2: AI + Document Intelligence (Stage AI-4)
Reference: docs/API_CONTRACT.md Section 5, docs/AI_AGENT_SPEC.md, docs/BACKEND_SPEC.md

Principles:
- AI recommends; Application logic evaluates; Security/consent controls enforce.
- The AI service does NOT query Supabase directly or manage RLS policies.
- Backend authenticates callers, authorizes record access, and scopes data.
- AI receives already-authorized records or queries via these protocols.
"""

from typing import Any, Dict, List, Optional, Protocol, runtime_checkable
from uuid import UUID

from app.retrieval.index import RecordDocumentEntry
from app.schemas.requirement import (
    CandidateRecord,
    RequirementProfileResult,
    SemanticRetrievalResult,
)


@runtime_checkable
class AuthorizedRecordProvider(Protocol):
    """
    Protocol for accessing user-owned records that have already been authorized
    and scoped by the Backend. AI service never scopes records independently of backend rules.
    """
    def get_authorized_records(
        self,
        user_id: UUID,
        include_rejected: bool = False,
    ) -> List[RecordDocumentEntry]:
        """
        Retrieves all valid records owned by user_id that are eligible for matching.
        Backend enforces RLS and consent; AI only consumes the authorized result.
        """
        ...


@runtime_checkable
class RequirementProfileProvider(Protocol):
    """
    Protocol for accessing canonical requirement profiles.
    Allows decoupling requirement source (local KB vs future backend database).
    """
    def get_profile(self, task_code: str) -> Optional[RequirementProfileResult]:
        """Returns the canonical requirement profile for a given task code, or None."""
        ...

    def list_supported_task_codes(self) -> List[str]:
        """Returns all registered task codes."""
        ...


@runtime_checkable
class MatchingAdapterProtocol(Protocol):
    """
    Protocol for transforming AI retrieval candidates into backend matching evaluation payloads.
    """
    def adapt_retrieval_for_evaluation(
        self,
        retrieval_result: SemanticRetrievalResult,
        requirement_profile_id: UUID,
    ) -> Dict[str, Any]:
        """
        Constructs the payload expected by Backend POST /matching/evaluate.
        Conforms to docs/API_CONTRACT.md Section 5.
        """
        ...
