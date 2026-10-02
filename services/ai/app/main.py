from fastapi import FastAPI, HTTPException, status
from app.core.config import settings
from app.context.engine import ContextEngine
from app.context.explanation import generate_readiness_explanation
from app.schemas.intent import IntentRequest, IntentResult
from app.schemas.requirement import RequirementProfileRequest, RequirementProfileResult
from app.schemas.context import LifeStageContextRequest, LifeStageContextResult
from app.schemas.explanation import ExplanationRequest, ExplanationResult

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="LifePass AI Document Intelligence & Intent Service Foundation",
)

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "phase": "0.1 Baseline",
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }

@app.post("/ai/intent", response_model=IntentResult)
def parse_intent(request: IntentRequest) -> IntentResult:
    """
    POST /ai/intent
    Parses user's natural language goal into a structured, schema-validated IntentResult.
    Reference: docs/API_CONTRACT.md Section 4 & docs/AI_AGENT_SPEC.md Section 2.A
    """
    return ContextEngine.evaluate_intent(request.message)

@app.post("/ai/requirements", response_model=RequirementProfileResult)
def get_requirements(request: RequirementProfileRequest) -> RequirementProfileResult:
    """
    POST /ai/requirements
    Retrieves canonical requirement profile for a known life-stage task.
    Reference: docs/API_CONTRACT.md Section 4 & docs/AI_AGENT_SPEC.md Section 2.B
    """
    profile = ContextEngine.evaluate_requirements(request.task)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Requirement profile not found for task: '{request.task}'",
        )
    return profile

@app.post("/ai/context", response_model=LifeStageContextResult)
def evaluate_life_stage_context(request: LifeStageContextRequest) -> LifeStageContextResult:
    """
    POST /ai/context
    Life-Stage Context Engine endpoint: returns interpreted task, structured requirements,
    and a concise explanation summary.
    """
    return ContextEngine.evaluate_context(request.message)

@app.post("/ai/explain", response_model=ExplanationResult)
def explain_readiness(request: ExplanationRequest) -> ExplanationResult:
    """
    POST /ai/explain
    Translates deterministic system calculations into clear, understandable language.
    Reference: docs/API_CONTRACT.md Section 4 & docs/AI_AGENT_SPEC.md Section 2.E
    """
    return generate_readiness_explanation(request)

