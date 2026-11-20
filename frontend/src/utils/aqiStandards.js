export const AQI_CATEGORIES = {
  Good: {
    name: 'Good',
    range: '0 - 50',
    color: '#16A34A',
    bgLight: '#DCFCE7',
    textColor: '#15803D',
    borderColor: '#86EFAC',
    description: 'Air quality is considered satisfactory, and air pollution poses little or no risk.'
  },
  Satisfactory: {
    name: 'Satisfactory',
    range: '51 - 100',
    color: '#84CC16',
    bgLight: '#ECFCCB',
    textColor: '#4D7C0F',
    borderColor: '#BEF264',
    description: 'Minor breathing discomfort to sensitive people during prolonged exposure.'
  },
  Moderate: {
    name: 'Moderate',
    range: '101 - 200',
    color: '#EAB308',
    bgLight: '#FEF9C3',
    textColor: '#A16207',
    borderColor: '#FDE047',
    description: 'Breathing discomfort to individuals with lung diseases such as asthma, and discomfort to children and older adults.'
  },
  Poor: {
    name: 'Poor',
    range: '201 - 300',
    color: '#F97316',
    bgLight: '#FFEDD5',
    textColor: '#C2410C',
    borderColor: '#FDBA74',
    description: 'Breathing discomfort to most people on prolonged exposure. Avoid strenuous outdoor activities.'
  },
  'Very Poor': {
    name: 'Very Poor',
    range: '301 - 400',
    color: '#DC2626',
    bgLight: '#FEE2E2',
    textColor: '#B91C1C',
    borderColor: '#FCA5A5',
    description: 'Respiratory illness on prolonged exposure. Pronounced effect on people with lung and heart diseases.'
  },
  Severe: {
    name: 'Severe',
    range: '401 - 500+',
    color: '#7F1D1D',
    bgLight: '#FFE4E6',
    textColor: '#881337',
    borderColor: '#FDA4AF',
    description: 'Healthy people may experience respiratory effects; serious impacts on individuals with existing medical conditions.'
  }
};

export function getCategoryInfo(categoryName) {
  return AQI_CATEGORIES[categoryName] || AQI_CATEGORIES['Moderate'];
}

export function getAqiCategoryFromValue(aqi) {
  const val = Number(aqi) || 0;
  if (val <= 50) return 'Good';
  if (val <= 100) return 'Satisfactory';
  if (val <= 200) return 'Moderate';
  if (val <= 300) return 'Poor';
  if (val <= 400) return 'Very Poor';
  return 'Severe';
}

