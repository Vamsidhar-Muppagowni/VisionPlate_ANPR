# YOLOv8 Colab Training Workflow

Use this workflow in Google Colab to fine-tune YOLO on a public Indian license plate dataset.

## 1. Enable GPU

Runtime -> Change runtime type -> GPU.

## 2. Install Dependencies

```python
!pip install ultralytics roboflow
```

## 3. Download Dataset From Roboflow

Create a free Roboflow account, open an Indian license plate detection dataset, and copy its Python download snippet. It usually looks like this:

```python
from roboflow import Roboflow

rf = Roboflow(api_key="YOUR_API_KEY")
project = rf.workspace("WORKSPACE_NAME").project("PROJECT_NAME")
version = project.version(1)
dataset = version.download("yolov8")
```

Use YOLOv8 format. The downloaded folder should contain `data.yaml`.

## 4. Train YOLOv8s

For the final project, prefer `yolov8s.pt` instead of `yolov8n.pt` if Colab GPU time is available. `yolov8s` is slower than `yolov8n`, but it usually detects small plates more confidently.

```python
from ultralytics import YOLO

model = YOLO("yolov8s.pt")
results = model.train(
    data=f"{dataset.location}/data.yaml",
    epochs=80,
    imgsz=768,
    batch=16,
    patience=15,
    optimizer="AdamW",
    lr0=0.001,
    cos_lr=True,
    degrees=8,
    translate=0.08,
    scale=0.4,
    shear=2,
    perspective=0.0005,
    fliplr=0.5,
    mosaic=1.0,
    mixup=0.08,
    hsv_h=0.015,
    hsv_s=0.7,
    hsv_v=0.4,
    project="visionplate_runs",
    name="yolov8s_indian_plate"
)
```

This uses transfer learning. You are still training the model because the final detector is fine-tuned on the license plate dataset.

## 5. Validate

```python
metrics = model.val()
print(metrics.box.map50)
```

## 6. Test On Images

```python
model.predict(source=f"{dataset.location}/test/images", conf=0.25, save=True)
```

## 7. Download Weights

```python
from google.colab import files

files.download("visionplate_runs/yolov8s_indian_plate/weights/best.pt")
```

Place the downloaded file here in this project:

```text
backend/models/yolo/best.pt
```

## 8. Report Metrics To Include

- mAP@0.5
- precision
- recall
- F1 score
- training loss curves
- confusion matrix
- sample predictions

## Dataset Selection Criteria

Use a larger dataset if possible. Good signs:

- At least 2,000 images, preferably 5,000+
- Object Detection task, not classification
- YOLOv8 export available
- Includes cars, bikes, trucks, yellow plates, white plates, day/night, blur, angled plates
- Has train/valid/test split
- Only one class is okay: `number_plate`, `license_plate`, or similar

Avoid datasets where:

- Labels are loose or cover the full vehicle instead of the plate
- Most images are synthetic or same-angle closeups
- It only contains cropped plates and no full vehicle images
- It is OCR-only with text labels but no bounding boxes

## If Colab Runs Out Of Memory

Try these in order:

```python
batch=8
```

or:

```python
imgsz=640
```

Do not reduce epochs first. Smaller batch/image size is better than undertraining.
