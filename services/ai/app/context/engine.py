"""
LifePass AI — Life-Stage Context Engine Orchestrator
Workstream 2: AI + Document Intelligence (Stage AI-2)
Reference: docs/AI_AGENT_SPEC.md, docs/API_CONTRACT.md, docs/PRODUCT_SPEC.md
"""

import logging
from typing import Optional
from app.context.interpreter import interpret_task_deterministically
from app.context.kb import (
    get_canonical_task_info,
    get_context_requirements,
    get_requirement_profile,
    list_supported_tasks,
)
from app.context.llm_client import GroqClient
from app.schemas.context import (
    ContextRequirementItem,
    LifeStageContextResult,
    TaskContext,
)
from app.schemas.intent import IntentDomain, IntentResult, InstitutionType
from app.schemas.requirement import RequirementProfileResult

logger = logging.getLogger("lifepass.ai.context.engine")


class LifeStageContextEngine:
    """
    Life-Stage Context Engine.
    Converts natural-language user tasks into structured, machine-consumable recommendations
    comprising interpreted task, confidence, structured requirements, and concise summary.
    
    Principles:
    - AI recommends; Backend evaluates; Security controls enforce.
    - Never fabricates requirements or records.
    - Never claims legal authenticity or modifies consent/RLS.
    - Gracefully falls back to deterministic local knowledge base when Groq is unavailable.
    """
    def __init__(self, groq_client: Optional[GroqClient] = None):
        self.groq_client = groq_client or GroqClient()

    def evaluate_context(self, user_message: str) -> LifeStageContextResult:
        """
        Main entrypoint: parses user goal into structured task and attaches canonical requirements.
        """
        if not user_message or not user_message.strip():
            task = TaskContext(
                type="unknown_task",
                label="Unrecognized Task",
                intent="unknown",
                domain=IntentDomain.GENERAL,
                institution_type=InstitutionType.OTHER,
                confidence=0.0,
                needs_clarification=True,
            )
            return LifeStageContextResult(
                task=task,
                requirements=[],
                summary="Please provide a description of the life-stage task you wish to complete.",
                clarification_prompt="What goal would you like help with? (e.g. education loan, college admission, employment verification)",
                source="deterministic_kb",
            )

        task: Optional[TaskContext] = None
        source = "deterministic_kb"

        # Attempt Groq LLM interpretation if configured
        if self.groq_client.is_configured():
            parsed_data, err_code = self.groq_client.interpret_user_goal(user_message)
            if parsed_data and not err_code:
                try:
                    task = self._build_task_from_llm_response(parsed_data)
                    source = "groq_llm"
                except Exception as ex:
                    logger.warning("Failed to construct TaskContext from LLM response: %s", ex)
                    task = None

        # Fallback to local deterministic interpreter if Groq not available or errored
        if task is None:
            task = interpret_task_deterministically(user_message)
            source = "deterministic_kb"

        # Attach canonical requirements from controlled knowledge base
        requirements = []
        summary = ""
        clarification_prompt = None

        if task.needs_clarification or task.type == "unknown_task":
            clarification_prompt = (
                "LifePass could not uniquely identify your target application. "
                "Supported workflows include: Education Loan, College Admission, "
                "Employment Verification, Passport Application, and Visa Application."
            )
            summary = (
                "Unable to identify required documents from the provided description. "
                "Please clarify your specific life-stage goal."
            )
        else:
            requirements = get_context_requirements(task.type)
            req_count = sum(1 for r in requirements if r.required)
            opt_count = sum(1 for r in requirements if not r.required)

            opt_str = f" and {opt_count} recommended document(s)" if opt_count > 0 else ""
            summary = (
                f"To complete your {task.label}, you will need {req_count} required "
                f"document(s){opt_str}."
            )

        return LifeStageContextResult(
            task=task,
            requirements=requirements,
            summary=summary,
            clarification_prompt=clarification_prompt,
            source=source,
        )

    def evaluate_intent(self, user_message: str) -> IntentResult:
        """
        Produces strictly schema-validated IntentResult conforming to POST /ai/intent.
        """
        ctx = self.evaluate_context(user_message)
        task = ctx.task

        return IntentResult(
            intent=task.intent,
            task=task.type,
            domain=task.domain,
            institution_type=task.institution_type,
            confidence=task.confidence,
            needs_clarification=task.needs_clarification,
            clarification_prompt=ctx.clarification_prompt,
        )

    def evaluate_requirements(self, task_code: str) -> Optional[RequirementProfileResult]:
        """
        Produces strictly schema-validated RequirementProfileResult conforming to POST /ai/requirements.
        Returns None if task is unknown (never hallucinates requirements).
        """
        return get_requirement_profile(task_code)

    def _build_task_from_llm_response(self, data: dict) -> TaskContext:
        """Constructs a validated TaskContext from Groq JSON output."""
        raw_type = data.get("task_type", "unknown_task")
        canonical_info = get_canonical_task_info(raw_type)

        raw_conf = float(data.get("confidence", 0.5))
        confidence = max(0.0, min(1.0, round(raw_conf, 2)))

        needs_clarification = bool(
            data.get("needs_clarification", False)
            or confidence < 0.70
            or raw_type == "unknown_task"
            or canonical_info is None
        )

        if canonical_info:
            return TaskContext(
                type=raw_type,
                label=canonical_info["label"],
                intent=canonical_info["intent"],
                domain=canonical_info["domain"],
                institution_type=canonical_info["institution_type"],
                confidence=confidence,
                needs_clarification=needs_clarification,
            )
        else:
            return TaskContext(
                type="unknown_task",
                label="Unrecognized Task",
                intent=str(data.get("intent", "unknown")),
                domain=IntentDomain.GENERAL,
                institution_type=InstitutionType.OTHER,
                confidence=min(0.40, confidence),
                needs_clarification=True,
            )


# Default global Context Engine instance
ContextEngine = LifeStageContextEngine()
