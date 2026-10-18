# VisionPlate ANPR — Preprocessing Ablation Study (Member 1)
**Student Name:** Team Member 1 (Roll No: CB.SC.U4CSE23154)  

---

## 1. Ablation Matrix
| Config ID | Pipeline Configuration | Noise Level | Plate mAP@0.5 | Latency | Downstream OCR CER |
|---|---|---|---|---|---|
| C1 (Baseline) | Raw CCTV Frame -> YOLOv8s default | Clean | 0.824 | 14.2 ms | 0.284 |
| C2 (No Norm) | YOLOv8s without letterbox norm | Clean | 0.781 | 13.8 ms | 0.312 |
| C3 (Noise Alone) | YOLOv8s on noisy frames ($\sigma=25$) | $\sigma=25$ | 0.694 | 14.3 ms | 0.458 |
| C4 (+ DnCNN) | Noisy Frames -> DnCNN -> YOLOv8s | $\sigma=25$ | **0.818** (+12.4%) | 21.0 ms | **0.218** |
| C5 (Multi-Pass) | Noisy Frames -> DnCNN (2 passes) -> YOLOv8s | $\sigma=25$ | 0.742 | 27.7 ms | 0.295 |