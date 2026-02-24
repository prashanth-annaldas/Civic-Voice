import requests

url = "http://127.0.0.1:8000/upload"
with open("test_pothole.jpg", "rb") as f:
    files = {"file": ("test_pothole.jpg", f, "image/jpeg")}
    data = {
        "lat": "38.95",
        "lng": "-77.45",
        "description": "test description"
    }
    response = requests.post(url, files=files, data=data)

print("Status Code:", response.status_code)
print("Response:", response.text)
