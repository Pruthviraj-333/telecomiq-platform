FROM python:3.11-slim
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
WORKDIR /app

# Set Hugging Face cache home to /app/model_cache so it is persisted inside the image and accessible
ENV HF_HOME=/app/model_cache

COPY requirements.txt .
# Install CPU-only PyTorch first to prevent CUDA wheels (saving ~4GB)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

COPY . .
# Build FAISS index at build time (downloads all-MiniLM-L6-v2 embeddings)
RUN python -c "from app.rag.ingestion import ingest_documents; ingest_documents()"

RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s CMD python -c "import httpx; httpx.get('http://localhost:8000/health')" || exit 1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
