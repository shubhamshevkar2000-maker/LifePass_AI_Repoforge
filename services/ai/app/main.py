from fastapi import FastAPI
from app.core.config import settings
from app.api.endpoints import router as ai_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="LifePass AI Document Intelligence & Intent Service Foundation",
)

app.include_router(ai_router, prefix="/api")

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
