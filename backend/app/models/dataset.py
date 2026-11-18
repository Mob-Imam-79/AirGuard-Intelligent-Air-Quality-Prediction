import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from backend.app.database import Base

class EnvironmentalDataset(Base):
    __tablename__ = "environmental_datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    source = Column(String(100), default="CPCB (Central Pollution Control Board)")
    record_count = Column(Integer, default=0)
    file_path = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

