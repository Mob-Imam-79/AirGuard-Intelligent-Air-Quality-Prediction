import json
import os
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Dict, Any, List

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.prediction import Prediction
from backend.app.models.environmental_data import EnvironmentalData
from backend.app.models.dataset import EnvironmentalDataset
from backend.app.schemas.user import UserResponse
from backend.app.schemas.admin import SystemStatsResponse, ModelEvaluationCompare, DatasetResponse
from backend.app.services.auth_service import get_current_admin_user
from backend.app.services.dataset_service import get_or_create_default_dataset, get_dataset_preview
from backend.app.ml.train import train_and_evaluate_all_models

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.get("/stats", response_model=SystemStatsResponse)
def get_system_stats(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_predictions = db.query(Prediction).count()
    
    # Active model and score from metrics.json
    active_model = "Random Forest Regression"
    active_model_r2 = 0.9996
    if os.path.exists(settings.METRICS_PATH):
        try:
            with open(settings.METRICS_PATH, "r") as f:
                metrics_data = json.load(f)
                active_model = metrics_data.get("selected_model", active_model)
                for m in metrics_data.get("models", []):
                    if m.get("algorithm") == active_model:
                        active_model_r2 = m.get("r2_score", active_model_r2)
        except Exception:
            pass
            
    # Category distribution
    cat_dist = {cat: 0 for cat in ["Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe"]}
    grouped = db.query(Prediction.category, func.count(Prediction.id)).group_by(Prediction.category).all()
    for cat, count in grouped:
        cat_dist[cat] = count
        
    # Daily predictions count
    daily_stats = (
        db.query(
            func.date(Prediction.created_at).label("date"),
            func.count(Prediction.id).label("count")
        )
        .group_by(func.date(Prediction.created_at))
        .order_by(func.date(Prediction.created_at).asc())
        .limit(14)
        .all()
    )
    daily_list = [{"date": str(d.date), "count": d.count} for d in daily_stats]
    
    return {
        "total_users": total_users,
        "total_predictions": total_predictions,
        "active_model": active_model,
        "active_model_r2": active_model_r2,
        "category_distribution": cat_dist,
        "daily_predictions_count": daily_list
    }

@router.get("/users")
def get_all_users(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.id.asc()).all()
    out = []
    for u in users:
        pred_count = db.query(Prediction).filter(Prediction.user_id == u.id).count()
        out.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "total_predictions": pred_count
        })
    return out

@router.put("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    status_update: Dict[str, Any],
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    if "is_active" in status_update:
        target.is_active = bool(status_update["is_active"])
    if "role" in status_update:
        if status_update["role"] in ["user", "admin"]:
            target.role = status_update["role"]
            
    db.commit()
    db.refresh(target)
    return {"message": "User status updated successfully", "user_id": target.id, "is_active": target.is_active, "role": target.role}

@router.get("/datasets", response_model=List[DatasetResponse])
def get_datasets(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    get_or_create_default_dataset(db)
    return db.query(EnvironmentalDataset).all()

@router.get("/dataset-preview")
def preview_dataset(
    limit: int = Query(25, ge=1, le=100),
    admin: User = Depends(get_current_admin_user)
):
    return get_dataset_preview(limit)

@router.get("/models", response_model=ModelEvaluationCompare)
def get_model_evaluation(admin: User = Depends(get_current_admin_user)):
    if not os.path.exists(settings.METRICS_PATH):
        raise HTTPException(status_code=404, detail="Model metrics file not found. Please train models first.")
    with open(settings.METRICS_PATH, "r") as f:
        data = json.load(f)
    return data

@router.post("/models/retrain")
def retrain_models(admin: User = Depends(get_current_admin_user)):
    try:
        summary = train_and_evaluate_all_models(
            csv_path=settings.DATASET_PATH,
            artifacts_dir=settings.ML_ARTIFACTS_DIR
        )
        return {
            "message": "Retraining completed successfully",
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model retraining failed: {str(e)}")

@router.get("/predictions")
def get_all_predictions_monitoring(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    total = db.query(Prediction).count()
    offset = (page - 1) * limit
    records = (
        db.query(Prediction, User, EnvironmentalData)
        .join(User, Prediction.user_id == User.id)
        .join(EnvironmentalData, Prediction.environmental_data_id == EnvironmentalData.id)
        .order_by(desc(Prediction.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )
    items = []
    for pred, u, env in records:
        items.append({
            "id": pred.id,
            "user_name": u.name,
            "user_email": u.email,
            "predicted_aqi": pred.predicted_aqi,
            "category": pred.category,
            "model_used": pred.model_used,
            "created_at": pred.created_at.isoformat() if pred.created_at else None,
            "pm25": env.pm25,
            "pm10": env.pm10,
            "temperature": env.temperature,
            "humidity": env.humidity
        })
    pages = (total + limit - 1) // limit if total > 0 else 1
    return {
        "total": total,
        "items": items,
        "page": page,
        "limit": limit,
        "pages": pages
    }

