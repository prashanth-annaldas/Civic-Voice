from google import genai
from PIL import Image
import os

# 🔑 Set your API key (or use an environment variable)
API_KEY = "AIzaSyAsgHPYjpVyiJQMdrK5lflCrO2wLZ8Mqy8"  # <-- replace with your key

client = genai.Client(api_key=API_KEY)


def detect_issue(image_path: str) -> str:
    """
    Classify the image into exactly one of:
    - pothole
    - garbage
    - water_leak
    - unknown
    """
    if not os.path.exists(image_path):
        return "file_not_found"

    # Load image with PIL (this is supported directly by the SDK)
    img = Image.open(image_path)

    prompt = """
You are a strict image classifier.
Look at the image and respond with EXACTLY ONE of these labels:

pothole
garbage
water_leak
unknown

Respond with only the label, no extra words.
""".strip()

    # Call Gemini vision model
    response = client.models.generate_content(
        model="gemini-2.5-flash",      # current multimodal model
        contents=[prompt, img]         # text + image
    )

    # Safely read the text
    raw = (response.text or "").strip().lower()

    # Take only the first line to avoid any extra content
    raw = raw.splitlines()[0].strip()

    # Exact matching for labels
    if raw == "pothole":
        return "pothole"
    if raw == "garbage":
        return "garbage"
    if raw in ("water_leak", "water leak", "water-leak"):
        return "water_leak"
    if raw == "unknown":
        return "unknown"

    # Small fallback: look for label words inside the response
    if "pothole" in raw:
        return "pothole"
    if "garbage" in raw:
        return "garbage"
    if "water_leak" in raw or "water leak" in raw:
        return "water_leak"
    if "unknown" in raw:
        return "unknown"

    return "unknown"


# 🔍 LOCAL TEST
if __name__ == "__main__":
    # Make sure test.jpeg exists in the same folder, or change the path
    image_path = "test1.jpeg"
    result = detect_issue(image_path)
    print("FINAL CLASSIFICATION:", result)
