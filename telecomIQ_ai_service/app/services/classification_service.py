import json
import logging
from langchain_groq import ChatGroq
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def classify_ticket(title: str, description: str) -> dict:
    """Classify a telecom support ticket into a category using LLM."""

    prompt = f"""You are a telecom support ticket classifier for a large telecommunications company.
Analyze the following support ticket and classify it into exactly ONE of these categories:
- Network Issue
- Billing Issue
- Service Request
- Authentication Issue
- Hardware Issue

Consider the title and description carefully. Respond ONLY with valid JSON in this exact format:
{{"category": "<category_name>", "confidence_score": <integer_0_to_100>}}

The confidence_score should reflect how certain you are about the classification (0-100).

Title: {title}
Description: {description}

Respond with JSON only, no markdown, no explanation:"""

    try:
        llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name=settings.GROQ_MODEL,
            temperature=0.1,
            max_tokens=100
        )

        response = llm.invoke(prompt)
        content = response.content.strip()

        # Clean up response if wrapped in markdown code block
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content
            content = content.rsplit("```", 1)[0].strip()

        result = json.loads(content)

        # Normalize category name to enum format
        category = result.get("category", "Network Issue")
        category_map = {
            "network issue": "NETWORK_ISSUE",
            "billing issue": "BILLING_ISSUE",
            "service request": "SERVICE_REQUEST",
            "authentication issue": "AUTHENTICATION_ISSUE",
            "hardware issue": "HARDWARE_ISSUE",
        }
        normalized = category_map.get(category.lower(), "NETWORK_ISSUE")

        confidence = min(max(int(result.get("confidence_score", 75)), 0), 100)

        logger.info(f"Classification result: {normalized} (confidence: {confidence}%)")
        return {"category": normalized, "confidence_score": confidence}

    except Exception as e:
        logger.error(f"Classification error: {str(e)}")
        return {"category": "NETWORK_ISSUE", "confidence_score": 50}
