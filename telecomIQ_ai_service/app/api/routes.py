import logging
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    ClassifyRequest, ClassifyResponse,
    PriorityRequest, PriorityResponse,
    ResolveRequest, ResolveResponse,
    HealthResponse
)
from app.services.classification_service import classify_ticket
from app.services.priority_service import predict_priority
from app.services.resolution_service import generate_resolution

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        service="TelecomIQ AI Service",
        version="1.0.0"
    )


@router.post("/classify", response_model=ClassifyResponse)
async def classify(request: ClassifyRequest):
    """Classify a support ticket into a category using AI."""
    try:
        logger.info(f"Classification request: {request.title[:50]}...")
        result = classify_ticket(request.title, request.description)
        return ClassifyResponse(**result)
    except Exception as e:
        logger.error(f"Classification endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")


@router.post("/priority", response_model=PriorityResponse)
async def priority(request: PriorityRequest):
    """Predict the priority of a support ticket using AI."""
    try:
        logger.info(f"Priority prediction request: {request.title[:50]}...")
        result = predict_priority(request.title, request.description, request.category)
        return PriorityResponse(**result)
    except Exception as e:
        logger.error(f"Priority endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Priority prediction failed: {str(e)}")


@router.post("/resolve", response_model=ResolveResponse)
async def resolve(request: ResolveRequest):
    """Generate a resolution for a support ticket using RAG."""
    try:
        logger.info(f"Resolution request: {request.title[:50]}...")
        result = generate_resolution(request.title, request.description, request.category)
        return ResolveResponse(**result)
    except Exception as e:
        logger.error(f"Resolution endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Resolution generation failed: {str(e)}")
