from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import datetime
from backend.app.schemas.environmental import EnvironmentalDataBase, EnvironmentalDataResponse

class PredictionRequest(EnvironmentalDataBase):
    pass

class PredictionResponse(BaseModel):
    id: int
    user_id: int
    predicted_aqi: float
    category: str
    health_recommendation: str
    model_used: str
    created_at: datetime.datetime
    environmental_data: Optional[EnvironmentalDataResponse] = None

    class Config:
        from_attributes = True

class ModelPredictionItem(BaseModel):
    model_key: str
    model_name: str
    predicted_aqi: float
    category: str
    category_color: str
    category_badge: str
    health_recommendation: str
    dominant_pollutant: str
    inference_time_ms: float
    status: str = "success"

class ModelComparisonResponse(BaseModel):
    environmental_data: Dict[str, float]
    predictions: List[ModelPredictionItem]
    winning_model: str
    created_at: datetime.datetime

class ModelMetricsItem(BaseModel):
    key: str
    algorithm: str
    filename: str
    mae: float
    mse: float
    rmse: float
    r2_score: float
    training_time_seconds: float
    inference_latency_ms: float
    train_samples: int
    test_samples: int

class ModelMetricsResponse(BaseModel):
    selected_model: str
    selected_model_key: str
    trained_date: str
    total_records: int
    train_size: int
    test_size: int
    features: List[str]
    models: List[ModelMetricsItem]

class PredictionHistoryItem(BaseModel):
    id: int
    predicted_aqi: float
    category: str
    model_used: Optional[str] = "Random Forest Regressor"
    created_at: datetime.datetime
    pm25: float
    pm10: float
    no2: float
    so2: float
    co: float
    o3: float
    temperature: float
    humidity: float

    class Config:
        from_attributes = True

class PredictionHistoryResponse(BaseModel):
    total: int
    items: List[PredictionHistoryItem]
    page: int
    limit: int
    pages: int
