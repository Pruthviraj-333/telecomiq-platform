from pydantic import BaseModel
from typing import Optional


# === Request Models ===

class ClassifyRequest(BaseModel):
    title: str
    description: str


class PriorityRequest(BaseModel):
    title: str
    description: str
    category: Optional[str] = None


class ResolveRequest(BaseModel):
    title: str
    description: str
    category: Optional[str] = None


# === Response Models ===

class ClassifyResponse(BaseModel):
    category: str
    confidence_score: int


class PriorityResponse(BaseModel):
    priority: str
    confidence_score: int


class ResolveResponse(BaseModel):
    resolution: str
    confidence_score: int


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
