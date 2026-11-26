#!/usr/bin/env python3
"""
AirGuard — Intelligent Air Quality Prediction System
Standalone Command-Line Interface (CLI) Prediction & Benchmark Tool
"""

import sys
import os
import json
import argparse
from typing import Dict, Any

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.services.prediction_service import prediction_service, MODEL_DISPLAY_NAMES
from backend.app.services.preprocessor import preprocessor_service
from backend.app.services.classifier import classify_aqi, get_category_metadata
from backend.app.services.health_advisory import get_health_recommendation

FEATURE_NAMES = ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3', 'temperature', 'humidity']

# ANSI terminal formatting
BOLD = "\033[1m"
RESET = "\033[0m"
DIM = "\033[2m"
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
MAGENTA = "\033[95m"
WHITE = "\033[97m"

CATEGORY_COLORS = {
    "Good": GREEN,
    "Satisfactory": GREEN,
    "Moderate": YELLOW,
    "Poor": YELLOW,
    "Very Poor": RED,
    "Severe": MAGENTA
}

SAMPLE_SCENARIOS = {
    "1": ("Clean Mountain / Coastal Air", {
        "pm25": 14.0, "pm10": 26.0, "no2": 12.0, "so2": 4.5,
        "co": 0.35, "o3": 22.0, "temperature": 22.5, "humidity": 55.0
    }),
    "2": ("Moderate Urban City Traffic", {
        "pm25": 58.5, "pm10": 115.0, "no2": 42.0, "so2": 14.0,
        "co": 1.35, "o3": 38.0, "temperature": 28.5, "humidity": 64.0
    }),
    "3": ("Severe Industrial Smog Inversion", {
        "pm25": 210.0, "pm10": 340.0, "no2": 95.0, "so2": 45.0,
        "co": 4.2, "o3": 72.0, "temperature": 14.0, "humidity": 85.0
    })
}

def predict_single(model_key: str, env_params: Dict[str, float]) -> Dict[str, Any]:
    raw_vector = preprocessor_service.validate_and_format_vector(env_params)
    scaled_features = preprocessor_service.transform(raw_vector)
    model = prediction_service.models.get(model_key, prediction_service.model)
    pred_val, latency_ms = prediction_service._infer_single(model, scaled_features)
    category = classify_aqi(pred_val)
    meta = get_category_metadata(category)
    advisory = get_health_recommendation(category)

    benchmarks = {
        "PM2.5": env_params["pm25"] / 60.0,
        "PM10": env_params["pm10"] / 100.0,
        "NO2": env_params["no2"] / 80.0,
        "SO2": env_params["so2"] / 80.0,
        "CO": env_params["co"] / 2.0,
        "O3": env_params["o3"] / 100.0
    }
    dominant_pollutant = max(benchmarks, key=benchmarks.get)

    return {
        "model_key": model_key,
        "model_name": MODEL_DISPLAY_NAMES.get(model_key, model_key),
        "predicted_aqi": pred_val,
        "category": category,
        "dominant_pollutant": dominant_pollutant,
        "color_code": meta.get("color", "#2563EB"),
        "health_advisory": advisory,
        "inputs": env_params
    }

def print_result_card(title: str, res: Dict[str, Any]):
    cat = res["category"]
    col = CATEGORY_COLORS.get(cat, WHITE)
    p = res["inputs"]

    print("\n" + "=" * 72)
    print(f" {BOLD}{CYAN}AIRGUARD PREDICTION REPORT: {title.upper()}{RESET}")
    print("=" * 72)
    print(f"  {BOLD}Model Used:{RESET}          {res['model_name']}")
    print(f"  {BOLD}Predicted AQI:{RESET}       {BOLD}{col}{res['predicted_aqi']}{RESET}")
    print(f"  {BOLD}CPCB Category:{RESET}       {BOLD}{col}[ {cat.upper()} ]{RESET}")
    print(f"  {BOLD}Dominant Pollutant:{RESET}  {BOLD}{res['dominant_pollutant']}{RESET}")
    print(f"  {BOLD}Status Badge Color:{RESET}  {res['color_code']}")
    print("-" * 72)
    print(f"  {BOLD}Environmental Inputs Supplied:{RESET}")
    print(f"    • PM2.5:       {p['pm25']:>6.1f} µg/m³   │  • CO:          {p['co']:>6.2f} mg/m³")
    print(f"    • PM10:        {p['pm10']:>6.1f} µg/m³   │  • Ozone (O3):  {p['o3']:>6.1f} µg/m³")
    print(f"    • NO2:         {p['no2']:>6.1f} µg/m³   │  • Temperature: {p['temperature']:>6.1f} °C")
    print(f"    • SO2:         {p['so2']:>6.1f} µg/m³   │  • Humidity:    {p['humidity']:>6.1f} %")
    print("-" * 72)
    print(f"  {BOLD}Official Health Recommendation:{RESET}")
    print(f"  {DIM}{res['health_advisory']}{RESET}")
    print("=" * 72)

