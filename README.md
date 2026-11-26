# AirGuard — Intelligent Air Quality Prediction System
### Complete Environmental Intelligence SaaS Platform

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React.js_18-61DAFB.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_/_SQLite_Fallback-336791.svg)](https://www.postgresql.org/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Linear_Reg_%7C_Random_Forest_%7C_ANN-F7931E.svg)](https://scikit-learn.org/)
[![Accuracy](https://img.shields.io/badge/Best_Model_R²-0.9996-success.svg)](https://scikit-learn.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-44%20Passed%20%2F%200%20Failed-brightgreen.svg)](https://docs.pytest.org/)

**AirGuard** is an end-to-end, enterprise-grade environmental intelligence SaaS web application built according to the **Software Engineering Laboratory** curriculum specifications. It ingests 8 atmospheric and meteorological parameters into real-time **Air Quality Index (AQI)** predictions using three distinct machine learning regression algorithms (**Linear Regression**, **Random Forest Regression**, and an **Artificial Neural Network (ANN)**), assigns standardized CPCB health categories, and provides side-by-side comparative analytics, interactive visualizations, downloadable PDF/CSV audit reports, and a dedicated administrator suite.

---

## 🌟 Key Capabilities & Features

### 1. Public Website
- **Landing Page**: Modern hero section, real-time CPCB category spectrum, 8-parameter breakdown, and interactive architecture workflow.
- **About AirGuard**: Academic foundation, Software Engineering experiment reports, and technical methodology.
- **Features Page**: Commercial-grade architectural capabilities, real-time inference, and multi-tenant security overview.
- **Authentication**: JWT-based login and registration with 1-click Demo Fill buttons for both standard users and administrators.

### 2. User Application
- **User Dashboard**: Real-time overview displaying latest AQI result with animated gauge, 8 parameter summary cards, chronological AQI trend chart, pollutant concentration comparison bar chart, and recent prediction log.
- **AQI Predictor**: 8-parameter input form (PM2.5, PM10, NO₂, SO₂, CO, O₃, Temperature, Humidity) with 4 quick environmental preset scenarios, real-time client-side validation, algorithm selector pills, instant ML inference, and tailored health advisories.
- **ML Model Comparison (`/model-comparison`)**: Side-by-side simultaneous prediction across **Linear Regression**, **Random Forest Regressor (Winner)**, and **Artificial Neural Network (ANN)**, displaying individual predicted AQI, category badges, dominant effluent identification, inference latency in milliseconds, and interactive Recharts benchmark graphs ($R^2$ Variance and MAE/RMSE comparisons).
- **Prediction History**: Filterable, searchable, and paginated history table reflecting the exact model algorithm used, parameter detail modals, and safe record deletion.
- **Analytics & Trends**: Multi-chart analytics dashboard featuring AQI progression lines, pollutant averages, category donut breakdown, and meteorological impact insights.
- **Reports Center**: 1-click export of official, printable vector PDF audit reports (built with ReportLab) and raw CSV spreadsheets.
- **Account Settings**: Profile updates, password management, and account metadata.

### 3. Administrator Application
- **Admin Dashboard**: System-wide statistics (total users, total predictions, active model status, R² accuracy score, category distribution).
- **User Management**: Administrative control to activate/deactivate accounts and promote/demote administrator privileges.
- **Dataset Management**: CPCB baseline dataset metadata viewer with 12,000 verified records and interactive data grid.
- **ML Model Management**: Pipeline status inspection, artifact health checks across all 3 production models, and 1-click automated retraining pipeline.
- **Model Evaluation**: Empirical benchmark comparison table and charts across Linear Regression, Random Forest, and ANN evaluating MAE, MSE, RMSE, and R² scores on unseen test data.
- **Prediction Monitoring**: Live system-wide audit stream of all user prediction events.
- **System Reports & Audits**: Component uptime metrics and audit logs.
- **Admin Settings**: Runtime performance controls, rate limits, and threshold configurations.

---

## 🧪 Machine Learning Evaluation Results

AirGuard evaluates 3 candidate regression algorithms on a 12,000-record CPCB dataset using a strict 80/20 train-test split (9,600 training samples, 2,400 unseen evaluation samples) with leak-free `StandardScaler` feature normalization:

| Model Algorithm | MAE | MSE | RMSE | $R^2$ Score (Accuracy) | Training Time | Inference Latency | Deployment Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Linear Regression** | 20.8727 | 820.6157 | 28.6464 | 0.9067 (90.67%) | **0.016 s** | **0.13 ms** | Statistical Baseline |
| **Random Forest Regressor** | **0.6965** | **3.6686** | **1.9153** | **0.9996** (99.96%) | 1.573 s | 1.53 ms | 🏆 **WINNER (Production Primary)** |
| **Artificial Neural Network (ANN)** | 2.4827 | 13.9327 | 3.7327 | **0.9984** (99.84%) | 3.788 s | 0.28 ms | High-Accuracy Deep Regressor |

### Dataset & Preprocessing Integrity
- **Primary Ground Truth**: 12,000 observations from the Central Pollution Control Board (CPCB) covering $\{PM_{2.5}, PM_{10}, NO_2, SO_2, CO, O_3, \text{Temperature}, \text{Humidity}\}$ and continuous target `aqi`.
- **Zero Data Leakage**: Feature scalers are strictly fitted on `X_train` only; unseen test samples and production inputs are transformed using the fitted training distribution.
- **Clamping Safeguards**: Raw regression outputs are clamped within the valid CPCB physical range $[0.0, 500.0]$.
- **UCI Air Quality Dataset Evaluation**: Analysed via `backend/app/ml/uci_dataset_analyzer.py` (*DOI: 10.24432/C59K5F*). The UCI dataset lacks ground-truth $PM_{2.5}$ and $PM_{10}$ measurements, which determine over 80% of CPCB AQI weighting; retaining the CPCB dataset guarantees scientific validity without data fabrication.

### Model Artifacts (`backend/app/ml/artifacts/`)
- `best_model.joblib`: Deployed production winner (Random Forest Regressor)
- `random_forest_model.joblib`: 100-tree ensemble model artifact
- `linear_regression_model.joblib`: Ordinary Least Squares linear pipeline
- `ann_model.joblib`: Multi-layer Perceptron (128-64-32, ReLU, Adam)
- `preprocessor.joblib`: Fitted 8-feature `StandardScaler` normalizer
- `metrics.json`: Empirical benchmark evaluation results

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend (React 18 + Tailwind CSS + Recharts)"]
        UI["User & Admin Views (Dashboard, Predictor, Model Comparison, Analytics, Reports)"]
        AuthContext["Auth Context & JWT Bearer Storage"]
    end

    subgraph Server["Backend (FastAPI REST API)"]
        Routers["Routers: /auth, /users, /predict, /models, /history, /analytics, /reports, /admin"]
        Security["Bcrypt Password Hashing & JWT Middleware"]
        Pydantic["Pydantic v2 Schema Bounds Validation"]
        InferenceEngine["Multi-Model Prediction Service & CPCB Classifier"]
        ReportGen["ReportLab PDF & CSV Export Engine"]
    end

    subgraph MLPipeline["Machine Learning Engine (Scikit-Learn)"]
        Scaler["StandardScaler Normalization"]
        RF["Random Forest Regressor (Winner: R² 0.9996)"]
        ANN["Artificial Neural Network MLP (R² 0.9984)"]
        LR["Linear Regression Baseline (R² 0.9067)"]
    end

    subgraph Database["Database (PostgreSQL / SQLite Fallback)"]
        DBUsers[("Users Table")]
        DBEnv[("Environmental Data Records")]
        DBPredictions[("Prediction History (with model_used tag)")]
        DBDatasets[("Dataset Metadata")]
    end

    UI -->|"HTTPS REST API / JSON"| Routers
    Routers --> Security
    Routers --> Pydantic
    Pydantic --> InferenceEngine
    InferenceEngine --> Scaler
    Scaler --> RF
    Scaler --> ANN
    Scaler --> LR
    InferenceEngine --> Database
    Routers --> ReportGen
```

---

## 📡 Key REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | User account registration |
| `POST` | `/api/v1/auth/login` | JWT access token issuance |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile |
| `POST` | `/api/v1/predict/` | Predict AQI using primary winning model (Random Forest) |
| `POST` | `/api/v1/predict/linear-regression` | Predict AQI using Linear Regression |
| `POST` | `/api/v1/predict/random-forest` | Predict AQI using Random Forest |
| `POST` | `/api/v1/predict/ann` | Predict AQI using Artificial Neural Network |
| `POST` | `/api/v1/predict/compare` | Run side-by-side prediction across all 3 models |
| `GET` | `/api/v1/models/metrics` | Fetch comparative benchmark evaluation metrics |
| `GET` | `/api/v1/history/` | Paginated personal prediction history |
| `DELETE`| `/api/v1/history/{id}` | Foreign-key safe prediction deletion |
| `GET` | `/api/v1/analytics/dashboard-summary`| Aggregate user statistics, latest AQI, and category counts |
| `GET` | `/api/v1/analytics/pollutant-averages`| Mean concentrations for all 6 measured criteria pollutants |
| `GET` | `/api/v1/reports/export/pdf` | Download vector PDF audit report |
| `GET` | `/api/v1/reports/export/csv` | Download raw CSV audit spreadsheet |
| `GET` | `/api/v1/admin/stats` | System-wide administrator statistics |
| `POST` | `/api/v1/admin/models/retrain` | Trigger automated ML retraining across all models |

---

## 🚀 Quickstart & Running AirGuard

### Option A: One-Click Launcher Script (Recommended)

Simply execute the automated startup script:

```bash
./run.sh
```

This will automatically:
1. Verify the Python virtual environment and database tables.
2. Confirm all 3 Machine Learning model artifacts.
3. Verify the frontend production build.
4. Launch the application on `http://localhost:8000`.

### Option B: Manual Startup

#### 1. Backend Server
```bash
# In the project root:
PYTHONPATH=. ./venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Development Server (Optional for HMR)
```bash
cd frontend
npm run dev
```

---

### Option C: Terminal CLI Predictor (No Browser Needed)

To execute machine learning predictions directly inside your terminal:

```bash
./venv/bin/python backend/predict_cli.py
```

---

## 🔑 Default Credentials

The system comes pre-seeded with two demo accounts for immediate testing:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@airguard.com` | `Admin@123` | Full access to Admin Dashboard, User Management, Dataset Viewer, Model Retraining, and System Audits. |
| **Standard User** | `user@airguard.com` | `User@123` | Standard user dashboard, AQI predictor, Model Comparison, personal prediction history, analytics, and PDF reports. |

*(You can also use the 1-click **Quick Demo Auto-Fill** buttons directly on the Login page).*

---

## ⚙️ Environment Configuration

Copy the template configuration file to `.env`:

```bash
cp .env.example .env
```

Default settings in `.env`:
```dotenv
PROJECT_NAME="AirGuard — Intelligent Air Quality Prediction System"
VERSION="1.0.0"
API_V1_STR="/api/v1"
SECRET_KEY="airguard-super-secure-secret-key-change-in-production-2026"
DATABASE_URL="postgresql+psycopg2://postgres:postgres@localhost:5432/airguard_db"
```
*(If PostgreSQL is not running locally, AirGuard automatically falls back to local SQLite `airguard.db` for continuous operation).*

---

## 🧪 Automated Testing Suite

AirGuard includes a comprehensive test suite of **44 automated tests** (40 backend Pytest + 4 frontend Node tests) with a **100% pass rate**:

### Backend Automated Tests (40 Tests)
```bash
PYTHONPATH=. ./venv/bin/pytest backend/tests/ -v
```

| Suite | Tests | Description |
| :--- | :---: | :--- |
| `test_auth.py` | 4 | Registration, duplicate checks, login, credential verification |
| `test_classification.py` | 3 | CPCB threshold breakpoints, health advisories, metadata mapping |
| `test_e2e_verification.py` | 1 | Complete user lifecycle from signup to PDF report export |
| `test_database.py` | 4 | CRUD operations, foreign key cascade, rollback, dataset schemas |
| `test_aqi_prediction_matrix.py` | 5 | Good to Severe pollution conditions, negative & excessive rejection |
| `test_admin_and_analytics.py` | 5 | RBAC access control, user status update, stats, monitoring |
| `test_ml_deep_inspection.py` | 5 | Scaler validation, prediction determinism, monotonicity, [0, 500] clamping |
| `test_model_comparison.py` | 6 | LR, RF, ANN endpoints, comparison route, metrics API, UCI analyzer |
| `test_prediction.py` | 4 | Pydantic validation, analytics summary, PDF/CSV export |
| `test_preprocessor.py` | 3 | Feature vector order, missing field rejection, scaling transforms |

### Frontend Automated Tests (4 Tests)
```bash
node --test "frontend/tests/aqi_standards.test.js"
```
- AQI categories completeness (Good, Satisfactory, Moderate, Poor, Very Poor, Severe)
- Color code integrity and range mapping
- Fallback configuration handling
- Standard health warning code validation

---

## 📁 Repository Directory Structure

```
AirGuard/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI modular route endpoints (auth, predict, models, etc.)
│   │   ├── models/          # SQLAlchemy relational database entities
│   │   ├── schemas/         # Pydantic v2 validation models
│   │   ├── services/        # Business logic, multi-model inference, and PDF reporting
│   │   ├── ml/              # Model training, dataset generation, UCI analyzer, and artifacts
│   │   ├── config.py        # Centralized settings & environment variables
│   │   ├── database.py      # Database engine with automatic SQLite reconnection fallback
│   │   └── main.py          # FastAPI application entrypoint & SPA static mount
│   ├── tests/               # 40 Pytest automated unit, integration, and E2E tests
│   ├── predict_cli.py       # Standalone interactive CLI prediction tool
│   └── requirements.txt     # Python dependency specifications
│
├── frontend/
│   ├── src/
│   │   ├── components/      # UI cards, buttons, badges, modals, charts, Sidebar, Navbar
│   │   ├── pages/           # Dashboard, Prediction, ModelComparison, History, Analytics, Admin
│   │   ├── context/         # AuthContext state management
│   │   ├── services/        # HTTP API client services
│   │   └── utils/           # CPCB thresholds & formatting utilities
│   ├── tests/               # Frontend automated tests (node:test)
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js   # White + Blue professional SaaS theme
│
├── documentation/           # Software Engineering Lab Experiment reports
├── design.md                # Frontend design system specification
├── project_Task.md          # Completed roadmap and task tracking
├── memory.md                # Project progress memory
├── .env.example             # Environment configuration template
├── run.sh                   # All-in-one launcher script
└── README.md
```

---

## 📜 License & Academic Attribution
Developed as part of the **Software Engineering Laboratory** curriculum. Built with standard open-source technologies under academic research and development guidelines.
