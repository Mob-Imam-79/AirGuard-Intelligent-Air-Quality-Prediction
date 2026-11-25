from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    ModelComparisonResponse,
    ModelMetricsResponse
)
from backend.app.services.auth_service import get_current_user
from backend.app.services.prediction_service import prediction_service

router = APIRouter(prefix="/predict", tags=["Prediction"])

@router.post("", response_model=PredictionResponse)
@router.post("/", response_model=PredictionResponse)
def create_prediction(
    request: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Default prediction endpoint (uses the primary winning model: Random Forest).
    Preserves 100% backward compatibility for all existing clients.
    """
    try:
        env_params = request.model_dump() if hasattr(request, "model_dump") else request.dict()
        pred_record = prediction_service.predict_with_model(
            db=db,
            user=current_user,
            env_params=env_params,
            model_key="random_forest"
        )
        return pred_record
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )

@router.post("/linear-regression", response_model=PredictionResponse)
def predict_linear_regression(
    request: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Predicts AQI using the trained Linear Regression model.
    """
    try:
        env_params = request.model_dump() if hasattr(request, "model_dump") else request.dict()
        pred_record = prediction_service.predict_with_model(
            db=db,
            user=current_user,
            env_params=env_params,
            model_key="linear_regression"
        )
        return pred_record
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Linear Regression prediction failed: {str(e)}"
        )

@router.post("/random-forest", response_model=PredictionResponse)
def predict_random_forest(
    request: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Predicts AQI using the trained Random Forest Regression model.
    """
    try:
        env_params = request.model_dump() if hasattr(request, "model_dump") else request.dict()
        pred_record = prediction_service.predict_with_model(
            db=db,
            user=current_user,
            env_params=env_params,
            model_key="random_forest"
        )
        return pred_record
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Random Forest prediction failed: {str(e)}"
        )

@router.post("/ann", response_model=PredictionResponse)
def predict_ann(
    request: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Predicts AQI using the trained Artificial Neural Network (ANN) model.
    """
    try:
        env_params = request.model_dump() if hasattr(request, "model_dump") else request.dict()
        pred_record = prediction_service.predict_with_model(
            db=db,
            user=current_user,
            env_params=env_params,
            model_key="ann"
        )
        return pred_record
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ANN prediction failed: {str(e)}"
        )

@router.post("/compare", response_model=ModelComparisonResponse)
def compare_all_models(
    request: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Predicts AQI across all three models simultaneously (Linear Regression, Random Forest, ANN)
    and returns a side-by-side comparison payload with categories and inference timings.
    """
    try:
        env_params = request.model_dump() if hasattr(request, "model_dump") else request.dict()
        comparison = prediction_service.compare_all_models(
            db=db,
            user=current_user,
            env_params=env_params
        )
        return comparison
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model comparison failed: {str(e)}"
        )

@router.get("/models/metrics", response_model=ModelMetricsResponse)
@router.get("/metrics", response_model=ModelMetricsResponse)
def get_prediction_models_metrics(
    current_user: User = Depends(get_current_user)
):
    """
    Returns comparative evaluation metrics (MAE, MSE, RMSE, R², training time)
    for all three trained regression models.
    """
    try:
        return prediction_service.get_models_metrics()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model metrics not found: {str(e)}"
        )
