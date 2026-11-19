def get_health_recommendation(category: str) -> str:
    """
    Returns specific, actionable health advisory and environmental precautions
    tailored to the assigned AQI category.
    """
    advisories = {
        "Good": (
            "Air quality is ideal for all individuals. Enjoy outdoor activities, sports, and open-air ventilation without restrictions."
        ),
        "Satisfactory": (
            "Air quality is acceptable. Sensitive individuals (children, elderly, those with respiratory conditions) should monitor for minor irritation during prolonged heavy exertion."
        ),
        "Moderate": (
            "Air quality is acceptable for the general public, but individuals with asthma or heart conditions may experience mild breathing discomfort. Consider reducing prolonged outdoor exertion."
        ),
        "Poor": (
            "Air quality is unhealthy for sensitive groups and may cause breathing discomfort to the general public. Wear N95 masks outdoors, avoid intense outdoor workouts, and keep windows closed."
        ),
        "Very Poor": (
            "Health alert: High risk of respiratory symptoms in sensitive groups and noticeable effects across the population. Run HEPA air purifiers indoors and avoid all outdoor physical activity."
        ),
        "Severe": (
            "Emergency health conditions: High risk of serious cardiovascular and respiratory adverse effects across all populations. Everyone should remain strictly indoors with air filtration activated."
        ),
    }
    return advisories.get(
        category,
        "Air quality levels warrant precaution. Stay hydrated and monitor local environmental bulletins."
    )

