from pathlib import Path
import csv
import io

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles

from .anpr_pipeline import OUTPUT_DIR, UPLOAD_DIR, detect_image, detect_video, model_status
from .db import init_db, insert_detection, list_detections


app = FastAPI(title="VisionPlate ANPR API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(OUTPUT_DIR)), name="static")


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "models": model_status()}


@app.post("/detect/image")
async def detect_uploaded_image(file: UploadFile = File(...)) -> dict:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Upload an image file")
    return await _process_upload(file, "image")


@app.post("/detect/video")
async def detect_uploaded_video(file: UploadFile = File(...)) -> dict:
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Upload a video file")
    return await _process_upload(file, "video")


@app.get("/history")
def history() -> dict:
    return {"items": list_detections()}


@app.get("/history.csv")
def history_csv() -> StreamingResponse:
    buffer = io.StringIO()
    fieldnames = [
        "id",
        "source_type",
        "filename",
        "plate_text",
        "detection_confidence",
        "ocr_confidence",
        "is_valid",
        "output_path",
        "created_at",
    ]
    writer = csv.DictWriter(buffer, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(list_detections(limit=1000))
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=anpr_history.csv"},
    )


async def _process_upload(file: UploadFile, source_type: str) -> dict:
    destination = UPLOAD_DIR / Path(file.filename or f"upload.{source_type}").name
    destination.write_bytes(await file.read())
    try:
        result = detect_image(destination) if source_type == "image" else detect_video(destination)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    for detection in result["detections"]:
        insert_detection(
            {
                "source_type": source_type,
                "filename": result["filename"],
                "plate_text": detection["plate_text"] or "UNREADABLE",
                "detection_confidence": detection["detection_confidence"],
                "ocr_confidence": detection["ocr_confidence"],
                "is_valid": detection["is_valid"],
                "output_path": result["output_path"],
                "created_at": result["created_at"],
            }
        )
    return result
