# VisionPlate ANPR

Deep learning project for Indian Automatic Number Plate Recognition using a fine-tuned YOLO detector, OCR, and a CNN character-recognition module scaffold.

## Project Structure

```text
backend/              FastAPI API for image/video inference
frontend/             Polished React web application
training/             Google Colab workflow and CNN training scaffold
backend/models/yolo/  Put trained YOLO best.pt here
backend/models/cnn/   Put trained CNN model here
```

## Recommended Build Path

1. Train YOLOv8 in Google Colab using `training/yolo_colab_workflow.md`.
2. Download the generated `best.pt` file.
3. Place it at `backend/models/yolo/best.pt`.
4. Run the backend and frontend locally.
5. Upload images or videos from the web app.

For local RTX training with report graphs, use `training/yolo_training_local.ipynb`.

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Model Outputs

The API returns:

- annotated image/video path
- detected plate text
- YOLO confidence
- OCR confidence
- regex validation status
- timestamp

## Dataset Recommendation

Use a public Indian license plate detection dataset from Roboflow Universe. Export it in YOLOv8 format from Colab after authenticating with your Roboflow API key.