def print_comparison_matrix(env_params: Dict[str, float]):
    print("\n" + "=" * 78)
    print(f" {BOLD}{CYAN}AIRGUARD MULTI-MODEL PREDICTION & BENCHMARK COMPARISON{RESET}")
    print("=" * 78)
    
    headers = ["Model Architecture", "Predicted AQI", "CPCB Category", "R² Score", "Role"]
    print(f"  {BOLD}{headers[0]:<28} {headers[1]:<15} {headers[2]:<16} {headers[3]:<10} {headers[4]}{RESET}")
    print("  " + "-" * 74)

    models = [
        ("linear_regression", "0.9067", "Statistical Baseline"),
        ("random_forest", "0.9996", "🏆 WINNER (Production)"),
        ("ann", "0.9984", "High-Accuracy Deep")
    ]

    for key, r2, role in models:
        res = predict_single(key, env_params)
        cat = res["category"]
        col = CATEGORY_COLORS.get(cat, WHITE)
        print(f"  {res['model_name']:<28} {col}{res['predicted_aqi']:<15.1f}{RESET} {col}{cat:<16}{RESET} {r2:<10} {role}")

    print("=" * 78)

def interactive_menu():
    print(f"\n{BOLD}{CYAN}======================================================================{RESET}")
    print(f"{BOLD}{WHITE}     AIRGUARD INTELLIGENT AIR QUALITY PREDICTION SYSTEM — CLI        {RESET}")
    print(f"{DIM}        Multi-Model Machine Learning Inference (RF, LR, ANN)         {RESET}")
    print(f"{BOLD}{CYAN}======================================================================{RESET}")
    print("\nSelect an option:")
    print(f" {BOLD}[1]{RESET} Custom Parameter Input (Interactive Prediction)")
    print(f" {BOLD}[2]{RESET} Demo: Clean Coastal / Mountain Air Scenario")
    print(f" {BOLD}[3]{RESET} Demo: Moderate Urban Traffic Scenario")
    print(f" {BOLD}[4]{RESET} Demo: Severe Industrial Inversion Smog Scenario")
    print(f" {BOLD}[5]{RESET} Run Multi-Model Comparison on Moderate Scenario")
    print(f"{CYAN}----------------------------------------------------------------------{RESET}")

    choice = input(f"{BOLD}Enter choice (1-5) [default: 5]: {RESET}").strip() or "5"

    if choice == "1":
        print(f"\n{BOLD}Enter Environmental Parameters:{RESET}")
        params = {}
        for f in FEATURE_NAMES:
            val = input(f"  Enter {f.upper()}: ").strip()
            params[f] = float(val) if val else 25.0
        print_comparison_matrix(params)
    elif choice in ["2", "3", "4"]:
        idx = str(int(choice) - 1)
        title, params = SAMPLE_SCENARIOS[idx]
        print_comparison_matrix(params)
    elif choice == "5":
        title, params = SAMPLE_SCENARIOS["2"]
        print_comparison_matrix(params)
    else:
        print("Invalid selection. Exiting.")

def main():
    parser = argparse.ArgumentParser(description="AirGuard AQI Prediction Command-Line Interface")
    parser.add_argument("--pm25", type=float, help="PM2.5 concentration in µg/m³")
    parser.add_argument("--pm10", type=float, help="PM10 concentration in µg/m³")
    parser.add_argument("--no2", type=float, help="NO2 concentration in µg/m³")
    parser.add_argument("--so2", type=float, help="SO2 concentration in µg/m³")
    parser.add_argument("--co", type=float, help="CO concentration in mg/m³")
    parser.add_argument("--o3", type=float, help="O3 concentration in µg/m³")
    parser.add_argument("--temperature", type=float, help="Temperature in °C")
    parser.add_argument("--humidity", type=float, help="Relative humidity percentage")
    parser.add_argument("--model", type=str, choices=["random_forest", "linear_regression", "ann", "compare"], default="compare", help="Model to use")
    parser.add_argument("--json", action="store_true", help="Output raw JSON payload")

    args = parser.parse_args()

    # If parameters provided via CLI flags
    if args.pm25 is not None:
        env_params = {
            "pm25": args.pm25,
            "pm10": args.pm10 if args.pm10 is not None else 80.0,
            "no2": args.no2 if args.no2 is not None else 25.0,
            "so2": args.so2 if args.so2 is not None else 12.0,
            "co": args.co if args.co is not None else 0.8,
            "o3": args.o3 if args.o3 is not None else 30.0,
            "temperature": args.temperature if args.temperature is not None else 26.0,
            "humidity": args.humidity if args.humidity is not None else 55.0,
        }

        if args.json:
            if args.model == "compare":
                res = {k: predict_single(k, env_params) for k in ["random_forest", "linear_regression", "ann"]}
                print(json.dumps(res, indent=2))
            else:
                res = predict_single(args.model, env_params)
                print(json.dumps(res, indent=2))
        else:
            if args.model == "compare":
                print_comparison_matrix(env_params)
            else:
                res = predict_single(args.model, env_params)
                print_result_card(f"CLI Prediction ({args.model})", res)
    else:
        interactive_menu()

if __name__ == "__main__":
    main()
