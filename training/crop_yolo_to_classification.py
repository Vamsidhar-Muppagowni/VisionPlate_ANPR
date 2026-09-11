import os
import shutil
from pathlib import Path
import cv2

# Define paths
YOLO_DATASET_DIR = Path("data/yolo_vehicles") # Where you extract the downloaded YOLOv8 zip
CLASSIFICATION_DIR = Path("data/vehicles")    # Where the cropped images will be saved

def crop_yolo_to_classification(yolo_dir: Path, out_dir: Path):
    """
    Converts a YOLOv8 object detection dataset into an Image Classification dataset
    by cropping the bounding boxes and saving them into class folders.
    """
    if not yolo_dir.exists():
        print(f"Error: YOLO dataset directory {yolo_dir} not found.")
        return
    
    # Read the data.yaml to get class names
    yaml_path = yolo_dir / "data.yaml"
    class_names = []
    if yaml_path.exists():
        import yaml
        with open(yaml_path, 'r') as f:
            data = yaml.safe_load(f)
            class_names = data.get('names', [])
    
    if not class_names:
        print("Could not find class names in data.yaml. Please check the dataset format.")
        return
        
    print(f"Found classes: {class_names}")
    
    # Process train, valid, and test folders
    for split in ['train', 'valid', 'test']:
        images_dir = yolo_dir / split / 'images'
        labels_dir = yolo_dir / split / 'labels'
        
        # We will map 'valid' or 'test' to 'val' for Keras
        out_split = 'val' if split in ['valid', 'test'] else 'train'
        split_out_dir = out_dir / out_split
        
        if not images_dir.exists() or not labels_dir.exists():
            continue
            
        print(f"\nProcessing {split} split...")
        
        # Create output class directories
        for class_name in class_names:
            (split_out_dir / class_name).mkdir(parents=True, exist_ok=True)
            
        # Iterate through all images
        for img_path in images_dir.glob("*.jpg"):
            label_path = labels_dir / (img_path.stem + ".txt")
            
            if not label_path.exists():
                continue
                
            img = cv2.imread(str(img_path))
            if img is None:
                continue
                
            height, width = img.shape[:2]
            
            # Read bounding boxes
            with open(label_path, 'r') as f:
                lines = f.readlines()
                
            for i, line in enumerate(lines):
                parts = line.strip().split()
                if len(parts) < 5:
                    continue
                    
                class_id = int(parts[0])
                if class_id >= len(class_names):
                    continue
                    
                class_name = class_names[class_id]
                
                # YOLO format: class x_center y_center width height (normalized 0-1)
                x_center, y_center, w, h = map(float, parts[1:5])
                
                # Convert to pixel coordinates
                x1 = int((x_center - w/2) * width)
                y1 = int((y_center - h/2) * height)
                x2 = int((x_center + w/2) * width)
                y2 = int((y_center + h/2) * height)
                
                # Ensure coordinates are within image bounds
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(width, x2), min(height, y2)
                
                # Crop image
                crop = img[y1:y2, x1:x2]
                
                if crop.size == 0:
                    continue
                    
                # Save cropped image
                out_filename = f"{img_path.stem}_crop_{i}.jpg"
                out_path = split_out_dir / class_name / out_filename
                cv2.imwrite(str(out_path), crop)
                
        print(f"Finished processing {split}.")
        
    print(f"\nSuccess! Cropped classification dataset saved to: {out_dir}")

if __name__ == "__main__":
    import pip
    try:
        import yaml
    except ImportError:
        print("Installing PyYAML...")
        pip.main(['install', 'pyyaml'])
        import yaml
        
    crop_yolo_to_classification(YOLO_DATASET_DIR, CLASSIFICATION_DIR)
