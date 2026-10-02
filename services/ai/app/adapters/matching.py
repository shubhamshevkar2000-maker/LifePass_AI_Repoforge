"""
LifePass AI — Matching Input Adapter
Workstream 2: AI + Document Intelligence (Stage AI-4)
Reference: docs/API_CONTRACT.md Section 5 & docs/AI_AGENT_SPEC.md Section 6

Prepares and adapts AI semantic retrieval outputs for handoff to Backend
POST /matching/evaluate.
"""

from typing import Any, Dict, List
from uuid import UUID

from app.adapters.protocols import MatchingAdapterProtocol
from app.schemas.requirement import (
    CandidateRecord,
    SemanticRetrievalResult,
)


class BackendMatchingAdapter(MatchingAdapterProtocol):
    """
    Transforms SemanticRetrievalResult into structured matching evaluation input.
    
    Principles:
    - Pure data transformation adapter; contains zero authorization logic.
    - AI provides candidate discoveries and similarity scores.
    - Backend executes deterministic rule evaluation and calculates readiness %.
    """
    def adapt_retrieval_for_evaluation(
        self,
        retrieval_result: SemanticRetrievalResult,
        requirement_profile_id: UUID,
    ) -> Dict[str, Any]:
        """
        Formats candidate records for consumption by backend deterministic matching engine.
        Conforms strictly to docs/API_CONTRACT.md Section 5 contract.
        """
        candidates_payload: List[Dict[str, Any]] = []

        for candidate in retrieval_result.candidates:
            candidates_payload.append({
                "record_id": str(candidate.record_id),
                "requirement_code": candidate.matched_requirement_code,
                "document_type": candidate.document_type,
                "category": candidate.category,
                "similarity_score": round(candidate.similarity_score, 3),
                "metadata": candidate.metadata or {},
            })

        return {
            "user_id": str(retrieval_result.user_id),
            "requirement_profile_id": str(requirement_profile_id),
            "task_code": retrieval_result.task_code,
            "candidate_count": len(candidates_payload),
            "candidates": candidates_payload,
        }
