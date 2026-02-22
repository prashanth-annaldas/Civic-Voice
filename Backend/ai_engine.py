import os
import json
import requests
import google.generativeai as genai
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import io
import math

API_KEY = os.getenv("GOOGLE_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

def get_nearby_pois(lat: float, lng: float, radius: int = 500) -> list:
    """
    Uses OpenStreetMap Overpass API to find critical POIs (hospitals, schools, etc.) near the location.
    """
    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query = f"""
    [out:json];
    (
      node["amenity"="hospital"](around:{radius},{lat},{lng});
      node["amenity"="school"](around:{radius},{lat},{lng});
      node["station"="subway"](around:{radius},{lat},{lng});
      node["railway"="station"](around:{radius},{lat},{lng});
    );
    out center;
    """
    try:
        response = requests.post(overpass_url, data={'data': overpass_query}, timeout=5)
        if response.status_code == 200:
            data = response.json()
            pois = []
            for element in data.get('elements', []):
                tags = element.get('tags', {})
                name = tags.get('name', 'Unknown POI')
                poi_type = tags.get('amenity', tags.get('station', tags.get('railway', 'critical location')))
                pois.append(f"{name} ({poi_type})")
            return pois
    except Exception as e:
        print("Error fetching POIs:", e)
    return []

def get_exif_gps(image):
    exif = image._getexif()
    if not exif: return None
    gps_info = {}
    for tag, value in exif.items():
        decoded = TAGS.get(tag, tag)
        if decoded == "GPSInfo":
            for t in value:
                sub_decoded = GPSTAGS.get(t, t)
                gps_info[sub_decoded] = value[t]
    if not gps_info or "GPSLatitude" not in gps_info:
        return None
    
    def convert_to_degrees(value):
        d, m, s = value
        return float(d) + (float(m) / 60.0) + (float(s) / 3600.0)
    
    lat = convert_to_degrees(gps_info["GPSLatitude"])
    if gps_info.get("GPSLatitudeRef") != "N": lat = -lat
    lng = convert_to_degrees(gps_info["GPSLongitude"])
    if gps_info.get("GPSLongitudeRef") != "E": lng = -lng
    return lat, lng

def analyze_issue(image_bytes: bytes, lat: float, lng: float, similar_issues_count: int = 0) -> dict:
    """
    Analyzes the issue image using Gemini, considers nearby POIs, EXIF GPS, and calculates a severity score.
    Returns: label, damage_level, severity_score, department, is_fake
    """
    is_fake = False
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        try:
            exif_gps = get_exif_gps(image)
            if exif_gps:
                exif_lat, exif_lng = exif_gps
                # Simple haversine inline approx
                R = 6371000
                dlat = math.radians(exif_lat - lat)
                dlng = math.radians(exif_lng - lng)
                a = math.sin(dlat/2)**2 + math.cos(math.radians(lat)) * math.cos(math.radians(exif_lat)) * math.sin(dlng/2)**2
                c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
                distance = R * c
                if distance > 1000: # more than 1km away
                    is_fake = True
        except: pass

        pois = get_nearby_pois(lat, lng)
        poi_context = "None" if not pois else ", ".join(pois)

        model = genai.GenerativeModel("gemini-1.5-flash") # 1.5 is better at JSON

        prompt = f"""
        You are an AI City Governance Assistant. Analyze the provided image of a city issue.
        Context:
        - Location: Lat {lat}, Lng {lng}
        - Nearby Critical Locations (within 500m): {poi_context}
        - Number of similar previous complaints in this area: {similar_issues_count}

        Task:
        1. Identify the issue type (e.g., Pothole, Garbage, Water Leak, Street Light, Electric Transformer, etc.).
        2. Assess the damage level from the image (Low, Medium, High).
        3. Calculate a dynamic Severity Score (0-100) based on:
           - Inherent danger of the issue type (e.g., Water Leak or Transformer is higher than Garbage).
           - Proximity to critical locations (boost score if near schools/hospitals).
           - Repeated complaints (boost score if {similar_issues_count} > 0).
           - Visual damage level.
        4. Assign it to the correct department (e.g., Municipality, Water Department, Electricity Department, Roads & Safety).

        Output ONLY valid JSON in this exact format:
        {{
            "issue_type": "string",
            "damage_level": "string",
            "severity_score": int,
            "department": "string"
        }}
        """

        response = model.generate_content([prompt, image])
        # Clean markdown formatting from response if present
        text = response.text.replace("```json", "").replace("```", "").strip()
        result = json.loads(text)
        
        # Ensure it falls into expected bounds
        score = max(0, min(100, int(result.get("severity_score", 0))))
        result["severity_score"] = score
        result["is_fake"] = is_fake
        return result

    except Exception as e:
        print("AI Analysis Error:", e)
        import traceback
        traceback.print_exc()
        res = default_analysis()
        res["is_fake"] = is_fake
        return res

def default_analysis():
    return {
        "issue_type": "Unknown",
        "damage_level": "Unknown",
        "severity_score": 30,
        "department": "Unassigned",
        "is_fake": False
    }

def categorize_severity(score: int) -> str:
    if score <= 30:
        return "Low"
    elif score <= 70:
        return "Medium"
    else:
        return "Critical"
