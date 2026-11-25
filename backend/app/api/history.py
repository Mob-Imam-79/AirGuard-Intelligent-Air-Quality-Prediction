from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.prediction import Prediction
from backend.app.models.environmental_data import EnvironmentalData
from backend.app.schemas.prediction import PredictionHistoryResponse, PredictionHistoryItem, PredictionResponse
from backend.app.services.auth_service import get_current_user

router = APIRouter(prefix="/history", tags=["Prediction History"])

@router.get("", response_model=PredictionHistoryResponse)
@router.get("/", response_model=PredictionHistoryResponse)
def get_prediction_history(
    category: Optional[str] = Query(None, description="Filter by AQI category"),
    search: Optional[str] = Query(None, description="Search query"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = (
        db.query(Prediction, EnvironmentalData)
        .join(EnvironmentalData, Prediction.environmental_data_id == EnvironmentalData.id)
        .filter(Prediction.user_id == current_user.id)
    )
    
    if category and category.lower() != "all":
        query = query.filter(Prediction.category.ilike(category))
        
    total = query.count()
    offset = (page - 1) * limit
    records = query.order_by(desc(Prediction.created_at)).offset(offset).limit(limit).all()
    
    items = []
    for pred, env in records:
        items.append(
            PredictionHistoryItem(
                id=pred.id,
                predicted_aqi=pred.predicted_aqi,
                category=pred.category,
                model_used=pred.model_used,
                created_at=pred.created_at,
                pm25=env.pm25,
                pm10=env.pm10,
                no2=env.no2,
                so2=env.so2,
                co=env.co,
                o3=env.o3,
                temperature=env.temperature,
                humidity=env.humidity
            )
        )
        
    pages = (total + limit - 1) // limit if total > 0 else 1
    return {
        "total": total,
        "items": items,
        "page": page,
        "limit": limit,
        "pages": pages
    }

@router.get("/{prediction_id}", response_model=PredictionResponse)
def get_prediction_detail(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pred = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not pred:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")
        
    if pred.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this prediction record."
        )
    return pred

@router.delete("/{prediction_id}")
def delete_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pred = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not pred:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")
        
    if pred.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this prediction record."
        )
    
    # Delete prediction record first to satisfy foreign key integrity, then delete associated environmental data
    env_id = pred.environmental_data_id
    db.delete(pred)
    db.flush()
    if env_id:
        env = db.query(EnvironmentalData).filter(EnvironmentalData.id == env_id).first()
        if env:
            db.delete(env)
            
    db.commit()
    return {"message": "Prediction deleted successfully."}

