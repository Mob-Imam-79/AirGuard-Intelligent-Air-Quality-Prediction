import os
import joblib
import numpy as np
import pytest
from backend.app.config import settings
from backend.app.services.preprocessor import preprocessor_service, FEATURE_NAMES
from backend.app.services.prediction_service import prediction_service

def test_ml_model_artifacts_exist():
    assert os.path.exists(settings.LR_MODEL_PATH), "Linear Regression model artifact missing"
    assert os.path.exists(settings.RF_MODEL_PATH), "Random Forest model artifact missing"
    assert os.path.exists(settings.ANN_MODEL_PATH), "ANN model artifact missing"
    assert os.path.exists(settings.SCALER_PATH), "Preprocessor scaler artifact missing"
    assert os.path.exists(settings.METRICS_PATH), "Evaluation metrics artifact missing"

def test_scaler_feature_properties():
    scaler = preprocessor_service.scaler
    assert scaler is not None
    assert hasattr(scaler, "mean_")
    assert len(scaler.mean_) == 8
    assert len(scaler.scale_) == 8
    assert list(FEATURE_NAMES) == ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3', 'temperature', 'humidity']

def test_prediction_reproducibility():
    """Identical environmental inputs must yield exact identical outputs."""
    payload = {
        "pm25": 55.0, "pm10": 95.0, "no2": 24.0, "so2": 10.0,
        "co": 0.9, "o3": 32.0, "temperature": 26.0, "humidity": 58.0
    }
    raw = preprocessor_service.validate_and_format_vector(payload)
    scaled = preprocessor_service.transform(raw)

    for key, model in prediction_service.models.items():
        pred1 = float(model.predict(scaled)[0])
        pred2 = float(model.predict(scaled)[0])
        assert np.isclose(pred1, pred2, atol=1e-4), f"Model {key} produced non-deterministic results: {pred1} vs {pred2}"

def test_pollution_monotonicity():
    """When pollution levels increase significantly, AQI should trend upward across all models."""
    clean_env = {
        "pm25": 10.0, "pm10": 20.0, "no2": 8.0, "so2": 3.0,
        "co": 0.2, "o3": 12.0, "temperature": 24.0, "humidity": 50.0
    }
    dirty_env = {
        "pm25": 250.0, "pm10": 400.0, "no2": 160.0, "so2": 90.0,
        "co": 4.5, "o3": 180.0, "temperature": 24.0, "humidity": 50.0
    }

    clean_scaled = preprocessor_service.transform(preprocessor_service.validate_and_format_vector(clean_env))
    dirty_scaled = preprocessor_service.transform(preprocessor_service.validate_and_format_vector(dirty_env))

    for key, model in prediction_service.models.items():
        clean_pred = float(model.predict(clean_scaled)[0])
        dirty_pred = float(model.predict(dirty_scaled)[0])
        assert dirty_pred > clean_pred, f"Model {key} failed monotonicity check: clean={clean_pred}, dirty={dirty_pred}"

def test_cpcb_clamp_bounds():
    """Verify that predictions are constrained within standard physical bounds [0, 500]."""
    mock_model = type("MockModel", (), {"predict": lambda self, x: np.array([-50.0])})()
    clamped_low, _ = prediction_service._infer_single(mock_model, np.zeros((1, 8)))
    assert clamped_low == 0.0

    mock_high_model = type("MockModel", (), {"predict": lambda self, x: np.array([999.0])})()
    clamped_high, _ = prediction_service._infer_single(mock_high_model, np.zeros((1, 8)))
    assert clamped_high == 500.0
