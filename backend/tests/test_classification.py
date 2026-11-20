import pytest
from backend.app.services.classifier import classify_aqi, get_category_metadata
from backend.app.services.health_advisory import get_health_recommendation

def test_aqi_classification_thresholds():
    # Good: 0 - 50
    assert classify_aqi(0) == "Good"
    assert classify_aqi(25.4) == "Good"
    assert classify_aqi(50.0) == "Good"

    # Satisfactory: 51 - 100
    assert classify_aqi(50.1) == "Satisfactory"
    assert classify_aqi(75) == "Satisfactory"
    assert classify_aqi(100.0) == "Satisfactory"

    # Moderate: 101 - 200
    assert classify_aqi(100.1) == "Moderate"
    assert classify_aqi(150.0) == "Moderate"
    assert classify_aqi(200.0) == "Moderate"

    # Poor: 201 - 300
    assert classify_aqi(200.1) == "Poor"
    assert classify_aqi(250) == "Poor"
    assert classify_aqi(300.0) == "Poor"

    # Very Poor: 301 - 400
    assert classify_aqi(300.1) == "Very Poor"
    assert classify_aqi(350.0) == "Very Poor"
    assert classify_aqi(400.0) == "Very Poor"

    # Severe: 401+
    assert classify_aqi(400.1) == "Severe"
    assert classify_aqi(450.0) == "Severe"
    assert classify_aqi(500.0) == "Severe"

def test_health_advisory_messages():
    for cat in ["Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe"]:
        advisory = get_health_recommendation(cat)
        assert len(advisory) > 20
        assert isinstance(advisory, str)

def test_category_metadata():
    good_meta = get_category_metadata("Good")
    assert good_meta["color"] == "#16A34A"
    assert good_meta["badge"] == "good"

