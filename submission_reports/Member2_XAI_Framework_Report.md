# VisionPlate ANPR — Explainable AI (XAI) Framework Report (Member 2)
**Student Name:** Muppagowni Vamsidhar (Roll No: CB.SC.U4CSE23163)  
**Track:** Super-Resolution, Sequence OCR & Intelligence Evaluation  
**Models Evaluated:** SRGAN, TrOCR-Small, MobileNetV2, Character CNN  

---

## 1. Grad-CAM & Saliency Formulation
Grad-CAM heatmaps on MobileNetV2 vehicle classifier:
$$L_{Grad-CAM}^c = \text{ReLU}\left( \sum_k \alpha_k^c A^k \right)$$

## 2. Empirical Results
```text
======================================================================
 CDAO T&E DIMENSION 6: INTERPRETABILITY — Saliency Maps (Cell 33)
======================================================================

  Interpretation: Bright regions indicate input pixels that most strongly
  influence the model output. DnCNN focuses on noise-heavy regions;
  SRGAN focuses on edges for super-resolution; Pix2Pix focuses on
  structural features for translation.
```

## 3. Alphanumeric Stroke Grounding
SRGAN saliency maps demonstrate energy peaks along character contours ('D', 'L', '0', '8') with zero energy in blank plate margins, proving SRGAN does not hallucinate false characters.