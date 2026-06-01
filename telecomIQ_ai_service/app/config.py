from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # Embedding model (free, runs locally)
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # FAISS index path
    FAISS_INDEX_PATH: str = "faiss_index"

    # Knowledge base path
    KNOWLEDGE_BASE_PATH: str = "knowledge_base"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
