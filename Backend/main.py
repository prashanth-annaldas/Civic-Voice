from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil, uuid
from gemini import detect_issue

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

issues = []

@app.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    lat: float = 0,
    lng: float = 0
):
    filename = f"uploads/{uuid.uuid4()}.jpg"
    with open(filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    issue = detect_issue(filename)

    issues.append({
        "type": issue["label"],
        "lat": lat,
        "lng": lng,
        "status": "Pending",
        "image": filename
    })

    return {"success": True, "issue": issue}

@app.get("/issues")
def get_issues():
    return issues
