import re
from datetime import datetime
from pathlib import Path

import cv2
import easyocr
import numpy as np
import torch
from ultralytics import YOLO


ROOT = Path(__file__).resolve().parents[1]
WEIGHTS_PATH = ROOT / "models" / "yolo" / "best.pt"
OUTPUT_DIR = ROOT / "outputs"
UPLOAD_DIR = ROOT / "uploads"

PLATE_REGEX = re.compile(r"^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$")
VALID_STATE_CODES = {
    "AN", "AP", "AR", "AS", "BR", "CG", "CH", "DD", "DL", "DN", "GA", "GJ", "HR", "HP",
    "JH", "JK", "KA", "KL", "LA", "LD", "MH", "ML", "MN", "MP", "MZ", "NL", "OD", "OR",
    "PB", "PY", "RJ", "SK", "TN", "TR", "TS", "UK", "UP", "WB",
}
_detector = None
_reader = None


def model_status() -> dict:
    return {
        "yolo_weights_found": WEIGHTS_PATH.exists(),
        "weights_path": str(WEIGHTS_PATH),
        "ocr": "EasyOCR English reader",
        "cnn": "Optional character classifier scaffold in training/cnn_character_model.py",
    }


def get_detector():
    global _detector
    if not WEIGHTS_PATH.exists():
        raise FileNotFoundError(f"Trained YOLO weights not found at {WEIGHTS_PATH}")
    if _detector is None:
        _detector = YOLO(str(WEIGHTS_PATH))
    return _detector


def get_reader():
    global _reader
    if _reader is None:
        _reader = easyocr.Reader(["en"], gpu=torch.cuda.is_available())
    return _reader


def clean_plate_text(text: str) -> str:
    text = text.upper()
    text = re.sub(r"[^A-Z0-9]", "", text)
    return text


def normalize_common_ocr_errors(text: str) -> str:
    if len(text) < 4:
        return text

    text = correct_state_code(text)

    # Character positions 3-4 in Indian plates are RTO digits. OCR often mixes O/I with 0/1.
    if len(text) >= 4:
        rto = text[2:4].replace("O", "0").replace("I", "1")
        text = text[:2] + rto + text[4:]

    # Last four positions are digits in the common format.
    if len(text) >= 4:
        tail = text[-4:].replace("O", "0").replace("I", "1").replace("S", "5").replace("B", "8")
        text = text[:-4] + tail

    return text


def edit_distance_one_or_less(left: str, right: str) -> bool:
    if len(left) != len(right):
        return False
    return sum(a != b for a, b in zip(left, right)) <= 1


def correct_state_code(text: str) -> str:
    prefix = text[:2]
    if prefix in VALID_STATE_CODES:
        return text

    candidates = [code for code in VALID_STATE_CODES if edit_distance_one_or_less(prefix, code)]
    if len(candidates) == 1:
        return candidates[0] + text[2:]
    return text


