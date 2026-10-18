# VisionPlate ANPR — Testing Methodology Report (Member 2)
**Student Name:** Muppagowni Vamsidhar (Roll No: CB.SC.U4CSE23163)  
**Track:** Super-Resolution, Sequence OCR & Intelligence Evaluation  

---

## 1. Dimension 1: Correctness (Test Set Evaluation)
```text
Test Set Results (Image Enhancement Models):
                 Model  PSNR (dB)     SSIM      MSE      MAE
Noisy Input (Baseline)  20.971794 0.721922 0.008027 0.089592
                 DnCNN  17.162224 0.554116 0.019291 0.138893
                 SRGAN  20.840871 0.664575 0.008281 0.090999
               Pix2Pix  10.699676 0.587296 0.085580 0.292540
```

## 2. Back-to-Back Paired t-Test (Statistical Significance)
```text
  DnCNN vs SRGAN:    t = -22.215, p = 0.0000 (***)  Winner: SRGAN  (21.26 dB)
  DnCNN vs Pix2Pix:  t =  34.411, p = 0.0000 (***)  Winner: DnCNN  (17.66 dB)
  SRGAN vs Pix2Pix:  t =  63.886, p = 0.0000 (***)  Winner: SRGAN  (21.26 dB)
```

## 3. Bias & Representativeness Audit
```text
  Total classes: 25 | Imbalance ratio: 349.7:1 | Gini coefficient: 0.5628
```

## 4. Uncertainty Quantification (MC-Dropout 30 passes)
```text
  Mean uncertainty (std): 0.000845 | Max uncertainty (std): 0.006491
```

## 5. Drift Monitoring (Day -> Night shift)
```text
  Step 1: 20.98 dB -> Step 7: 18.59 dB (Retrain Trigger) -> Step 10: 16.48 dB
```