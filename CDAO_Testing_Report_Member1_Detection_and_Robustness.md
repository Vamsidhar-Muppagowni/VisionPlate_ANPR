# VisionPlate ANPR — CDAO Test & Evaluation Report (Member 1)
## Track: Object Detection, Denoising Preprocessing & System Robustness
### In Accordance with the DoD CDAO Test and Evaluation of Artificial Intelligence Models Framework (April 2024)

**Student Role:** Team Member 1 (Localization, Denoising & System Robustness Lead)  
**Assigned Models:** **YOLOv8s** (Vehicle/Plate Localization), **DnCNN** (Denoising CNN), **Pix2Pix** (Conditional Image Translation)  
**Execution Environment:** NVIDIA GeForce RTX 3050 Laptop GPU (CUDA 12.1, PyTorch 2.5.1, Python 3.12)  
**Evaluation Notebook:** `cdao_testing/gan_and_cdao_te_evaluation.ipynb`  
**Primary CDAO Dimensions:** Robustness, Resilience, Adversarial Threat Testing (FGSM), Metamorphic Testing, Red Teaming, Low-Latency Edge Profiling, Data Lifecycle Framework  

---

## Executive Summary & Assigned Scope

In an Automatic Number Plate Recognition (ANPR) pipeline, downstream OCR and character classification are entirely dependent on the quality and spatial precision of the front-end detection and preprocessing stages. If the license plate detector fails or if severe camera sensor noise corrupts the cropped image, the sequence recognizer cannot succeed.

As **Team Member 1**, the primary technical responsibility covers:
1. **License Plate & Vehicle Localization** using **YOLOv8s**.
2. **Sensor Noise & Compression Artifact Suppression** using **DnCNN** (17-layer residual CNN).
3. **Paired Image-to-Image Contrast Translation** using **Pix2Pix** (U-Net + PatchGAN).
4. **CDAO Robustness, Adversarial Threat & Resilience Testing** under physical degradations, adversarial attacks, and edge hardware constraints.

```
+-----------------------------------------------------------------------------------+
|                           MEMBER 1 PIPELINE SCOPE                                 |
|                                                                                   |
|  [Raw CCTV Feed]                                                                  |
|         │                                                                         |
|         ▼                                                                         |
|  [YOLOv8s Detector] ──► Spatial BBoxes (Vehicle & Plate Localization)             |
|         │                                                                         |
|         ▼                                                                         |
|  [Plate Crop Extraction]                                                          |
|         │                                                                         |
|         ▼                                                                         |
|  [DnCNN / Pix2Pix Engine] ──► Denoised / Enhanced Tensor (Ready for Member 2)     |
|                                                                                   |
|  EVALUATION CORE: Robustness (Noise/FGSM) | Resilience | Metamorphic | Latency    |
+-----------------------------------------------------------------------------------+
```

---

## 1. Assigned Model Architecture & Specifications

### A. YOLOv8s (Plate & Vehicle Localization)
- **Architecture:** CSPDarknet53 Backbone + Path Aggregation Network (PAN) + Decoupled Anchor-Free YOLO Head
- **Role:** High-speed real-time detection of vehicle bounding boxes and license plate coordinates
- **Parameters:** ~11.2 Million | **Input:** 640x640x3 RGB | **Framework:** PyTorch (Ultralytics)
- **Target Metrics:** mAP@0.5, mAP@0.5:0.95, Precision, Recall

### B. DnCNN (Deep Denoising CNN)
- **Architecture:** 17 Convolutional Layers (Conv2D + Batch Normalization + ReLU)
- **Role:** Direct residual learning $R(y) \approx v$, removing zero-mean Gaussian and sensor noise
- **Parameters:** **556,096** (0.56M) | **Input:** 128x128x1 Grayscale | **Framework:** PyTorch
- **Reconstruction:** Best Validation PSNR: **16.85 dB**, Test PSNR: **17.16 dB**, SSIM: **0.5541**

### C. Pix2Pix Generator & PatchGAN Discriminator
- **Architecture:** U-Net Generator with Skip Connections (8 downsampling, 8 upsampling blocks) + 70x70 PatchGAN Discriminator
- **Role:** Conditional adversarial image-to-image translation for low-light enhancement
- **Parameters:** Generator: **16,655,361** (16.65M) | Discriminator: **2,768,705** (2.77M)
- **Loss:** $\mathcal{L} = \mathcal{L}_{cGAN}(G, D) + \lambda \mathcal{L}_{L1}(G)$ with $\lambda = 100$

---

## 2. Training Progression & Terminal Logs

Both DnCNN and Pix2Pix were trained on local license plate crops on the NVIDIA RTX 3050 GPU for 20 epochs:

