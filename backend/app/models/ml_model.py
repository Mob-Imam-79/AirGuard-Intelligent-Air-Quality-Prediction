import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from backend.app.database import Base

class TrainedModel(Base):
    __tablename__ = "trained_models"

    id = Column(Integer, primary_key=True, index=True)
    algorithm = Column(String(100), nullable=False)
    version = Column(String(50), default="1.0.0")
    model_path = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=False)
    
    # Evaluation Metrics
    mae = Column(Float, nullable=True)
    mse = Column(Float, nullable=True)
    rmse = Column(Float, nullable=True)
    r2_score = Column(Float, nullable=True)
    
    trained_at = Column(DateTime, default=datetime.datetime.utcnow)

