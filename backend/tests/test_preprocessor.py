import pytest
import numpy as np
from backend.app.services.preprocessor import preprocessor_service

def test_validate_and_format_vector():
    valid_data = {
        "pm25": 45.2,
        "pm10": 85.0,
        "no2": 22.1,
        "so2": 8.5,
        "co": 0.8,
        "o3": 35.0,
        "temperature": 28.5,
        "humidity": 65.0
    }
    vec = preprocessor_service.validate_and_format_vector(valid_data)
    assert len(vec) == 8
    assert vec[0] == 45.2
    assert vec[7] == 65.0

def test_missing_field_raises_key_error():
    invalid_data = {
        "pm25": 45.2,
        # missing pm10
        "no2": 22.1,
        "so2": 8.5,
        "co": 0.8,
        "o3": 35.0,
        "temperature": 28.5,
        "humidity": 65.0
    }
    with pytest.raises(KeyError):
        preprocessor_service.validate_and_format_vector(invalid_data)

def test_preprocessor_transform():
    vec = [45.0, 90.0, 25.0, 10.0, 0.9, 40.0, 25.0, 60.0]
    transformed = preprocessor_service.transform(vec)
    assert isinstance(transformed, np.ndarray)
    assert transformed.shape == (1, 8)

