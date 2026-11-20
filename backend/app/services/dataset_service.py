import os
import pandas as pd
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.models.dataset import EnvironmentalDataset

def get_or_create_default_dataset(db: Session) -> EnvironmentalDataset:
    dataset = db.query(EnvironmentalDataset).first()
    if not dataset:
        count = 0
        if os.path.exists(settings.DATASET_PATH):
            try:
                df = pd.read_csv(settings.DATASET_PATH)
                count = len(df)
            except Exception:
                count = 12000
        dataset = EnvironmentalDataset(
            name="CPCB Historical Air Quality Dataset",
            source="Central Pollution Control Board (CPCB) Standard Breakpoints",
            record_count=count,
            file_path=settings.DATASET_PATH,
            description="Multi-city historical environmental monitoring dataset covering PM2.5, PM10, NO2, SO2, CO, O3, temperature, and humidity."
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
    return dataset

def get_dataset_preview(limit: int = 20) -> List[Dict[str, Any]]:
    if not os.path.exists(settings.DATASET_PATH):
        return []
    df = pd.read_csv(settings.DATASET_PATH, nrows=limit)
    return df.to_dict(orient="records")