def preprocess_plate(crop: np.ndarray) -> np.ndarray:
    crop = cv2.resize(crop, None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    denoised = cv2.bilateralFilter(enhanced, 7, 50, 50)
    return denoised


def crop_with_padding(image: np.ndarray, x1: int, y1: int, x2: int, y2: int, padding_ratio: float = 0.12) -> np.ndarray:
    height, width = image.shape[:2]
    box_width = max(1, x2 - x1)
    box_height = max(1, y2 - y1)
    pad_x = int(box_width * padding_ratio)
    pad_y = int(box_height * padding_ratio)
    return image[
        max(0, y1 - pad_y):min(height, y2 + pad_y),
        max(0, x1 - pad_x):min(width, x2 + pad_x),
    ]


def is_valid_indian_plate(text: str, detection_confidence: float, ocr_confidence: float) -> bool:
    if detection_confidence < 0.5 or ocr_confidence < 0.5:
        return False
    if not PLATE_REGEX.match(text):
        return False
    return text[:2] in VALID_STATE_CODES


def read_plate(crop: np.ndarray, detection_confidence: float) -> tuple[str, float, bool]:
    processed = preprocess_plate(crop)
    variants = [processed]
    _, thresholded = cv2.threshold(processed, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    variants.append(thresholded)

    candidates = []
    for image in variants:
        results = get_reader().readtext(
            image,
            allowlist="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            detail=1,
            paragraph=False,
        )
        for result in results:
            text = normalize_common_ocr_errors(clean_plate_text(result[1]))
            if text:
                candidates.append((text, float(result[2])))

    if not candidates:
        return "", 0.0, False

    best_text, confidence = max(candidates, key=lambda item: item[1])
    return best_text, confidence, is_valid_indian_plate(best_text, detection_confidence, confidence)


def detect_image(image_path: Path) -> dict:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    image = cv2.imread(str(image_path))
    if image is None:
        raise ValueError("Could not read uploaded image")

    model = get_detector()
    result = model.predict(source=image, imgsz=640, conf=0.25, verbose=False)[0]
    detections = []

    for box in result.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
        confidence = float(box.conf[0])
        crop = crop_with_padding(image, x1, y1, x2, y2)
        if crop.size == 0:
            continue

        plate_text, ocr_confidence, is_valid = read_plate(crop, confidence)
        label = plate_text if plate_text else "plate"
        color = (46, 204, 113) if is_valid else (52, 152, 219)
        cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
        cv2.putText(image, label, (x1, max(30, y1 - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
        detections.append(
            {
                "plate_text": plate_text,
                "detection_confidence": round(confidence, 4),
                "ocr_confidence": round(ocr_confidence, 4),
                "is_valid": is_valid,
                "bbox": [x1, y1, x2, y2],
            }
        )

    output_name = f"annotated_{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}_{image_path.name}"
    output_path = OUTPUT_DIR / output_name
    cv2.imwrite(str(output_path), image)

    return {
        "filename": image_path.name,
        "source_type": "image",
        "output_path": f"/static/{output_name}",
        "detections": detections,
        "created_at": datetime.utcnow().isoformat(),
    }


def detect_video(video_path: Path, frame_stride: int = 8) -> dict:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    model = get_detector()
    capture = cv2.VideoCapture(str(video_path))
    if not capture.isOpened():
        raise ValueError("Could not read uploaded video")

    fps = capture.get(cv2.CAP_PROP_FPS) or 24
    width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
    output_name = f"annotated_{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}_{video_path.stem}.mp4"
    output_path = OUTPUT_DIR / output_name
    writer = cv2.VideoWriter(str(output_path), cv2.VideoWriter_fourcc(*"mp4v"), fps, (width, height))

    frame_index = 0
    seen_texts = set()
    detections = []

    while True:
        ok, frame = capture.read()
        if not ok:
            break

        if frame_index % frame_stride == 0:
            result = model.predict(source=frame, imgsz=640, conf=0.25, verbose=False)[0]
            for box in result.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                confidence = float(box.conf[0])
                crop = crop_with_padding(frame, x1, y1, x2, y2)
                if crop.size == 0:
                    continue
                plate_text, ocr_confidence, is_valid = read_plate(crop, confidence)
                color = (46, 204, 113) if is_valid else (52, 152, 219)
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, plate_text or "plate", (x1, max(30, y1 - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
                key = plate_text or f"frame-{frame_index}-{x1}-{y1}"
                if key not in seen_texts:
                    seen_texts.add(key)
                    detections.append(
                        {
                            "plate_text": plate_text,
                            "detection_confidence": round(confidence, 4),
                            "ocr_confidence": round(ocr_confidence, 4),
                            "is_valid": is_valid,
                            "frame": frame_index,
                            "bbox": [x1, y1, x2, y2],
                        }
                    )

        writer.write(frame)
        frame_index += 1

    capture.release()
    writer.release()

    return {
        "filename": video_path.name,
        "source_type": "video",
        "output_path": f"/static/{output_name}",
        "detections": detections,
        "created_at": datetime.utcnow().isoformat(),
        "processed_frames": frame_index,
        "frame_stride": frame_stride,
    }
