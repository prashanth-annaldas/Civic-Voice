import os
import requests

url = "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=2670&auto=format&fit=crop"
r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
with open("test_pothole.jpg", "wb") as f:
    f.write(r.content)
print("Downloaded background image for testing")

with open("test_pothole.jpg", "rb") as f:
    img_bytes = f.read()

from ai_engine import analyze_issue
res = analyze_issue(img_bytes, 38.95, -77.45)
print("Analysis Result:", res)
