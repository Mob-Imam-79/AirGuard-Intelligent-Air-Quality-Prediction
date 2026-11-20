#!/bin/bash
# ========================================================
# AirGuard — Intelligent Air Quality Prediction System
# Startup Launcher Script
# ========================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "========================================================"
echo " Starting AirGuard Platform"
echo " Intelligent Air Quality Prediction SaaS"
echo "========================================================"

# Check Python environment
if [ -d "venv" ]; then
    PYTHON_EXEC="./venv/bin/python"
    UVICORN_EXEC="./venv/bin/uvicorn"
else
    PYTHON_EXEC="python3"
    UVICORN_EXEC="uvicorn"
fi

# Ensure database tables and models exist
echo "[1/3] Verifying Machine Learning models and database..."
PYTHONPATH=. $PYTHON_EXEC -c "
from backend.app.services.prediction_service import prediction_service
from backend.app.database import engine, Base
Base.metadata.create_all(bind=engine)
print('✓ Database initialized & ML Model verified:', prediction_service.model_name)
"

# Check if frontend is built
if [ ! -d "frontend/dist" ]; then
    echo "[2/3] Building frontend production bundle..."
    cd frontend && npm run build && cd ..
else
    echo "[2/3] Frontend build verified in frontend/dist"
fi

echo "[3/3] Launching AirGuard Full-Stack Server on port 8000..."
echo "--------------------------------------------------------"
echo " Web Application URL: http://localhost:8000"
echo " Interactive Swagger API Docs: http://localhost:8000/docs"
echo " Alternative ReDoc API Docs: http://localhost:8000/redoc"
echo "--------------------------------------------------------"
echo " Default Demo Credentials:"
echo "   Standard User: user@airguard.com  / User@123"
echo "   Administrator: admin@airguard.com / Admin@123"
echo "--------------------------------------------------------"

PYTHONPATH=. $UVICORN_EXEC backend.app.main:app --host 0.0.0.0 --port 8000 --reload

