import sqlite3
from pathlib import Path


DB_PATH = Path(__file__).resolve().parents[1] / "data" / "detections.db"


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS detections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_type TEXT NOT NULL,
                filename TEXT NOT NULL,
                plate_text TEXT NOT NULL,
                detection_confidence REAL NOT NULL,
                ocr_confidence REAL NOT NULL,
                is_valid INTEGER NOT NULL,
                output_path TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


def insert_detection(record: dict) -> None:
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT INTO detections (
                source_type, filename, plate_text, detection_confidence,
                ocr_confidence, is_valid, output_path, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                record["source_type"],
                record["filename"],
                record["plate_text"],
                record["detection_confidence"],
                record["ocr_confidence"],
                int(record["is_valid"]),
                record["output_path"],
                record["created_at"],
            ),
        )
        conn.commit()


def list_detections(limit: int = 100) -> list[dict]:
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT * FROM detections ORDER BY id DESC LIMIT ?",
            (limit,),
        ).fetchall()
    return [dict(row) for row in rows]
