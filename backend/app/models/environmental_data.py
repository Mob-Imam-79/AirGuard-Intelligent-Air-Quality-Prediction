import datetime
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class EnvironmentalData(Base):
    __tablename__ = "environmental_data"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # 8 Environmental parameters
    pm25 = Column(Float, nullable=False)
    pm10 = Column(Float, nullable=False)
    no2 = Column(Float, nullable=False)
    so2 = Column(Float, nullable=False)
    co = Column(Float, nullable=False)
    o3 = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="environmental_data")
    prediction = relationship("Prediction", back_populates="environmental_data", uselist=False, cascade="all, delete-orphan")

