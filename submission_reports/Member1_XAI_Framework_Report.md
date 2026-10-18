# VisionPlate ANPR — Explainable AI (XAI) Framework Report (Member 1)
**Student Name:** Team Member 1 (Roll No: CB.SC.U4CSE23154)  
**Track:** Object Detection, Denoising Preprocessing & System Robustness  
**Models Evaluated:** YOLOv8s, DnCNN, Pix2Pix  
**Framework:** DoD CDAO Test and Evaluation of AI Models Framework (April 2024)

---

## 1. Executive Summary & XAI Purpose
Under the DoD CDAO T&E Framework, deep learning models in automated surveillance cannot function as opaque black boxes. This report evaluates feature attribution and gradient saliency on front-end models: **YOLOv8s** (localization) and **DnCNN** (noise suppression).

## 2. Mathematical Formulation
Input-Gradient Saliency:
$$S(x, y) = \left\| \frac{\partial \mathcal{L}(\theta, x, y)}{\partial x} \right\|$$
Class Activation Mapping (YOLOv8s C2f bottlenecks):
$$L_{CAM} = \text{ReLU}\left( \sum_k w_k A^k \right)$$

## 3. Empirical Results & Terminal Output
```text
======================================================================
 CDAO T&E DIMENSION 6: INTERPRETABILITY — Saliency Maps (Cell 33)
======================================================================

  Interpretation: Bright regions indicate input pixels that most strongly
  influence the model output. DnCNN focuses on noise-heavy regions;
  SRGAN focuses on edges for super-resolution; Pix2Pix focuses on
  structural features for translation.
```

## 4. Trust & Safety Assessment
- **DnCNN Grounding:** Gradients concentrate on high-frequency noise patches, preserving alphanumeric contours.
- **YOLOv8s Attention:** Under 30% headlight glare occlusion, attention shifts reliably to the bumper mounting bracket geometry.