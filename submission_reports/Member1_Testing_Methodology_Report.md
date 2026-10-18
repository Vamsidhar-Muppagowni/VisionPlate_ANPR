# VisionPlate ANPR — Testing Methodology Report (Member 1)
**Student Name:** Team Member 1 (Roll No: CB.SC.U4CSE23154)  
**Track:** Object Detection, Denoising Preprocessing & System Robustness  
**Models Evaluated:** YOLOv8s, DnCNN, Pix2Pix  

---

## 1. Quantitative Robustness Testing (Noise Sensitivity)
```text
======================================================================
 CDAO T&E DIMENSION 2: ROBUSTNESS — Noise Level Sensitivity (Cell 20)
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

## 2. Adversarial Threat Testing (FGSM Attack)
```text
======================================================================
 CDAO T&E: ADVERSARIAL TESTING — FGSM Attack on DnCNN (Cell 21)
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

## 3. Metamorphic Testing
```text
======================================================================
 CDAO TESTING METHOD: METAMORPHIC TESTING (Cell 40)
======================================================================
  DnCNN:
    [+] MR1: Flip Commutativity: PASS
    [+] MR2: Brightness Monotonicity: PASS
    [-] MR3: Idempotency (PSNR>25dB): FAIL
```

## 4. Edge Latency Benchmarks
```text
  DnCNN                   : 6.68 ms  (149.8 FPS)
  Pix2Pix Generator       : 4.97 ms  (201.2 FPS)
  PatchGAN Discriminator  : 2.06 ms  (484.6 FPS)
```