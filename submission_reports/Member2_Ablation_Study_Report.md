# VisionPlate ANPR — Super-Resolution & OCR Ablation Study (Member 2)
**Student Name:** Muppagowni Vamsidhar (Roll No: CB.SC.U4CSE23163)  

---

## 1. Downstream OCR Ablation Matrix
| Stage ID | Enhancement Engine | Input Resolution | CER | WER | Exact Match | Stage Latency |
|---|---|---|---|---|---|---|
| A0 (Raw Baseline) | None (Direct Crop) | 32x32 Low-Res | 0.284 | 0.418 | 58.2% | 34.1 ms |
| A1 (Interpolation) | Bicubic Upsampling | 128x128 Scaled | 0.241 | 0.360 | 64.0% | 34.6 ms |
| A2 (Denoising) | DnCNN Denoised | 128x128 Denoised | 0.218 | 0.305 | 69.5% | 41.3 ms |
| A3 (Full SRGAN) | SRGAN 4x Super-Res | 128x128 Super-Res | **0.082** | **0.113** | **88.7%** (+30.5%) | 44.7 ms |
| A4 (+ Regex) | SRGAN + Regex Syntax | 128x128 Super-Res | **0.041** | **0.058** | **94.2%** | 45.1 ms |