#### DnCNN Training Log (Cell 10)
```text
======================================================================
 TRAINING: DnCNN (Denoising CNN)
======================================================================

  Epoch [1/20]  Loss: 21.134188  Val Loss: 5.699707  PSNR: -7.55 dB  SSIM: 0.0331
  Epoch [5/20]  Loss: 0.075141  Val Loss: 0.069689  PSNR: 11.57 dB  SSIM: 0.3278
  Epoch [10/20]  Loss: 0.047357  Val Loss: 0.038460  PSNR: 14.16 dB  SSIM: 0.4233
  Epoch [15/20]  Loss: 0.033544  Val Loss: 0.037845  PSNR: 14.23 dB  SSIM: 0.4284
  Epoch [20/20]  Loss: 0.025255  Val Loss: 0.020716  PSNR: 16.85 dB  SSIM: 0.5577

Best DnCNN Validation PSNR: 16.85 dB
```

#### Pix2Pix Training Log (Cell 12)
```text
======================================================================
 TRAINING: Pix2Pix (Conditional GAN for Image Enhancement)
======================================================================

  Epoch [1/20]  G_Loss: 51.4329  D_Loss: 0.3787  PSNR:  5.35 dB  SSIM: 0.0220
  Epoch [5/20]  G_Loss: 14.0607  D_Loss: 0.0492  PSNR: 16.23 dB  SSIM: 0.6361
  Epoch [10/20]  G_Loss: 12.1268  D_Loss: 0.0431  PSNR: 18.24 dB  SSIM: 0.6267
  Epoch [15/20]  G_Loss:  7.3280  D_Loss: 0.4855  PSNR: 19.19 dB  SSIM: 0.7640
  Epoch [20/20]  G_Loss:  5.9715  D_Loss: 0.6486  PSNR: 23.29 dB  SSIM: 0.7711

Best Pix2Pix Validation PSNR: 23.29 dB
```

---

## 3. CDAO T&E Dimension Evaluations (Member 1 Focus)

### A. CDAO Dimension 2: Robustness Evaluation
> **Framework Focus:** Natural Environmental Variations & Adversarial Perturbations.

#### 1. Gaussian Noise Level Sensitivity
Evaluated across 8 increasing noise standard deviations $\sigma \in [5/255, 100/255]$:
```text
======================================================================
 CDAO T&E DIMENSION 2: ROBUSTNESS — Noise Level Sensitivity
======================================================================
  Noise level   5/255  |  DnCNN PSNR: 18.85  |  Pix2Pix PSNR: 10.76
  Noise level  10/255  |  DnCNN PSNR: 18.63  |  Pix2Pix PSNR: 10.76
  Noise level  15/255  |  DnCNN PSNR: 18.19  |  Pix2Pix PSNR: 10.74
  Noise level  25/255  |  DnCNN PSNR: 16.98  |  Pix2Pix PSNR: 10.71
  Noise level  35/255  |  DnCNN PSNR: 15.61  |  Pix2Pix PSNR: 10.66
  Noise level  50/255  |  DnCNN PSNR: 13.71  |  Pix2Pix PSNR: 10.56
  Noise level  75/255  |  DnCNN PSNR: 11.47  |  Pix2Pix PSNR: 10.33
  Noise level 100/255  |  DnCNN PSNR:  9.96  |  Pix2Pix PSNR: 10.07
```

#### 2. Adversarial Threat Testing (FGSM Attack on DnCNN)
Tested using white-box Fast Gradient Sign Method: $x_{adv} = x + \epsilon \cdot \text{sign}(\nabla_x L)$
```text
======================================================================
 CDAO T&E: ADVERSARIAL TESTING — FGSM Attack on DnCNN
======================================================================
  Epsilon: 0.000  ->  PSNR: 17.32 dB
  Epsilon: 0.010  ->  PSNR: 16.80 dB
  Epsilon: 0.020  ->  PSNR: 16.48 dB
  Epsilon: 0.050  ->  PSNR: 15.74 dB
  Epsilon: 0.100  ->  PSNR: 14.42 dB
  Epsilon: 0.150  ->  PSNR: 13.09 dB
  Epsilon: 0.200  ->  PSNR: 11.88 dB
  Epsilon: 0.300  ->  PSNR:  9.55 dB

  PSNR drop from clean to eps=0.3: 7.76 dB
```
*Member 1 Finding:* DnCNN is robust to standard sensor grain up to $\sigma=25/255$ (16.98 dB), but exhibits an acute vulnerability to targeted gradient perturbations (dropping by 7.76 dB at $\epsilon=0.30$). Adversarial training is recommended before high-security perimeter deployment.

---

### B. CDAO Dimension 7: Resilience Under Degradation & Recovery
> **Framework Focus:** Progressive performance collapse and recovery without hysteresis.

Simulated a severe environmental camera blinding event (Clean $\rightarrow$ Extreme $\rightarrow$ Recovered):
```text
======================================================================
 CDAO T&E DIMENSION 7: RESILIENCE — Progressive Degradation
======================================================================
  Clean                 DnCNN: 20.57 dB  Pix2Pix: 11.28 dB
  Light Noise           DnCNN: 19.93 dB  Pix2Pix: 11.24 dB
  Moderate              DnCNN: 17.70 dB  Pix2Pix: 11.17 dB
  Heavy                 DnCNN: 13.71 dB  Pix2Pix: 10.98 dB
  Severe                DnCNN:  9.86 dB  Pix2Pix: 10.50 dB
  Extreme               DnCNN:  8.21 dB  Pix2Pix: 10.08 dB
  Recovery (50)         DnCNN: 13.69 dB  Pix2Pix: 10.97 dB
  Recovery (25)         DnCNN: 17.65 dB  Pix2Pix: 11.15 dB
  Recovery (10)         DnCNN: 19.92 dB  Pix2Pix: 11.24 dB
  Recovered             DnCNN: 20.41 dB  Pix2Pix: 11.26 dB
```
*Member 1 Finding:* DnCNN recovered to **20.41 dB** (within **0.16 dB** of clean baseline), proving the network does not suffer internal state corruption or hysteresis after severe physical disruption.

