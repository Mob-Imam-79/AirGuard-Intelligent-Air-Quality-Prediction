from typing import Dict, Any

AQI_CATEGORIES = {
    "Good": {"min": 0, "max": 50, "color": "#16A34A", "badge": "good"},
    "Satisfactory": {"min": 51, "max": 100, "color": "#84CC16", "badge": "satisfactory"},
    "Moderate": {"min": 101, "max": 200, "color": "#EAB308", "badge": "moderate"},
    "Poor": {"min": 201, "max": 300, "color": "#F97316", "badge": "poor"},
    "Very Poor": {"min": 301, "max": 400, "color": "#DC2626", "badge": "veryPoor"},
    "Severe": {"min": 401, "max": 9999, "color": "#7F1D1D", "badge": "severe"},
}

def classify_aqi(aqi_value: float) -> str:
    """
    Classifies a numerical AQI value into standard air quality categories:
    Good (0-50), Satisfactory (51-100), Moderate (101-200),
    Poor (201-300), Very Poor (301-400), Severe (401+).
    """
    rounded = round(float(aqi_value), 1)
    if rounded <= 50:
        return "Good"
    elif rounded <= 100:
        return "Satisfactory"
    elif rounded <= 200:
        return "Moderate"
    elif rounded <= 300:
        return "Poor"
    elif rounded <= 400:
        return "Very Poor"
    else:
        return "Severe"

def get_category_metadata(category: str) -> Dict[str, Any]:
    return AQI_CATEGORIES.get(category, AQI_CATEGORIES["Moderate"])

