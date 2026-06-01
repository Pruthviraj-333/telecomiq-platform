import os
import logging
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Global cached retriever
_retriever = None


def get_retriever(k: int = 3):
    """Get or create the FAISS retriever. Caches the retriever for reuse."""

    global _retriever

    if _retriever is not None:
        return _retriever

    index_path = settings.FAISS_INDEX_PATH

    if not os.path.exists(index_path):
        logger.warning(f"FAISS index not found at: {index_path}. Run ingestion first.")
        # Try to build the index on-the-fly
        from app.rag.ingestion import ingest_documents
        success = ingest_documents()
        if not success:
            logger.error("Failed to build FAISS index on-the-fly")
            return None

    try:
        embeddings = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True}
        )

        vectorstore = FAISS.load_local(
            index_path,
            embeddings,
            allow_dangerous_deserialization=True
        )

        _retriever = vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": k}
        )

        logger.info("FAISS retriever loaded successfully")
        return _retriever

    except Exception as e:
        logger.error(f"Failed to load FAISS retriever: {str(e)}")
        return None


def reload_retriever():
    """Force reload of the FAISS retriever (after re-ingestion)."""
    global _retriever
    _retriever = None
    return get_retriever()
