"""
LifePass AI — Deterministic End-to-End Mock Flow (Stage AI-4)
Workstream 2: AI + Document Intelligence
Reference: docs/API_CONTRACT.md, docs/DEMO_FLOW.md, docs/AI_AGENT_SPEC.md

Simulates the future end-to-end integration lifecycle:
User Goal
    ↓
Context Engine (Intent & Task Interpretation)
    ↓
Canonical Requirements (Controlled KB)
    ↓
Authorized-Record Fixtures (Tenant-Scoped Data)
    ↓
Semantic Retrieval (FAISS Similarity Search)
    ↓
Candidate Records (Itemized Candidate Mapping)
    ↓
Matching Adapter (Input to Backend Deterministic Matcher)
    ↓
Simulated Backend Readiness Evaluation (Deterministic 80% Golden Path)
    ↓
Readiness Explanation (Grounded Human-Readable Summary)

Principles:
- 100% deterministic in-memory execution.
- Zero network dependencies, zero Supabase database calls, zero Groq cloud calls.
- AI recommends; Backend evaluates; Security controls enforce.
"""

from dataclasses import dataclass
from typing import Any, Dict, List, Optional
from uuid import UUID

from app.adapters.matching import BackendMatchingAdapter
from app.adapters.memory import InMemoryRecordProvider
from app.context.engine import ContextEngine, LifeStageContextEngine
from app.context.explanation import generate_readiness_explanation
from app.context.kb import get_requirement_profile
from app.retrieval.fixtures import (
    ALICE_USER_ID,
    populate_demo_vector_store,
)
from app.retrieval.index import FaissVectorStore
from app.retrieval.matcher import SemanticRetrievalAssistant
from app.schemas.context import LifeStageContextResult
from app.schemas.explanation import ExplanationRequest, ExplanationResult
from app.schemas.requirement import (
    MatchStatus,
    RequirementProfileResult,
    SemanticRetrievalResult,
)


@dataclass
class EndToEndSimulationResult:
    """Complete trace of the simulated end-to-end flow."""
    user_id: UUID
    user_goal: str
    context_result: LifeStageContextResult
    requirement_profile: Optional[RequirementProfileResult]
    retrieval_result: SemanticRetrievalResult
    matching_payload: Dict[str, Any]
    simulated_readiness_percent: float
    simulated_matched_codes: List[str]
    simulated_missing_codes: List[str]
    explanation_result: ExplanationResult


def run_deterministic_mock_flow(
    user_id: UUID = ALICE_USER_ID,
    user_goal: str = "I want to apply for an education loan at State Bank",
    vector_store: Optional[FaissVectorStore] = None,
) -> EndToEndSimulationResult:
    """
    Executes the complete deterministic mock flow from raw user statement
    to final readiness explanation without external services.
    """
    # 1. Setup in-memory deterministic retrieval store if not provided
    if vector_store is None:
        vector_store = FaissVectorStore(dimension=128)
        populate_demo_vector_store(vector_store)

    assistant = SemanticRetrievalAssistant(vector_store=vector_store)
    matching_adapter = BackendMatchingAdapter()

    # 2. Step 1: Context Engine evaluates user goal
    context_result = ContextEngine.evaluate_context(user_goal)
    task_code = context_result.task.type

    # 3. Step 2: Canonical Requirements retrieval
    requirement_profile = get_requirement_profile(task_code)
    profile_id = requirement_profile.profile_id if requirement_profile else UUID("00000000-0000-4000-a000-000000000000")

    # 4. Step 3: Semantic Retrieval for user records
    retrieval_result = assistant.retrieve_candidates_for_task(
        user_id=user_id,
        task_code=task_code,
        top_k=5,
    )

    # 5. Step 4: Adapt retrieval candidates for Backend matching
    matching_payload = matching_adapter.adapt_retrieval_for_evaluation(
        retrieval_result=retrieval_result,
        requirement_profile_id=profile_id,
    )

    # 6. Step 5: Simulate Backend deterministic evaluation
    # (Matches required items based on candidate presence; computes exact readiness %)
    matched_items: List[Dict[str, Any]] = []
    missing_items: List[Dict[str, Any]] = []
    matched_codes: List[str] = []
    missing_codes: List[str] = []

    required_requirements = (
        [r for r in requirement_profile.requirements if r.required]
        if requirement_profile
        else []
    )
    total_required = len(required_requirements)

    for req in required_requirements:
        # Find candidate discovered during retrieval
        req_res = next(
            (r for r in retrieval_result.requirement_results if r.requirement_code == req.code),
            None,
        )
        if req_res and req_res.match_status == MatchStatus.CANDIDATE and req_res.candidates:
            cand = req_res.candidates[0]
            matched_items.append({
                "requirement_code": req.code,
                "requirement_name": req.name,
                "record_id": str(cand.record_id),
                "document_type": cand.document_type,
            })
            matched_codes.append(req.code)
        else:
            missing_items.append({
                "requirement_code": req.code,
                "requirement_name": req.name,
                "action": f"Upload {req.name}",
            })
            missing_codes.append(req.code)

    if total_required > 0:
        readiness_percent = round((len(matched_items) / total_required) * 100.0, 1)
    else:
        readiness_percent = 0.0

    # 7. Step 6: AI Explanation generation from deterministic facts
    explanation_req = ExplanationRequest(
        task_code=task_code,
        readiness_percent=readiness_percent,
        matched=matched_items,
        missing=missing_items,
        attention_needed=[],
    )
    explanation_result = generate_readiness_explanation(explanation_req)

    return EndToEndSimulationResult(
        user_id=user_id,
        user_goal=user_goal,
        context_result=context_result,
        requirement_profile=requirement_profile,
        retrieval_result=retrieval_result,
        matching_payload=matching_payload,
        simulated_readiness_percent=readiness_percent,
        simulated_matched_codes=matched_codes,
        simulated_missing_codes=missing_codes,
        explanation_result=explanation_result,
    )
