import os
import json
import joblib
import numpy as np
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.models.environmental_data import EnvironmentalData
from backend.app.models.prediction import Prediction
from backend.app.models.user import User
from backend.app.services.preprocessor import preprocessor_service
from backend.app.services.classifier import classify_aqi
from backend.app.services.health_advisory import get_health_recommendation

class PredictionService:
    def __init__(self, model_path: str = None):
        self.model_path = model_path or settings.MODEL_PATH
        self.model = None
        self.model_name = "Random Forest Regressor"
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                # check metrics for model name
                if os.path.exists(settings.METRICS_PATH):
                    with open(settings.METRICS_PATH, "r") as f:
                        data = json.load(f)
                        self.model_name = data.get("selected_model", self.model_name)
            except Exception as e:
                print(f"Warning: Could not load trained model from {self.model_path}: {e}")
        else:
            print(f"Notice: Trained model artifact not found at {self.model_path}.")

    def predict_aqi(
        self,
        db: Session,
        user: User,
        env_params: Dict[str, Any]
    ) -> Prediction:
        if self.model is None:
            self._load_model()
            if self.model is None:
                raise RuntimeError("ML model artifact is not loaded. Please train or verify the model.")

        # 1. Format feature vector
        raw_vector = preprocessor_service.validate_and_format_vector(env_params)
        
        # 2. Scale feature vector
        scaled_features = preprocessor_service.transform(raw_vector)
        
        # 3. Model inference
        prediction_val = float(self.model.predict(scaled_features)[0])
        predicted_aqi = round(max(0.0, min(500.0, prediction_val)), 1)
        
        # 4. Classification & health recommendation
        category = classify_aqi(predicted_aqi)
        recommendation = get_health_recommendation(category)
        
        # 5. Persist environmental record in PostgreSQL / Database
        env_record = EnvironmentalData(
            user_id=user.id,
            pm25=float(env_params['pm25']),
            pm10=float(env_params['pm10']),
            no2=float(env_params['no2']),
            so2=float(env_params['so2']),
            co=float(env_params['co']),
            o3=float(env_params['o3']),
            temperature=float(env_params['temperature']),
            humidity=float(env_params['humidity']),
        )
        db.add(env_record)
        db.flush()  # get env_record.id
        
        # 6. Persist prediction record
        pred_record = Prediction(
            user_id=user.id,
            environmental_data_id=env_record.id,
            predicted_aqi=predicted_aqi,
            category=category,
            health_recommendation=recommendation,
            model_used=self.model_name
        )
        db.add(pred_record)
        db.commit()
        db.refresh(pred_record)
        
        return pred_record

prediction_service = PredictionService()

