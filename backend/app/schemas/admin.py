from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import datetime

class DatasetResponse(BaseModel):
    id: int
    name: str
    source: str
    record_count: int
    file_path: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class ModelResponse(BaseModel):
    id: int
    algorithm: str
    version: str
    is_active: bool
    mae: Optional[float] = None
    mse: Optional[float] = None
    rmse: Optional[float] = None
    r2_score: Optional[float] = None
    trained_at: datetime.datetime

    class Config:
        from_attributes = True

class ModelEvaluationMetrics(BaseModel):
    algorithm: str
    mae: float
    mse: float
    rmse: float
    r2_score: float
    training_time_seconds: Optional[float] = None
    inference_latency_ms: Optional[float] = None

class ModelEvaluationCompare(BaseModel):
    selected_model: str
    models: List[ModelEvaluationMetrics]

class SystemStatsResponse(BaseModel):
    total_users: int
    total_predictions: int
    active_model: str
    active_model_r2: float
    category_distribution: Dict[str, int]
    daily_predictions_count: List[Dict[str, Any]]

