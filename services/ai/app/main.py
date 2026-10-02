from fastapi import FastAPI, HTTPException, status

from app.schemas.document import DocumentProcessingRequest, DocumentProcessingResult
from app.document.pipeline import process_document_pipeline
from supabase import create_client, Client
from app.core.config import settings
from app.context.engine import ContextEngine
from app.context.explanation import generate_readiness_explanation
from app.retrieval.matcher import RetrievalAssistant
from app.schemas.intent import IntentRequest, IntentResult
from app.schemas.requirement import (
    RequirementProfileRequest,
    RequirementProfileResult,
    SemanticRetrievalRequest,
    SemanticRetrievalResult,
)
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

@app.post("/ai/retrieve", response_model=SemanticRetrievalResult)
def retrieve_candidates(request: SemanticRetrievalRequest) -> SemanticRetrievalResult:
    """
    POST /ai/retrieve
    Retrieves candidate records for a target life-stage task using FAISS vector search
    and deterministic metadata filtering with strict tenant isolation.
    Reference: docs/API_CONTRACT.md Section 5 & docs/AI_AGENT_SPEC.md Section 6
    """
    return RetrievalAssistant.retrieve_candidates_for_task(
        user_id=request.user_id,
        task_code=request.task_code,
        top_k=request.top_k,
    )




@app.post("/ai/process", response_model=DocumentProcessingResult)
def process_document(request: DocumentProcessingRequest) -> DocumentProcessingResult:
    """
    POST /ai/process
    Processes a document using the document intelligence pipeline.
    """
    supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    
    # Download file content using service role (storage bypasses RLS for service role, allowing processing)
    # Alternatively, use signed url. We use service role here for secure backend-to-backend access.
    try:
        # Download from private 'records' bucket
        res = supabase.storage.from_("records").download(request.storage_path)
        content = res
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download document from storage: {str(e)}",
        )
    
    filename = request.storage_path.split("/")[-1]
    
    result = process_document_pipeline(
        content=content,
        filename=filename,
        record_id=request.record_id,
        user_id=request.user_id,
        declared_mime_type=request.mime_type
    )
    
    return result
