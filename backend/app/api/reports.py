from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.prediction import Prediction
from backend.app.services.auth_service import get_current_user
from backend.app.services.report_service import generate_csv_report, generate_pdf_report

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/export/csv")
def export_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    predictions = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(desc(Prediction.created_at))
        .all()
    )
    csv_data = generate_csv_report(predictions)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=airguard_report_{current_user.id}.csv"}
    )

@router.get("/export/pdf")
def export_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    predictions = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(desc(Prediction.created_at))
        .all()
    )
    pdf_bytes = generate_pdf_report(predictions, user_name=current_user.name)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=airguard_report_{current_user.id}.pdf"}
    )

