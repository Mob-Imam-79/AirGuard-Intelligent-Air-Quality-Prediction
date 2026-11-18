import os
import joblib
import numpy as np
import pandas as pd
from typing import List, Dict, Any
from backend.app.config import settings

FEATURE_NAMES = ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3', 'temperature', 'humidity']

class DataPreprocessor:
    def __init__(self, scaler_path: str = None):
        self.scaler_path = scaler_path or settings.SCALER_PATH
        self.scaler = None
        self._load_scaler()

    def _load_scaler(self):
        if os.path.exists(self.scaler_path):
            try:
                self.scaler = joblib.load(self.scaler_path)
            except Exception as e:
                print(f"Warning: Could not load scaler from {self.scaler_path}: {e}")
        else:
            print(f"Notice: Preprocessor scaler not found at {self.scaler_path}. Will use raw values if unscaled.")

    def validate_and_format_vector(self, data: Dict[str, Any]) -> List[float]:
        """
        Extracts and verifies the 8 required environmental parameters in strict order:
        [pm25, pm10, no2, so2, co, o3, temperature, humidity]
        """
        vector = []
        for key in FEATURE_NAMES:
            val = float(data[key])
            vector.append(val)
        return vector

    def transform(self, vector: List[float]) -> np.ndarray:
        if self.scaler is not None:
            df = pd.DataFrame([vector], columns=FEATURE_NAMES)
            return self.scaler.transform(df)
        return np.array(vector, dtype=float).reshape(1, -1)

preprocessor_service = DataPreprocessor()

