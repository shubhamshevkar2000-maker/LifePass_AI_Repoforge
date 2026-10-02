"""
LifePass AI — Semantic Retrieval & Matching Assistant
Workstream 2: AI + Document Intelligence (Stage AI-3)
Reference: docs/AI_AGENT_SPEC.md Section 6 & docs/API_CONTRACT.md Section 5
"""

import logging
from typing import List, Optional
from uuid import UUID
from app.context.kb import get_requirement_profile
from app.retrieval.index import FaissVectorStore
from app.schemas.requirement import (
    CandidateRecord,
    MatchStatus,
    RequirementItemResult,
    RequirementRetrievalResult,
    SemanticRetrievalResult,
)

logger = logging.getLogger("lifepass.ai.retrieval.matcher")


class SemanticRetrievalAssistant:
    """
    Semantic Retrieval and Matching Assistant.
    Coordinates FAISS vector similarity search, metadata filtering, candidate ranking,
    and relevance explanations for canonical life-stage requirements.
    
    Principles:
    - AI-3 provides MATCHING ASSISTANCE, not authoritative decisions.
    - Authoritative readiness and match evaluations remain backend responsibilities.
    - Never fabricates user records or claims a missing record exists.
    - Enforces cross-tenant user_id isolation in all candidate searches.
    - Does NOT claim legal authenticity or issuer verification.
    """
    def __init__(self, vector_store: Optional[FaissVectorStore] = None):
        self.vector_store = vector_store or FaissVectorStore()

    def build_requirement_query(self, req: RequirementItemResult) -> str:
        """
        Constructs a dense canonical query representation for a requirement item.
        """
        accepted_types_str = " ".join(req.accepted_document_types)
        desc = ""
        if req.rules and isinstance(req.rules, dict):
            desc = req.rules.get("description", "")
        return f"{req.name} {req.code} {req.category} {accepted_types_str} {desc}".strip()

    def retrieve_candidates_for_task(
        self,
        user_id: UUID,
        task_code: str,
        top_k: int = 5,
    ) -> SemanticRetrievalResult:
        """
        Retrieves candidate records for all requirements belonging to a canonical task.
        """
        profile = get_requirement_profile(task_code)
        if not profile:
            logger.warning("Attempted retrieval for unrecognized task code: '%s'", task_code)
            return SemanticRetrievalResult(
                task_code=task_code,
                user_id=user_id,
                candidates=[],
                retrieval_count=0,
                requirement_results=[],
                overall_status=MatchStatus.RETRIEVAL_ERROR,
            )

        all_candidates: List[CandidateRecord] = []
        requirement_results: List[RequirementRetrievalResult] = []

        for req in profile.requirements:
            query_text = self.build_requirement_query(req)

            # Perform FAISS search with deterministic metadata filtering
            matches = self.vector_store.search_candidates(
                query_text=query_text,
                top_k=top_k,
                user_id_filter=user_id,
                accepted_document_types=req.accepted_document_types,
                category_filter=req.category,
                min_similarity=0.35,
            )

            req_candidates: List[CandidateRecord] = []
            for entry, score in matches:
                cand = CandidateRecord(
                    record_id=entry.record_id,
                    document_type=entry.document_type,
                    category=entry.category,
                    similarity_score=score,
                    matched_requirement_code=req.code,
                    label=entry.label or entry.document_type.replace("_", " ").title(),
                    relevance_explanation=(
                        f"Retrieved as candidate for {req.name} based on matching document "
                        f"type '{entry.document_type}' ({entry.category}) and semantic similarity {score:.2f}."
                    ),
                    metadata=entry.metadata,
                )
                req_candidates.append(cand)
                all_candidates.append(cand)

            if req_candidates:
                match_status = MatchStatus.CANDIDATE
                explanation = (
                    f"Identified {len(req_candidates)} candidate record(s) consistent with "
                    f"requirement '{req.name}'."
                )
            else:
                match_status = MatchStatus.NO_CANDIDATES
                explanation = (
                    f"No matching candidate records discovered for requirement '{req.name}'. "
                    f"Record must be uploaded or imported to satisfy this requirement."
                )

            req_res = RequirementRetrievalResult(
                requirement_code=req.code,
                document_type=req.accepted_document_types[0] if req.accepted_document_types else "unknown",
                label=req.name,
                candidates=req_candidates,
                match_status=match_status,
                explanation=explanation,
            )
            requirement_results.append(req_res)

        overall_status = MatchStatus.CANDIDATE if all_candidates else MatchStatus.NO_CANDIDATES

        return SemanticRetrievalResult(
            task_code=task_code,
            user_id=user_id,
            candidates=all_candidates,
            retrieval_count=len(all_candidates),
            requirement_results=requirement_results,
            overall_status=overall_status,
        )


def create_default_assistant() -> SemanticRetrievalAssistant:
    from app.retrieval.fixtures import populate_demo_vector_store
    store = FaissVectorStore()
    populate_demo_vector_store(store)
    return SemanticRetrievalAssistant(vector_store=store)


# Global default assistant instance pre-populated with synthetic demo records
RetrievalAssistant = create_default_assistant()
