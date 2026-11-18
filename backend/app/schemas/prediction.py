from pydantic import BaseModel, Field
from typing import Optional, List
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

class PredictionHistoryItem(BaseModel):
    id: int
    predicted_aqi: float
    category: str
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

