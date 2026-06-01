"""CLI script to build/rebuild the FAISS index from knowledge base documents."""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.rag.ingestion import ingest_documents

if __name__ == "__main__":
    print("=" * 60)
    print("TelecomIQ - Knowledge Base Ingestion Pipeline")
    print("=" * 60)
    print()

    success = ingest_documents()

    if success:
        print()
        print("✅ Knowledge base successfully ingested into FAISS vector store!")
        print("   The AI service will use this index for RAG-based resolutions.")
    else:
        print()
        print("❌ Ingestion failed. Please check:")
        print("   1. knowledge_base/ directory exists with .txt files")
        print("   2. Python dependencies are installed (pip install -r requirements.txt)")
        sys.exit(1)
