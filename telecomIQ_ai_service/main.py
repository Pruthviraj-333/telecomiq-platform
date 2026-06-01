import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.config import get_settings
from app.rag.retriever import get_retriever

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup: pre-load FAISS index
    logger.info("Starting TelecomIQ AI Service...")
    logger.info(f"Using model: {settings.GROQ_MODEL}")
    try:
        retriever = get_retriever()
        if retriever:
            logger.info("FAISS retriever loaded successfully on startup")
        else:
            logger.warning("FAISS retriever not available - will build on first request")
    except Exception as e:
        logger.warning(f"Could not pre-load FAISS index: {e}")

    yield

    # Shutdown
    logger.info("Shutting down TelecomIQ AI Service...")


app = FastAPI(
    title="TelecomIQ AI Service",
    description="AI-Driven Ticket Classification, Priority Prediction, and Resolution Generation using RAG",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
