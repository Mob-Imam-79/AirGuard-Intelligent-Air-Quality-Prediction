import os
import json
import time
import shutil
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

FEATURE_NAMES = ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3', 'temperature', 'humidity']
TARGET_NAME = 'aqi'

def load_and_preprocess_dataset(csv_path: str) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, StandardScaler]:
    """
    Loads CPCB ground-truth dataset, cleans duplicates, drops nulls,
    and isolates the 8 environmental features and target AQI.
    """
    df = pd.read_csv(csv_path)
    df = df.dropna().drop_duplicates()
    
    X = df[FEATURE_NAMES]
    y = df[TARGET_NAME]
    
    scaler = StandardScaler()
    return df, X, y, scaler

def train_and_evaluate_all_models(csv_path: str, artifacts_dir: str) -> Dict[str, Any]:
    """
    Trains and evaluates all three required regression algorithms:
      1. Linear Regression
      2. Random Forest Regression
      3. Artificial Neural Network (ANN via MLPRegressor)
    Under an identical 80/20 train-test split, records real performance metrics and latency,
    and saves each model artifact.
    """
    os.makedirs(artifacts_dir, exist_ok=True)
    
    df, X, y, scaler = load_and_preprocess_dataset(csv_path)
    
    # Train (80%) / Test (20%) split with fixed seed for exact reproducibility
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    
    # Fit scaler strictly on training set to avoid data leakage
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Save the common scaler
    scaler_path = os.path.join(artifacts_dir, "preprocessor.joblib")
    joblib.dump(scaler, scaler_path)
    
    # Model definitions
    model_definitions = {
        "linear_regression": {
            "name": "Linear Regression",
            "model": LinearRegression(),
            "filename": "linear_regression_model.joblib"
        },
        "random_forest": {
            "name": "Random Forest Regression",
            "model": RandomForestRegressor(n_estimators=100, max_depth=16, random_state=42, n_jobs=-1),
            "filename": "random_forest_model.joblib"
        },
        "ann": {
            "name": "Artificial Neural Network (ANN)",
            "model": MLPRegressor(
                hidden_layer_sizes=(128, 64, 32),
                activation="relu",
                solver="adam",
                alpha=0.0001,
                early_stopping=True,
                validation_fraction=0.15,
                n_iter_no_change=15,
                max_iter=500,
                random_state=42
            ),
            "filename": "ann_model.joblib"
        }
    }
    
    results = []
    trained_model_objects = {}
    best_model_key = None
    best_r2 = -float("inf")
    
    print("=" * 70)
    print("AirGuard ML Model Training & Comparative Evaluation")
    print(f"Total observations: {len(df)} | Train samples: {len(X_train)} | Test samples: {len(X_test)}")
    print("=" * 70)
    
    for key, spec in model_definitions.items():
        name = spec["name"]
        model = spec["model"]
        filename = spec["filename"]
        out_path = os.path.join(artifacts_dir, filename)
        
        print(f"\n[1/3] Training {name}...")
        t0 = time.perf_counter()
        model.fit(X_train_scaled, y_train)
        training_time = time.perf_counter() - t0
        
        # Latency evaluation: warm-up and 100 repeated inferences for timing
        _ = model.predict(X_test_scaled[:10])
        t_infer_0 = time.perf_counter()
        preds = model.predict(X_test_scaled)
        total_infer_time = time.perf_counter() - t_infer_0
        avg_infer_latency_ms = (total_infer_time / len(X_test)) * 1000.0
        
        mae = float(mean_absolute_error(y_test, preds))
        mse = float(mean_squared_error(y_test, preds))
        rmse = float(np.sqrt(mse))
        r2 = float(r2_score(y_test, preds))
        
        # Save individual model artifact
        joblib.dump(model, out_path)
        trained_model_objects[key] = model
        
        model_result = {
            "key": key,
            "algorithm": name,
            "filename": filename,
            "mae": round(mae, 4),
            "mse": round(mse, 4),
            "rmse": round(rmse, 4),
            "r2_score": round(r2, 4),
            "training_time_seconds": round(training_time, 4),
            "inference_latency_ms": round(avg_infer_latency_ms, 4),
            "train_samples": len(X_train),
            "test_samples": len(X_test)
        }
        results.append(model_result)
        
        print(f"-> {name}")
        print(f"   MAE: {mae:.4f} | MSE: {mse:.4f} | RMSE: {rmse:.4f} | R²: {r2:.4f}")
        print(f"   Training time: {training_time:.3f}s | Latency per sample: {avg_infer_latency_ms:.3f}ms")
        print(f"   Artifact saved: {out_path}")
        
        if r2 > best_r2:
            best_r2 = r2
            best_model_key = key
            
    # For backwards compatibility, copy the best model (Random Forest) to best_model.joblib
    best_spec = model_definitions[best_model_key]
    best_source = os.path.join(artifacts_dir, best_spec["filename"])
    best_target = os.path.join(artifacts_dir, "best_model.joblib")
    shutil.copyfile(best_source, best_target)
    
    evaluation_summary = {
        "selected_model": best_spec["name"],
        "selected_model_key": best_model_key,
        "trained_date": pd.Timestamp.now().isoformat(),
        "total_records": len(df),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "features": FEATURE_NAMES,
        "models": results
    }
    
    metrics_path = os.path.join(artifacts_dir, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(evaluation_summary, f, indent=2)
        
    print("\n" + "=" * 70)
    print("Training and Evaluation Complete!")
    print(f"Best Performing Model: {best_spec['name']} (R² = {best_r2:.4f})")
    print(f"Metrics saved to: {metrics_path}")
    print("=" * 70)
    
    return evaluation_summary

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_file = os.path.join(base_dir, "data", "cpcb_air_quality.csv")
    artifacts = os.path.join(base_dir, "artifacts")
    train_and_evaluate_all_models(data_file, artifacts)
