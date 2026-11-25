const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('airguard_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    localStorage.removeItem('airguard_token');
    localStorage.removeItem('airguard_user');
    if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  // Handle binary / non-json
  const contentType = response.headers.get('content-type');
  if (contentType && (contentType.includes('application/pdf') || contentType.includes('text/csv'))) {
    return response.blob();
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),

  // Users
  updateProfile: (data) => request('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data) => request('/users/password', { method: 'PUT', body: JSON.stringify(data) }),

  // Predictions
  predictAqi: (data) => request('/predict/', { method: 'POST', body: JSON.stringify(data) }),
  predictLinearRegression: (data) => request('/predict/linear-regression', { method: 'POST', body: JSON.stringify(data) }),
  predictRandomForest: (data) => request('/predict/random-forest', { method: 'POST', body: JSON.stringify(data) }),
  predictAnn: (data) => request('/predict/ann', { method: 'POST', body: JSON.stringify(data) }),
  compareModels: (data) => request('/predict/compare', { method: 'POST', body: JSON.stringify(data) }),
  getModelMetrics: () => request('/models/metrics'),
  getHistory: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/history/${qs ? `?${qs}` : ''}`);
  },
  getPredictionDetail: (id) => request(`/history/${id}`),
  deletePrediction: (id) => request(`/history/${id}`, { method: 'DELETE' }),

  // Analytics
  getDashboardSummary: () => request('/analytics/dashboard-summary'),
  getPollutantAverages: () => request('/analytics/pollutant-averages'),

  // Reports
  exportCsv: async () => {
    const blob = await request('/reports/export/csv');
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AirGuard_Prediction_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },
  exportPdf: async () => {
    const blob = await request('/reports/export/pdf');
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AirGuard_Prediction_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: () => request('/admin/users'),
  updateUserStatus: (id, data) => request(`/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  getAdminDatasets: () => request('/admin/datasets'),
  getAdminDatasetPreview: (limit = 25) => request(`/admin/dataset-preview?limit=${limit}`),
  getAdminModels: () => request('/admin/models'),
  retrainModels: () => request('/admin/models/retrain', { method: 'POST' }),
  getAdminPredictions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin/predictions${qs ? `?${qs}` : ''}`);
  },
};

