from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.schemas.prediction import PredictionRequest, PredictionResponse
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
    try:
        env_params = request.model_dump() if hasattr(request, "model_dump") else request.dict()
        pred_record = prediction_service.predict_aqi(
            db=db,
            user=current_user,
            env_params=env_params
        )
        return pred_record
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )

