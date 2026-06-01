import json
import logging
from langchain_groq import ChatGroq
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def predict_priority(title: str, description: str, category: str = None) -> dict:
    """Predict ticket priority using LLM based on urgency, impact, and scope."""

    category_context = f"\nCategory: {category}" if category else ""

    prompt = f"""You are a telecom support ticket priority predictor for a large telecommunications company.
Analyze the following support ticket and predict its priority level based on:
- Urgency: How quickly does this need to be resolved?
- Impact: How many users/services are affected?
- Scope: Is this a single user issue or a widespread outage?

Priority levels:
- Low: Minor inconvenience, single user, no service disruption
- Medium: Moderate impact, affects user productivity but has workaround
- High: Significant impact, multiple users affected, no easy workaround
- Critical: Service outage, security breach, affects many users, revenue impact

Respond ONLY with valid JSON in this exact format:
{{"priority": "<Low|Medium|High|Critical>", "confidence_score": <integer_0_to_100>}}

Title: {title}
Description: {description}{category_context}

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

        # Normalize priority
        priority = result.get("priority", "Medium").upper()
        valid_priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        if priority not in valid_priorities:
            priority = "MEDIUM"

        confidence = min(max(int(result.get("confidence_score", 75)), 0), 100)

        logger.info(f"Priority prediction: {priority} (confidence: {confidence}%)")
        return {"priority": priority, "confidence_score": confidence}

    except Exception as e:
        logger.error(f"Priority prediction error: {str(e)}")
        return {"priority": "MEDIUM", "confidence_score": 50}
