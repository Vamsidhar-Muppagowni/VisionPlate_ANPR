# VisionPlate ANPR — Generative Adversarial Network Report (Member 2)
**Student Name:** Muppagowni Vamsidhar (Roll No: CB.SC.U4CSE23163)  
**Model Focus:** SRGAN (Super-Resolution Generative Adversarial Network)  

---

## 1. Network Architecture
- Generator: 8 Residual Blocks + 2x PixelShuffle Upsamplers (934k parameters).
- Discriminator: 8-stage VGG-style classifier (3.89M parameters).
- Loss: $\mathcal{L}_G = \mathcal{L}_{MSE} + 10^{-3} \mathcal{L}_{adv}$.

## 2. Training Convergence
```text
  Epoch [1/20]   G_Loss: 0.0465  D_Loss: 0.5931  PSNR: 14.13 dB  SSIM: 0.3696
  Epoch [5/20]   G_Loss: 0.0114  D_Loss: 0.3289  PSNR: 20.10 dB  SSIM: 0.6803
  Epoch [10/20]  G_Loss: 0.0119  D_Loss: 0.4705  PSNR: 20.45 dB  SSIM: 0.6454
  Epoch [15/20]  G_Loss: 0.0108  D_Loss: 0.4604  PSNR: 20.71 dB  SSIM: 0.7033
  Epoch [20/20]  G_Loss: 0.0094  D_Loss: 0.4406  PSNR: 20.53 dB  SSIM: 0.6824

Best SRGAN Validation PSNR: 21.26 dB
```

## 3. Test Benchmarks
- Test PSNR: **20.84 dB** | SSIM: **0.665** | MSE: **0.0083**
- Latency: **10.64 ms (94.0 FPS)**