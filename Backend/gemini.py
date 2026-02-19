from dotenv import load_dotenv
import os
from google import genai
from PIL import Image
import io

load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY")


def detect_issue(image_bytes: bytes) -> str:
    # If no API key, safely return unknown
    if not API_KEY:
        return "unknown"

    try:
        client = genai.Client(api_key=API_KEY)

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        prompt = """
Return ONLY one label:
pothole
garbage
water_leak
street_light
electric_transformer
unknown
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt, image]
        )

        text = (response.text or "").lower()

        if "pothole" in text:
            return "Pothole"
        elif "garbage" in text:
            return "Garbage"
        elif "water" in text:
            return "Water Leak"
        elif "light" in text:
            return "Street Light"
        elif "electric" in text:
            return "Electric Transformer"
        else:
            return "unknown"

    except Exception as e:
        print("Gemini error:", e)
        return "unknown"
