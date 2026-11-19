import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def load_and_preprocess_dataset(csv_path: str) -> Tuple[pd.DataFrame, np.ndarray, np.ndarray, StandardScaler]:
    df = pd.read_csv(csv_path)
    
    # Clean duplicates and check nulls
    df = df.dropna().drop_duplicates()
    
    feature_cols = ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3', 'temperature', 'humidity']
    X = df[feature_cols]
    y = df['aqi']
    
    scaler = StandardScaler()
    return df, X, y, scaler

def train_and_evaluate_all_models(csv_path: str, artifacts_dir: str) -> Dict[str, Any]:
    os.makedirs(artifacts_dir, exist_ok=True)
    
    df, X, y, scaler = load_and_preprocess_dataset(csv_path)
    
    # Train / Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    
    # Fit scaler on training set
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    models = {
        "Linear Regression": LinearRegression(),
        "Decision Tree Regression": DecisionTreeRegressor(max_depth=12, random_state=42),
        "Random Forest Regression": RandomForestRegressor(n_estimators=100, max_depth=16, random_state=42, n_jobs=-1),
        "Support Vector Regression": SVR(C=25.0, epsilon=0.1)
    }
    
    results = {}
    best_model_name = None
    best_r2 = -float("inf")
    trained_model_objects = {}
    
    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train_scaled, y_train)
        preds = model.predict(X_test_scaled)
        
        mae = float(mean_absolute_error(y_test, preds))
        mse = float(mean_squared_error(y_test, preds))
        rmse = float(np.sqrt(mse))
        r2 = float(r2_score(y_test, preds))
        
        results[name] = {
            "algorithm": name,
            "mae": round(mae, 4),
            "mse": round(mse, 4),
            "rmse": round(rmse, 4),
            "r2_score": round(r2, 4)
        }
        trained_model_objects[name] = model
        print(f"-> {name} | MAE: {mae:.3f} | RMSE: {rmse:.3f} | R²: {r2:.4f}")
        
        if r2 > best_r2:
            best_r2 = r2
            best_model_name = name

    # Persist the winning model and scaler
    best_model = trained_model_objects[best_model_name]
    model_path = os.path.join(artifacts_dir, "best_model.joblib")
    scaler_path = os.path.join(artifacts_dir, "preprocessor.joblib")
    metrics_path = os.path.join(artifacts_dir, "metrics.json")
    
    joblib.dump(best_model, model_path)
    joblib.dump(scaler, scaler_path)
    
    evaluation_summary = {
        "selected_model": best_model_name,
        "trained_date": pd.Timestamp.now().isoformat(),
        "total_records": len(df),
        "test_size": len(X_test),
        "models": list(results.values())
    }
    
    with open(metrics_path, "w") as f:
        json.dump(evaluation_summary, f, indent=2)
        
    print(f"\nModel training and evaluation completed successfully!")
    print(f"Selected Best Model: {best_model_name} (R² = {best_r2:.4f})")
    print(f"Artifacts saved to {artifacts_dir}")
    
    return evaluation_summary

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_file = os.path.join(base_dir, "data", "cpcb_air_quality.csv")
    artifacts = os.path.join(base_dir, "artifacts")
    train_and_evaluate_all_models(data_file, artifacts)

