import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.database import engine, Base, get_db
from backend.app.models.user import User
from backend.app.services.auth_service import get_password_hash
from backend.app.services.dataset_service import get_or_create_default_dataset
from backend.app.services.prediction_service import prediction_service
from backend.app.api import (
    auth_router, users_router, predict_router,
    history_router, analytics_router, reports_router, admin_router,
    models_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize DB tables
    Base.metadata.create_all(bind=engine)
    
    # 2. Seed initial admin user if not present
    db = next(get_db())
    try:
        admin_user = db.query(User).filter(User.email == "admin@airguard.com").first()
        if not admin_user:
            admin_user = User(
                name="System Administrator",
                email="admin@airguard.com",
                hashed_password=get_password_hash("Admin@123"),
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("Notice: Initial admin user created: admin@airguard.com / Admin@123")
            
        # Seed default general demo user if not present
        demo_user = db.query(User).filter(User.email == "user@airguard.com").first()
        if not demo_user:
            demo_user = User(
                name="Aarav Sharma",
                email="user@airguard.com",
                hashed_password=get_password_hash("User@123"),
                role="user",
                is_active=True
            )
            db.add(demo_user)
            db.commit()
            print("Notice: Initial demo user created: user@airguard.com / User@123")
            
        # 3. Seed dataset record
        get_or_create_default_dataset(db)
    finally:
        db.close()
        
    # 4. Warm up all ML models
    prediction_service._load_all_models()
    
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Air Quality Prediction SaaS Platform REST API",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
api_v1 = settings.API_V1_STR
app.include_router(auth_router, prefix=api_v1)
app.include_router(users_router, prefix=api_v1)
app.include_router(predict_router, prefix=api_v1)
app.include_router(history_router, prefix=api_v1)
app.include_router(analytics_router, prefix=api_v1)
app.include_router(reports_router, prefix=api_v1)
app.include_router(admin_router, prefix=api_v1)
app.include_router(models_router, prefix=api_v1)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AirGuard API",
        "version": settings.VERSION,
        "model_loaded": prediction_service.model is not None,
        "active_model": prediction_service.model_name
    }

# Mount Frontend SPA static build if available
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
assets_dir = os.path.join(frontend_dist, "assets")

if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # Pass through API routes and docs
    if (
        full_path.startswith("api")
        or full_path.startswith("docs")
        or full_path.startswith("openapi.json")
        or full_path.startswith("redoc")
        or full_path.startswith("health")
    ):
        return None
    index_file = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "message": "Welcome to AirGuard — Intelligent Air Quality Prediction System API",
        "docs_url": "/docs",
        "health_check": "/health"
    }
