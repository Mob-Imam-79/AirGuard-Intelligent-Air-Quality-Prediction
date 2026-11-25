from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any

from backend.app.models.user import User
from backend.app.schemas.prediction import ModelMetricsResponse
from backend.app.services.auth_service import get_current_user
from backend.app.services.prediction_service import prediction_service

router = APIRouter(prefix="/models", tags=["Machine Learning Models"])

@router.get("", response_model=ModelMetricsResponse)
@router.get("/", response_model=ModelMetricsResponse)
def get_all_models_info(
    current_user: User = Depends(get_current_user)
):
    """
    Returns information and evaluation metrics for all registered ML models:
    Linear Regression, Random Forest Regression, and Artificial Neural Network (ANN).
    """
    try:
        return prediction_service.get_models_metrics()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model metrics not found: {str(e)}"
        )

@router.get("/metrics", response_model=ModelMetricsResponse)
def get_model_metrics(
    current_user: User = Depends(get_current_user)
):
    """
    Returns comparative evaluation metrics across the three models.
    """
    try:
        return prediction_service.get_models_metrics()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model metrics not found: {str(e)}"
        )