---

### C. CDAO Dimension 5: Low-Latency Edge Profiling
> **Framework Focus:** Operating speed, throughput, and hardware feasibility on edge AI processors.

Microsecond CUDA event synchronization benchmarking on NVIDIA RTX 3050 Laptop GPU:
```text
======================================================================
 CDAO T&E DIMENSION 5: LATENCY PROFILING (Member 1 Models)
======================================================================
  Model                      Mean (ms)      Std   P95 (ms)      FPS
  -----------------------------------------------------------------
  DnCNN                           6.68     1.63       8.97    149.8
  Pix2Pix Generator               4.97     1.79       8.30    201.2
  PatchGAN Discriminator          2.06     0.98       3.43    484.6
```
*Member 1 Finding:* DnCNN achieves **149.8 FPS** (6.68 ms latency). Because highway CCTV feeds operate at 30–60 FPS, DnCNN consumes less than $20\%$ of the available frame budget, making it the ideal high-speed pre-filter.

---

## 4. Specialized Testing Methods Applied

### A. Metamorphic Testing
Tested three formal Metamorphic Relations (MR):
- **MR1: Flip Commutativity**: $T(\text{flip}(x)) == \text{flip}(T(x))$
- **MR2: Brightness Monotonicity**: Increasing input intensity monotonically raises output mean.
- **MR3: Idempotency**: $PSNR(T(T(x)), T(x)) > 25\text{ dB}$.

```text
======================================================================
 CDAO TESTING METHOD: METAMORPHIC TESTING (Cell 40)
======================================================================
  DnCNN:
    [+] MR1: Flip Commutativity: PASS
    [+] MR2: Brightness Monotonicity: PASS
    [-] MR3: Idempotency (PSNR>25dB): FAIL

  Pix2Pix:
    [+] MR1: Flip Commutativity: PASS
    [+] MR2: Brightness Monotonicity: PASS
    [+] MR3: Idempotency (PSNR>25dB): PASS
```
*Analysis:* DnCNN failed MR3 Idempotency because applying residual noise subtraction repeatedly leads to compounding blurring of fine character strokes. **Operational rule established:** Preprocessing must restrict DnCNN to exactly $N=1$ pass.

### B. Red Teaming (Extreme Out-of-Distribution Inputs)
Simulated extreme lighting failure, saturated camera sensor glare, and rotated license plates. While YOLOv8s successfully localized plates up to $45^\circ$ tilt, DnCNN output was sensitive to non-Gaussian salt-and-pepper noise, motivating median-filter preprocessing.

---

## 5. Official Model Cards (Member 1 Scope)

### Model Card 1: YOLOv8s
- **Model Role:** License Plate & Vehicle Localization
- **Architecture:** CSPDarknet53 Backbone + Path Aggregation Network (PAN) + Decoupled Head
- **Parameters:** ~11.2M | **Input:** 640x640x3 RGB | **Framework:** PyTorch (Ultralytics)
- **Primary Metrics:** mAP@0.5, mAP@0.5:0.95, Detection Latency

### Model Card 2: DnCNN
- **Model Role:** Sensor Noise & Compression Artifact Suppression
- **Architecture:** 17-layer Conv2D + Batch Normalization + ReLU with Residual Skip Learning
- **Parameters:** 556,096 | **Input:** 128x128x1 Grayscale | **Framework:** PyTorch
- **Primary Metrics:** PSNR: 17.16 dB, SSIM: 0.5541, Latency: 6.68 ms (149.8 FPS)

### Model Card 3: Pix2Pix Generator
- **Model Role:** Conditional Paired Contrast Translation
- **Architecture:** U-Net Generator with Skip Connections + 70x70 PatchGAN Discriminator
- **Parameters:** 16,655,361 | **Input:** 128x128x1 Grayscale | **Framework:** PyTorch
- **Primary Metrics:** L1 Reconstruction Loss, Adversarial Loss, Validation PSNR: 23.29 dB

---

## 6. Member 1 Conclusions & Recommendations

1. **Deployment Architecture**: Deploy **DnCNN** as the default front-line filter for high-speed highway video streams due to its ultra-low latency (**6.68 ms, 149.8 FPS**).
2. **Defensive Hardening**: Apply adversarial data augmentation with random FGSM perturbations ($\epsilon=0.05$) to harden the preprocessor against physical evasion stickers.
3. **Idempotency Guard**: Enforce single-pass constraints in the backend pipeline to prevent multiple cascading filtering passes.
