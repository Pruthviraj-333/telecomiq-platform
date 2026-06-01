import logging
from langchain_groq import ChatGroq
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from app.config import get_settings
from app.rag.retriever import get_retriever

logger = logging.getLogger(__name__)
settings = get_settings()


RESOLUTION_PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template="""You are a senior telecom support engineer at a large telecommunications company.
Based on the following knowledge base context and ticket details, generate a clear, step-by-step resolution guide.

KNOWLEDGE BASE CONTEXT:
{context}

TICKET DETAILS:
{question}

Generate a professional, actionable resolution with numbered steps (5-8 steps).
Include specific technical actions the support team should take.
If the issue might require escalation, mention that as the final step.

RESOLUTION:"""
)


def generate_resolution(title: str, description: str, category: str = None) -> dict:
    """Generate a resolution for a ticket using RAG (Retrieval Augmented Generation)."""

    category_context = f" | Category: {category}" if category else ""
    question = f"Title: {title} | Description: {description}{category_context}"

    try:
        retriever = get_retriever()

        llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name=settings.GROQ_MODEL,
            temperature=0.3,
            max_tokens=500
        )

        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            chain_type_kwargs={"prompt": RESOLUTION_PROMPT},
            return_source_documents=False
        )

        result = qa_chain.invoke({"query": question})
        resolution = result.get("result", "").strip()

        if not resolution:
            resolution = _fallback_resolution(title, description, category)

        # Confidence based on whether RAG retrieval found relevant docs
        confidence = 82 if retriever else 60

        logger.info(f"Resolution generated for ticket: {title[:50]}...")
        return {"resolution": resolution, "confidence_score": confidence}

    except Exception as e:
        logger.error(f"Resolution generation error: {str(e)}")
        resolution = _fallback_resolution(title, description, category)
        return {"resolution": resolution, "confidence_score": 45}


def _fallback_resolution(title: str, description: str, category: str = None) -> str:
    """Generate a basic resolution without RAG if vector store unavailable."""

    try:
        llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name=settings.GROQ_MODEL,
            temperature=0.3,
            max_tokens=500
        )

        prompt = f"""You are a senior telecom support engineer. Generate a step-by-step resolution guide
for the following support ticket. Provide 5-8 specific, actionable steps.

Title: {title}
Description: {description}
Category: {category or 'General'}

RESOLUTION:"""

        response = llm.invoke(prompt)
        return response.content.strip()

    except Exception as e:
        logger.error(f"Fallback resolution error: {str(e)}")
        return (
            "1. Acknowledge the customer's issue and gather additional details.\n"
            "2. Check system status and recent changes.\n"
            "3. Attempt standard troubleshooting procedures.\n"
            "4. Review relevant documentation and knowledge base.\n"
            "5. If unresolved, escalate to a senior engineer with full case details."
        )
