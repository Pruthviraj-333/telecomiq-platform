import os
import logging
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def ingest_documents():
    """Load knowledge base documents, chunk them, create embeddings, and store in FAISS."""

    kb_path = settings.KNOWLEDGE_BASE_PATH
    index_path = settings.FAISS_INDEX_PATH

    if not os.path.exists(kb_path):
        logger.error(f"Knowledge base directory not found: {kb_path}")
        return False

    logger.info(f"Loading documents from: {kb_path}")

    # 1. Load all .txt files from knowledge base
    loader = DirectoryLoader(
        kb_path,
        glob="**/*.txt",
        loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"}
    )
    documents = loader.load()

    if not documents:
        logger.warning("No documents found in knowledge base")
        return False

    logger.info(f"Loaded {len(documents)} documents")

    # 2. Chunk documents
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    chunks = text_splitter.split_documents(documents)
    logger.info(f"Created {len(chunks)} chunks")

    # 3. Create embeddings using HuggingFace (free, local)
    embeddings = HuggingFaceEmbeddings(
        model_name=settings.EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )

    # 4. Create FAISS vector store and persist
    vectorstore = FAISS.from_documents(chunks, embeddings)
    vectorstore.save_local(index_path)

    logger.info(f"FAISS index saved to: {index_path}")
    return True


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    success = ingest_documents()
    if success:
        print("Knowledge base ingestion completed successfully!")
    else:
        print("Knowledge base ingestion failed!")
