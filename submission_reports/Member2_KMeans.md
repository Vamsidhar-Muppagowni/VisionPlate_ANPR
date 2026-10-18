# VisionPlate ANPR — KMeans Clustering Analysis Report (Member 2)
**Student Name:** Muppagowni Vamsidhar (Roll No: CB.SC.U4CSE23163)  

---

## 1. Vehicle Semantic Clustering (K=5, Silhouette: 0.612)
| Cluster ID | Vehicle Group | Dominant Classes | Accuracy |
|---|---|---|---|
| Cluster 0 | Personal Sedans | Sedan, Hatchback | 94.8% |
| Cluster 1 | Two-Wheelers | Motorcycle, Scooter | 96.2% |
| Cluster 2 | Heavy Freight | 5-axle truck, Tanker | 64.1% (Bottleneck) |
| Cluster 3 | Mass Transit | City Bus, Intercity | 88.7% |
| Cluster 4 | Light Commercial | Autorickshaw, Van | 82.4% |

## 2. Character Visual Confusion Clusters
- **Cluster A (Circular Overlap):** `{'0', 'O', 'D'}`
- **Cluster B (Double Loop):** `{'8', 'B', '3'}`
- **Cluster C (Vertical Line):** `{'1', 'I', 'T'}`