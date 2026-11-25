"""
UCI Air Quality Dataset Evaluation & Compatibility Analyzer
Dataset: UCI Air Quality (DOI: 10.24432/C59K5F, De Vito et al., 2008)
Official URL: https://archive.ics.uci.edu/dataset/360/air+quality

This module provides data cleaning, missing-value processing (-200 marker handling),
and technical documentation regarding compatibility with AirGuard's CPCB AQI standard.
"""

import os
import pandas as pd
import numpy as np
from typing import Dict, Any

UCI_FEATURE_NAMES = [
    'Date', 'Time', 'CO(GT)', 'PT08.S1(CO)', 'NMHC(GT)', 'C6H6(GT)',
    'PT08.S2(NMHC)', 'NOx(GT)', 'PT08.S3(NOx)', 'NO2(GT)', 'PT08.S4(NO2)',
    'PT08.S5(O3)', 'T', 'RH', 'AH'
]

MISSING_VALUE_MARKER = -200

def inspect_uci_dataset_compatibility(csv_path: str = None) -> Dict[str, Any]:
    """
    Evaluates compatibility between the UCI Air Quality dataset and AirGuard's prediction schema.
    """
    compatibility_report = {
        "dataset_name": "UCI Air Quality Dataset",
        "dataset_doi": "10.24432/C59K5F",
        "missing_value_marker": MISSING_VALUE_MARKER,
        "recorded_features_count": len(UCI_FEATURE_NAMES),
        "recorded_features": UCI_FEATURE_NAMES,
        "airguard_features_required": ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3', 'temperature', 'humidity'],
        "feature_availability": {
            "co": "Available via CO(GT) in mg/m³",
            "no2": "Available via NO2(GT) in µg/m³",
            "temperature": "Available via T in °C",
            "humidity": "Available via RH in %",
            "pm25": "MISSING (Not recorded in UCI dataset)",
            "pm10": "MISSING (Not recorded in UCI dataset)",
            "so2": "MISSING (Not recorded in UCI dataset)",
            "o3": "INDIRECT ONLY (Sensor resistance PT08.S5 in Ohms, NO ground-truth µg/m³ concentration)",
            "aqi": "MISSING (No CPCB / US-EPA standard composite AQI column present)"
        },
        "scientific_verdict": (
            "The UCI dataset cannot directly serve as the primary dataset for CPCB Air Quality Index "
            "prediction because particulate matter (PM2.5 and PM10) is absent. According to CPCB standards, "
            "particulate matter is the primary determinant (>80%) of AQI classification. Synthesizing or "
            "fabricating PM2.5 or AQI labels is scientifically invalid. Therefore, the 12,000-sample CPCB "
            "dataset is retained as the authoritative primary dataset for all three regression models."
        )
    }
    
    if csv_path and os.path.exists(csv_path):
        try:
            df = pd.read_csv(csv_path, sep=';', decimal=',').dropna(how='all')
            # Replace -200 with NaN
            df = df.replace(MISSING_VALUE_MARKER, np.nan)
            compatibility_report["sample_count"] = len(df)
            compatibility_report["null_counts"] = df.isnull().sum().to_dict()
        except Exception as e:
            compatibility_report["read_error"] = str(e)
            
    return compatibility_report

if __name__ == "__main__":
    report = inspect_uci_dataset_compatibility()
    print("=" * 70)
    print("UCI Air Quality Dataset Compatibility Report")
    print("=" * 70)
    for k, v in report.items():
        print(f"{k}: {v}\n")
