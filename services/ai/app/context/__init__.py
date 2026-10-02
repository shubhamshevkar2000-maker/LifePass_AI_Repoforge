"""
LifePass AI — Life-Stage Context Engine Package
Workstream 2: AI + Document Intelligence (Stage AI-2)
"""

from app.context.engine import LifeStageContextEngine, ContextEngine
from app.context.llm_client import GroqClient
from app.context.interpreter import interpret_task_deterministically
from app.context.explanation import generate_readiness_explanation
from app.context.kb import (
    CANONICAL_PROFILES,
    get_canonical_task_info,
    get_context_requirements,
    get_requirement_profile,
    list_supported_tasks,
)

__all__ = [
    "LifeStageContextEngine",
    "ContextEngine",
    "GroqClient",
    "interpret_task_deterministically",
    "generate_readiness_explanation",
    "CANONICAL_PROFILES",
    "get_canonical_task_info",
    "get_context_requirements",
    "get_requirement_profile",
    "list_supported_tasks",
]
