# VisionPlate ANPR — Generative Adversarial Network Report (Member 1)
**Student Name:** Team Member 1 (Roll No: CB.SC.U4CSE23154)  
**Model Focus:** Pix2Pix (Conditional Image Translation)  

---

## 1. Network Architecture
- U-Net Generator with skip connections (16.65M parameters).
- 70x70 PatchGAN Discriminator (2.77M parameters).
- Objective: $\min_G \max_D \mathcal{L}_{cGAN}(G, D) + 100 \mathcal{L}_{L1}(G)$.

## 2. Training Convergence
```text
  Epoch [1/20]   G_Loss: 51.43  D_Loss: 0.38  PSNR:  5.35 dB  SSIM: 0.0220
  Epoch [5/20]   G_Loss: 14.06  D_Loss: 0.05  PSNR: 16.23 dB  SSIM: 0.6361
  Epoch [10/20]  G_Loss: 12.12  D_Loss: 0.04  PSNR: 18.24 dB  SSIM: 0.6267
  Epoch [15/20]  G_Loss:  7.32  D_Loss: 0.49  PSNR: 19.19 dB  SSIM: 0.7640
  Epoch [20/20]  G_Loss:  5.97  D_Loss: 0.65  PSNR: 23.29 dB  SSIM: 0.7711
```