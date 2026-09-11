"""CNN scaffold for character-level plate recognition.

Use this after creating a dataset of segmented plate characters with folders:

data/chars/train/A, data/chars/train/B, ..., data/chars/train/0, ...
data/chars/val/A, data/chars/val/B, ..., data/chars/val/0, ...
"""

from pathlib import Path

import tensorflow as tf
from tensorflow.keras import layers, models, callbacks


IMAGE_SIZE = (32, 32)
DATA_DIR = Path("data/chars")
MODEL_PATH = Path("../backend/models/cnn/character_cnn.keras")


def build_model(num_classes: int) -> tf.keras.Model:
    # Data Augmentation layers
    data_augmentation = tf.keras.Sequential([
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
        layers.RandomTranslation(0.1, 0.1),
    ], name="data_augmentation")

    model = models.Sequential(
        [
            layers.Input(shape=(32, 32, 1)),
            data_augmentation,
            layers.Rescaling(1.0 / 255),
            
            # Block 1
            layers.Conv2D(32, 3, padding="same", use_bias=False),
            layers.BatchNormalization(),
            layers.Activation("relu"),
            layers.Conv2D(32, 3, padding="same", use_bias=False),
            layers.BatchNormalization(),
            layers.Activation("relu"),
            layers.MaxPooling2D(),
            layers.Dropout(0.25),
            
            # Block 2
            layers.Conv2D(64, 3, padding="same", use_bias=False),
            layers.BatchNormalization(),
            layers.Activation("relu"),
            layers.Conv2D(64, 3, padding="same", use_bias=False),
            layers.BatchNormalization(),
            layers.Activation("relu"),
            layers.MaxPooling2D(),
            layers.Dropout(0.25),
            
            # Block 3
            layers.Conv2D(128, 3, padding="same", use_bias=False),
            layers.BatchNormalization(),
            layers.Activation("relu"),
            layers.MaxPooling2D(),
            layers.Dropout(0.25),
            
            # Dense layers
            layers.Flatten(),
            layers.Dense(256, use_bias=False),
            layers.BatchNormalization(),
            layers.Activation("relu"),
            layers.Dropout(0.5),
            layers.Dense(num_classes, activation="softmax"),
        ]
    )
    
    # Use AdamW or Adam with slightly lower learning rate
    optimizer = tf.keras.optimizers.Adam(learning_rate=0.001)
    
    model.compile(
        optimizer=optimizer, 
        loss="sparse_categorical_crossentropy", 
        metrics=["accuracy"]
    )
    return model


def main() -> None:
    train_ds = tf.keras.utils.image_dataset_from_directory(
        DATA_DIR / "train",
        color_mode="grayscale",
        image_size=IMAGE_SIZE,
        batch_size=64,
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATA_DIR / "val",
        color_mode="grayscale",
        image_size=IMAGE_SIZE,
        batch_size=64,
    )

    model = build_model(len(train_ds.class_names))
    model.summary()
    
    # Callbacks for better training
    early_stopping = callbacks.EarlyStopping(
        monitor="val_loss",
        patience=8,
        restore_best_weights=True,
        verbose=1
    )
    
    reduce_lr = callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=3,
        min_lr=1e-6,
        verbose=1
    )

    model.fit(
        train_ds, 
        validation_data=val_ds, 
        epochs=50,
        callbacks=[early_stopping, reduce_lr]
    )
    
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    model.save(MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")


if __name__ == "__main__":
    main()
