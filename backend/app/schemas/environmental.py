from pydantic import BaseModel, Field
from typing import Optional
import datetime

class EnvironmentalDataBase(BaseModel):
    pm25: float = Field(..., ge=0.0, le=1000.0, description="PM2.5 concentration in µg/m³")
    pm10: float = Field(..., ge=0.0, le=1500.0, description="PM10 concentration in µg/m³")
    no2: float = Field(..., ge=0.0, le=500.0, description="NO2 concentration in µg/m³")
    so2: float = Field(..., ge=0.0, le=500.0, description="SO2 concentration in µg/m³")
    co: float = Field(..., ge=0.0, le=50.0, description="CO concentration in mg/m³")
    o3: float = Field(..., ge=0.0, le=500.0, description="O3 concentration in µg/m³")
    temperature: float = Field(..., ge=-40.0, le=60.0, description="Temperature in °C")
    humidity: float = Field(..., ge=0.0, le=100.0, description="Relative humidity in %")

class EnvironmentalDataCreate(EnvironmentalDataBase):
    pass

class EnvironmentalDataResponse(EnvironmentalDataBase):
    id: int
    user_id: int
    recorded_at: datetime.datetime

    class Config:
        from_attributes = True

