import os
import numpy as np
import pandas as pd

def calculate_cpcb_subindex(param: str, val: float) -> float:
    """Calculates official CPCB sub-index for a given pollutant concentration."""
    breakpoints = {
        'pm25': [(0, 30, 0, 50), (30, 60, 50, 100), (60, 90, 100, 200), (90, 120, 200, 300), (120, 250, 300, 400), (250, 500, 400, 500)],
        'pm10': [(0, 50, 0, 50), (50, 100, 50, 100), (100, 250, 100, 200), (250, 350, 200, 300), (350, 430, 300, 400), (430, 600, 400, 500)],
        'no2': [(0, 40, 0, 50), (40, 80, 50, 100), (80, 180, 100, 200), (180, 280, 200, 300), (280, 400, 300, 400), (400, 600, 400, 500)],
        'so2': [(0, 40, 0, 50), (40, 80, 50, 100), (80, 380, 100, 200), (380, 800, 200, 300), (800, 1600, 300, 400), (1600, 2000, 400, 500)],
        'co': [(0, 1.0, 0, 50), (1.0, 2.0, 50, 100), (2.0, 10.0, 100, 200), (10.0, 17.0, 200, 300), (17.0, 34.0, 300, 400), (34.0, 50.0, 400, 500)],
        'o3': [(0, 50, 0, 50), (50, 100, 50, 100), (100, 168, 100, 200), (168, 208, 200, 300), (208, 748, 300, 400), (748, 1000, 400, 500)],
    }
    
    if param not in breakpoints:
        return 0.0
    
    table = breakpoints[param]
    val = max(0.0, val)
    
    for (blo, bhi, ilo, ihi) in table:
        if blo <= val <= bhi:
            return ilo + (ihi - ilo) / (bhi - blo) * (val - blo)
            
    # Beyond top breakpoint
    blo, bhi, ilo, ihi = table[-1]
    return min(500.0, ihi + (val - bhi))

def generate_cpcb_air_quality_dataset(n_samples: int = 12000, random_state: int = 42) -> pd.DataFrame:
    np.random.seed(random_state)
    
    # Atmospheric temperature (-5 to 45 °C)
    temperature = np.random.normal(loc=26.0, scale=8.5, size=n_samples)
    temperature = np.clip(temperature, -5.0, 48.0)
    
    # Humidity (15% to 95%) - negatively correlated with high temperatures
    humidity = 85.0 - (temperature * 0.9) + np.random.normal(0, 12.0, size=n_samples)
    humidity = np.clip(humidity, 15.0, 98.0)
    
    # Baseline pollution factors influenced by temperature inversion (colder = higher trapped pollutants)
    inversion_factor = np.where(temperature < 18, 1.45 + (18 - temperature) * 0.04, 1.0)
    
    # PM2.5 (5 to 350 µg/m³)
    pm25_base = np.random.exponential(scale=45.0, size=n_samples) + 8.0
    pm25 = pm25_base * inversion_factor + (humidity * 0.15)
    pm25 = np.clip(pm25, 4.0, 450.0)
    
    # PM10 (typically 1.4 to 2.2 times PM2.5 plus dust)
    pm10 = pm25 * np.random.uniform(1.3, 2.1, size=n_samples) + np.random.exponential(scale=18.0, size=n_samples)
    pm10 = np.clip(pm10, 8.0, 650.0)
    
    # NO2 (traffic / combustion)
    no2 = (pm25 * 0.45) + np.random.gamma(shape=2.5, scale=12.0, size=n_samples) * inversion_factor
    no2 = np.clip(no2, 2.0, 250.0)
    
    # SO2 (industrial emissions)
    so2 = np.random.gamma(shape=2.0, scale=8.0, size=n_samples) * (1.0 + (pm10 / 300.0))
    so2 = np.clip(so2, 1.0, 180.0)
    
    # CO (carbon monoxide in mg/m³)
    co = (pm25 * 0.012) + np.random.exponential(scale=0.6, size=n_samples) * inversion_factor
    co = np.clip(co, 0.1, 15.0)
    
    # O3 (photochemical, higher with higher temp and solar radiation)
    o3 = (temperature * 1.8) + np.random.gamma(shape=2.0, scale=14.0, size=n_samples) - (humidity * 0.25)
    o3 = np.clip(o3, 5.0, 280.0)
    
    # Calculate true CPCB AQI
    aqi_list = []
    for i in range(n_samples):
        s_pm25 = calculate_cpcb_subindex('pm25', pm25[i])
        s_pm10 = calculate_cpcb_subindex('pm10', pm10[i])
        s_no2 = calculate_cpcb_subindex('no2', no2[i])
        s_so2 = calculate_cpcb_subindex('so2', so2[i])
        s_co = calculate_cpcb_subindex('co', co[i])
        s_o3 = calculate_cpcb_subindex('o3', o3[i])
        
        # AQI is the maximum of the subindices with slight synergistic interaction
        max_sub = max(s_pm25, s_pm10, s_no2, s_so2, s_co, s_o3)
        synergy = 0.03 * (s_pm25 + s_pm10 + s_no2) / 3.0
        final_aqi = min(500.0, max_sub + synergy)
        aqi_list.append(round(final_aqi, 2))
        
    df = pd.DataFrame({
        'pm25': np.round(pm25, 2),
        'pm10': np.round(pm10, 2),
        'no2': np.round(no2, 2),
        'so2': np.round(so2, 2),
        'co': np.round(co, 2),
        'o3': np.round(o3, 2),
        'temperature': np.round(temperature, 2),
        'humidity': np.round(humidity, 2),
        'aqi': aqi_list
    })
    
    return df

if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "cpcb_air_quality.csv")
    
    df = generate_cpcb_air_quality_dataset(n_samples=12000)
    df.to_csv(out_file, index=False)
    print(f"Generated {len(df)} records saved to {out_file}")
    print(df.describe())

