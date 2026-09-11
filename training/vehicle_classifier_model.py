import os
from pathlib import Path

import tensorflow as tf
from tensorflow.keras import layers, models, callbacks
from tensorflow.keras.applications import MobileNetV2

# Define paths matching the ANPR pipeline
IMAGE_SIZE = (128, 128) # Pipeline resizes to 128x128
DATA_DIR = Path("data/vehicles")
MODEL_DIR = Path("../backend/models/cnn")
MODEL_PATH = MODEL_DIR / "vehicle_classifier.keras"
CLASSES_PATH = MODEL_DIR / "classes.txt"


def build_powerful_model(num_classes: int) -> tf.keras.Model:
    """Builds a powerful vehicle classifier using Transfer Learning (MobileNetV2)."""
    
    # 1. Powerful Data Augmentation
    data_augmentation = tf.keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.15),
        layers.RandomZoom(0.2),
        layers.RandomTranslation(0.1, 0.1),
        layers.RandomContrast(0.2)
    ], name="data_augmentation")

    # 2. Pre-trained Foundation Model (MobileNetV2)
    # MobileNetV2 is incredibly fast and highly accurate for this task
    base_model = MobileNetV2(
        input_shape=(128, 128, 3),
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze the base model to only train the new classification head first
    base_model.trainable = False

    # 3. Build the final architecture
    inputs = layers.Input(shape=(128, 128, 3))
    x = data_augmentation(inputs)
    
    # MobileNetV2 expects inputs in range [-1, 1], so we preprocess
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
    
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.3)(x)
    
    outputs = layers.Dense(num_classes, activation="softmax")(x)
    
    model = models.Model(inputs, outputs)
    
    # Compile with AdamW for better weight decay handling
    optimizer = tf.keras.optimizers.Adam(learning_rate=0.001)
    
    model.compile(
        optimizer=optimizer,
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )
    return model


def main() -> None:
    if not (DATA_DIR / "train").exists():
        print(f"ERROR: Dataset not found at {DATA_DIR}/train")
        print("Please download a vehicle dataset and place it in data/vehicles/train and data/vehicles/val")
        return

    print("Loading datasets...")
    train_ds = tf.keras.utils.image_dataset_from_directory(
        DATA_DIR / "train",
        image_size=IMAGE_SIZE,
        batch_size=32,
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATA_DIR / "val",
        image_size=IMAGE_SIZE,
        batch_size=32,
    )

    class_names = train_ds.class_names
    print(f"Found classes: {class_names}")

    # Save the class names to classes.txt so the pipeline knows them
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    with open(CLASSES_PATH, "w") as f:
        f.write(",".join(class_names))
    print(f"Saved classes to {CLASSES_PATH}")

    model = build_powerful_model(len(class_names))
    model.summary()

    # Callbacks
    early_stopping = callbacks.EarlyStopping(
        monitor="val_loss", patience=5, restore_best_weights=True, verbose=1
    )
    reduce_lr = callbacks.ReduceLROnPlateau(
        monitor="val_loss", factor=0.5, patience=2, min_lr=1e-6, verbose=1
    )

    print("\n--- Phase 1: Training the Head ---")
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=15,
        callbacks=[early_stopping, reduce_lr]
    )

    print("\n--- Phase 2: Fine-Tuning the Base Model ---")
    # Unfreeze the base model
    model.layers[4].trainable = True # The MobileNetV2 layer
    
    # Recompile with a VERY small learning rate
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )
    
    # Train a bit more to fine-tune the features specifically for vehicles
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=10,
        callbacks=[early_stopping]
    )

    # Save final model
    model.save(MODEL_PATH)
    print(f"\nPowerful Vehicle Classifier saved to {MODEL_PATH}")


if __name__ == "__main__":
    main()
