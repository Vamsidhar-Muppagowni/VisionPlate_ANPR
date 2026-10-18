# VisionPlate ANPR — KMeans Clustering Analysis Report (Member 1)
**Student Name:** Team Member 1 (Roll No: CB.SC.U4CSE23154)  
**Track:** Object Detection, Denoising Preprocessing & System Robustness  

---

## 1. Methodology & Feature Engineering
Input 4D vector:
$$F_i = [ \text{Aspect\_Ratio}, \text{Relative\_Area}, \text{Luminance}, \text{Noise\_Variance} ]$$

## 2. Stratification Matrix (K=4, Silhouette: 0.584)
| Cluster ID | Stratum Name | Population | Dominant Characteristics | YOLOv8s Recall |
|---|---|---|---|---|
| Cluster 0 | Daylight Standard | 46.2% | High contrast, standard 3.2:1 aspect ratio | 98.4% |
| Cluster 1 | Low-Light / Noise | 28.5% | $\sigma > 20$, Luminance $Y < 45$ | 82.1% |
| Cluster 2 | Overexposed / Glare | 14.1% | Saturated $Y > 210$, washed borders | 76.5% |
| Cluster 3 | Severe Tilt | 11.2% | Skewed aspect ratio $> 4.5:1$ | 88.9% |