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
    Classifies a numerical AQI value into standard CPCB air quality categories:
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

def determine_dominant_pollutant(env_params: Dict[str, Any]) -> str:
    """
    Determines the dominant pollutant responsible for AQI deterioration
    based on official standard regulatory ratios.
    """
    # Reference thresholds for 24-hr standard (CPCB / WHO)
    standards = {
        'pm25': (60.0, 'PM2.5'),
        'pm10': (100.0, 'PM10'),
        'no2': (80.0, 'NO2'),
        'so2': (80.0, 'SO2'),
        'co': (2.0, 'CO'),
        'o3': (100.0, 'O3')
    }
    
    max_ratio = -1.0
    dominant = "PM2.5"
    
    for key, (threshold, label) in standards.items():
        val = float(env_params.get(key, 0.0))
        ratio = val / threshold
        if ratio > max_ratio:
            max_ratio = ratio
            dominant = label
            
    return dominant
