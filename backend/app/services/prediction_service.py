import os
import json
import time
import joblib
import datetime
import numpy as np
from typing import Dict, Any, Optional, List, Tuple
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.models.environmental_data import EnvironmentalData
from backend.app.models.prediction import Prediction
from backend.app.models.user import User
from backend.app.services.preprocessor import preprocessor_service
from backend.app.services.classifier import classify_aqi, get_category_metadata, determine_dominant_pollutant
from backend.app.services.health_advisory import get_health_recommendation

MODEL_DISPLAY_NAMES = {
    "linear_regression": "Linear Regression",
    "random_forest": "Random Forest Regression",
    "ann": "Artificial Neural Network (ANN)"
}

class PredictionService:
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.model_name = "Random Forest Regressor"
        self.model = None  # Legacy pointer to active/default model
        self._load_all_models()

    def _load_all_models(self):
        """Loads and caches all three models and maintains legacy fallback."""
        model_paths = {
            "linear_regression": settings.LR_MODEL_PATH,
            "random_forest": settings.RF_MODEL_PATH,
            "ann": settings.ANN_MODEL_PATH
        }
        
        for key, path in model_paths.items():
            if os.path.exists(path):
                try:
                    self.models[key] = joblib.load(path)
                except Exception as e:
                    print(f"Warning: Could not load {key} model from {path}: {e}")
            elif key == "random_forest" and os.path.exists(settings.MODEL_PATH):
                # Fallback to best_model.joblib for random forest
                try:
                    self.models[key] = joblib.load(settings.MODEL_PATH)
                except Exception as e:
                    print(f"Warning: Could not load fallback RF model: {e}")

        # Set default active model (Random Forest)
        if "random_forest" in self.models:
            self.model = self.models["random_forest"]
            self.model_name = "Random Forest Regression"
        elif os.path.exists(settings.MODEL_PATH):
            self.model = joblib.load(settings.MODEL_PATH)
            self.model_name = "Random Forest Regression"

    def _infer_single(self, model: Any, scaled_features: np.ndarray) -> Tuple[float, float]:
        """Runs inference and returns (predicted_aqi, latency_ms)."""
        t0 = time.perf_counter()
        raw_pred = float(model.predict(scaled_features)[0])
        latency_ms = (time.perf_counter() - t0) * 1000.0
        # CPCB scale clamp [0.0, 500.0]
        clamped_aqi = round(max(0.0, min(500.0, raw_pred)), 1)
        return clamped_aqi, round(latency_ms, 3)

    def predict_aqi(
        self,
        db: Session,
        user: User,
        env_params: Dict[str, Any]
    ) -> Prediction:
        """
        Original backward-compatible prediction endpoint (uses default Random Forest).
        """
        return self.predict_with_model(db, user, env_params, model_key="random_forest")

    def predict_with_model(
        self,
        db: Session,
        user: User,
        env_params: Dict[str, Any],
        model_key: str = "random_forest"
    ) -> Prediction:
        """
        Runs prediction with the requested model key ('linear_regression', 'random_forest', 'ann').
        Persists environmental input and prediction record to the database.
        """
        if model_key not in self.models:
            self._load_all_models()
            if model_key not in self.models:
                # If specific model is missing, fallback to default model
                if self.model is None:
                    raise RuntimeError(f"Requested model '{model_key}' is not loaded.")
                chosen_model = self.model
                display_name = self.model_name
            else:
                chosen_model = self.models[model_key]
                display_name = MODEL_DISPLAY_NAMES.get(model_key, model_key)
        else:
            chosen_model = self.models[model_key]
            display_name = MODEL_DISPLAY_NAMES.get(model_key, model_key)

        # 1. Format and scale feature vector
        raw_vector = preprocessor_service.validate_and_format_vector(env_params)
        scaled_features = preprocessor_service.transform(raw_vector)

        # 2. Model inference
        predicted_aqi, _ = self._infer_single(chosen_model, scaled_features)

        # 3. Classification & health recommendation
        category = classify_aqi(predicted_aqi)
        recommendation = get_health_recommendation(category)

        # 4. Persist environmental record
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
        db.flush()

        # 5. Persist prediction record
        pred_record = Prediction(
            user_id=user.id,
            environmental_data_id=env_record.id,
            predicted_aqi=predicted_aqi,
            category=category,
            health_recommendation=recommendation,
            model_used=display_name
        )
        db.add(pred_record)
        db.commit()
        db.refresh(pred_record)

        return pred_record

    def compare_all_models(
        self,
        db: Session,
        user: User,
        env_params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Executes prediction simultaneously across Linear Regression, Random Forest, and ANN,
        and persists the primary prediction record in the database.
        """
        if len(self.models) < 3:
            self._load_all_models()

        raw_vector = preprocessor_service.validate_and_format_vector(env_params)
        scaled_features = preprocessor_service.transform(raw_vector)
        dominant_pollutant = determine_dominant_pollutant(env_params)

        comparison_results: List[Dict[str, Any]] = []
        model_order = ["linear_regression", "random_forest", "ann"]
        
        primary_record = None

        for key in model_order:
            display_name = MODEL_DISPLAY_NAMES[key]
            model = self.models.get(key)
            
            if model is None:
                # If model is not loaded, attempt fallback
                model = self.model

            predicted_aqi, latency_ms = self._infer_single(model, scaled_features)
            category = classify_aqi(predicted_aqi)
            meta = get_category_metadata(category)
            advisory = get_health_recommendation(category)

            item = {
                "model_key": key,
                "model_name": display_name,
                "predicted_aqi": predicted_aqi,
                "category": category,
                "category_color": meta["color"],
                "category_badge": meta["badge"],
                "health_recommendation": advisory,
                "dominant_pollutant": dominant_pollutant,
                "inference_time_ms": latency_ms,
                "status": "success"
            }
            comparison_results.append(item)

        # Persist a record in DB representing this comparison run (using best model RF)
        rf_result = next((r for r in comparison_results if r["model_key"] == "random_forest"), comparison_results[0])
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
        db.flush()

        pred_record = Prediction(
            user_id=user.id,
            environmental_data_id=env_record.id,
            predicted_aqi=rf_result["predicted_aqi"],
            category=rf_result["category"],
            health_recommendation=rf_result["health_recommendation"],
            model_used="Random Forest (Multi-Model Comparison)"
        )
        db.add(pred_record)
        db.commit()

        # Format input params cleanly for response
        clean_inputs = {k: float(env_params[k]) for k in ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3', 'temperature', 'humidity']}

        return {
            "environmental_data": clean_inputs,
            "predictions": comparison_results,
            "winning_model": "Random Forest Regression",
            "created_at": datetime.datetime.utcnow().isoformat()
        }

    def get_models_metrics(self) -> Dict[str, Any]:
        """Loads and returns benchmark metrics for all models from metrics.json."""
        if not os.path.exists(settings.METRICS_PATH):
            raise FileNotFoundError("Model metrics artifact not found. Please train models first.")
        with open(settings.METRICS_PATH, "r") as f:
            return json.load(f)

prediction_service = PredictionService()
