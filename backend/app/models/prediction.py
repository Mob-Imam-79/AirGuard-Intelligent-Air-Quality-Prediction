import datetime
from sqlalchemy import Column, Integer, Float, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    environmental_data_id = Column(Integer, ForeignKey("environmental_data.id"), nullable=False, unique=True)
    
    predicted_aqi = Column(Float, nullable=False)
    category = Column(String(50), nullable=False, index=True)  # Good, Satisfactory, Moderate, Poor, Very Poor, Severe
    health_recommendation = Column(Text, nullable=False)
    model_used = Column(String(100), default="Random Forest Regressor")
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="predictions")
    environmental_data = relationship("EnvironmentalData", back_populates="prediction")

