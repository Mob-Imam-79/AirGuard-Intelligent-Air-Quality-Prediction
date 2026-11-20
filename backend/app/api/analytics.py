from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Dict, Any, List

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.prediction import Prediction
from backend.app.models.environmental_data import EnvironmentalData
from backend.app.services.auth_service import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard-summary")
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    preds_query = db.query(Prediction).filter(Prediction.user_id == current_user.id)
    total = preds_query.count()
    
    latest_pred = preds_query.order_by(desc(Prediction.created_at)).first()
    latest_dict = None
    if latest_pred:
        env = latest_pred.environmental_data
        latest_dict = {
            "id": latest_pred.id,
            "predicted_aqi": latest_pred.predicted_aqi,
            "category": latest_pred.category,
            "health_recommendation": latest_pred.health_recommendation,
            "created_at": latest_pred.created_at.isoformat(),
            "pm25": env.pm25 if env else 0.0,
            "pm10": env.pm10 if env else 0.0,
            "no2": env.no2 if env else 0.0,
            "so2": env.so2 if env else 0.0,
            "co": env.co if env else 0.0,
            "o3": env.o3 if env else 0.0,
            "temperature": env.temperature if env else 0.0,
            "humidity": env.humidity if env else 0.0,
        }
        
    avg_aqi_res = db.query(func.avg(Prediction.predicted_aqi)).filter(Prediction.user_id == current_user.id).scalar()
    avg_aqi = round(float(avg_aqi_res), 1) if avg_aqi_res is not None else 0.0
    
    # Category counts
    cat_counts = {}
    for cat in ["Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe"]:
        cat_counts[cat] = 0
    grouped = (
        db.query(Prediction.category, func.count(Prediction.id))
        .filter(Prediction.user_id == current_user.id)
        .group_by(Prediction.category)
        .all()
    )
    for cat, cnt in grouped:
        cat_counts[cat] = cnt

    # Recent 10 predictions for chart
    recent_records = (
        db.query(Prediction, EnvironmentalData)
        .join(EnvironmentalData, Prediction.environmental_data_id == EnvironmentalData.id)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.asc())
        .limit(20)
        .all()
    )
    trends = []
    for p, e in recent_records:
        trends.append({
            "id": p.id,
            "time": p.created_at.strftime("%m/%d %H:%M"),
            "aqi": p.predicted_aqi,
            "category": p.category,
            "pm25": e.pm25,
            "pm10": e.pm10,
            "no2": e.no2,
            "so2": e.so2,
            "co": e.co,
            "o3": e.o3,
            "temperature": e.temperature,
            "humidity": e.humidity,
        })
        
    return {
        "total_predictions": total,
        "average_aqi": avg_aqi,
        "latest_prediction": latest_dict,
        "category_counts": cat_counts,
        "recent_trends": trends
    }

@router.get("/pollutant-averages")
def get_pollutant_averages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    # Average of environmental parameters for user
    res = (
        db.query(
            func.avg(EnvironmentalData.pm25).label("pm25"),
            func.avg(EnvironmentalData.pm10).label("pm10"),
            func.avg(EnvironmentalData.no2).label("no2"),
            func.avg(EnvironmentalData.so2).label("so2"),
            func.avg(EnvironmentalData.co).label("co"),
            func.avg(EnvironmentalData.o3).label("o3"),
        )
        .join(Prediction, Prediction.environmental_data_id == EnvironmentalData.id)
        .filter(Prediction.user_id == current_user.id)
        .first()
    )
    
    if not res or res.pm25 is None:
        return []
        
    return [
        {"pollutant": "PM2.5", "value": round(float(res.pm25), 1), "unit": "µg/m³"},
        {"pollutant": "PM10", "value": round(float(res.pm10), 1), "unit": "µg/m³"},
        {"pollutant": "NO2", "value": round(float(res.no2), 1), "unit": "µg/m³"},
        {"pollutant": "SO2", "value": round(float(res.so2), 1), "unit": "µg/m³"},
        {"pollutant": "CO", "value": round(float(res.co), 1), "unit": "mg/m³"},
        {"pollutant": "O3", "value": round(float(res.o3), 1), "unit": "µg/m³"},
    ]

