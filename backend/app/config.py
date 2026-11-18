import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AirGuard — Intelligent Air Quality Prediction System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "airguard-super-secure-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+psycopg2://postgres:postgres@localhost:5432/airguard_db"
    )
    
    # Paths - inside backend/app
    APP_DIR: str = os.path.dirname(os.path.abspath(__file__))
    ML_ARTIFACTS_DIR: str = os.path.join(APP_DIR, "ml", "artifacts")
    MODEL_PATH: str = os.path.join(ML_ARTIFACTS_DIR, "best_model.joblib")
    SCALER_PATH: str = os.path.join(ML_ARTIFACTS_DIR, "preprocessor.joblib")
    METRICS_PATH: str = os.path.join(ML_ARTIFACTS_DIR, "metrics.json")
    DATASET_PATH: str = os.path.join(APP_DIR, "ml", "data", "cpcb_air_quality.csv")
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
