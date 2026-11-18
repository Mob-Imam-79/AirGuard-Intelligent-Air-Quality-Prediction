from backend.app.api.auth import router as auth_router
from backend.app.api.users import router as users_router
from backend.app.api.predict import router as predict_router
from backend.app.api.history import router as history_router
from backend.app.api.analytics import router as analytics_router
from backend.app.api.reports import router as reports_router
from backend.app.api.admin import router as admin_router

__all__ = [
    "auth_router", "users_router", "predict_router", 
    "history_router", "analytics_router", "reports_router", "admin_router"
]

