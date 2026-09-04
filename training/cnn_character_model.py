"""CNN scaffold for character-level plate recognition.

Use this after creating a dataset of segmented plate characters with folders:

data/chars/train/A, data/chars/train/B, ..., data/chars/train/0, ...
data/chars/val/A, data/chars/val/B, ..., data/chars/val/0, ...
"""

from pathlib import Path

import tensorflow as tf
from tensorflow.keras import layers, models


IMAGE_SIZE = (32, 32)
DATA_DIR = Path("data/chars")
MODEL_PATH = Path("../backend/models/cnn/character_cnn.keras")


def build_model(num_classes: int) -> tf.keras.Model:
    model = models.Sequential(
        [
            layers.Input(shape=(32, 32, 1)),
            layers.Rescaling(1.0 / 255),
            layers.Conv2D(32, 3, activation="relu", padding="same"),
            layers.MaxPooling2D(),
            layers.Conv2D(64, 3, activation="relu", padding="same"),
            layers.MaxPooling2D(),
            layers.Conv2D(128, 3, activation="relu", padding="same"),
            layers.Flatten(),
            layers.Dense(128, activation="relu"),
            layers.Dropout(0.3),
            layers.Dense(num_classes, activation="softmax"),
        ]
    )
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
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
    model.fit(train_ds, validation_data=val_ds, epochs=20)
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    model.save(MODEL_PATH)


if __name__ == "__main__":
    main()
