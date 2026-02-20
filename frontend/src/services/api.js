import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const storedToken = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

if (storedToken) {
  api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
}

export const setAuthToken = (token) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (token) {
    window.localStorage.setItem('token', token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    window.localStorage.removeItem('token');
    delete api.defaults.headers.common.Authorization;
  }
};

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Portfolio APIs
export const portfolioAPI = {
  getCurrent: () => api.get('/portfolio/current'),
  getHistory: () => api.get('/portfolio/history'),
  create: (data) => api.post('/portfolio', data),
  update: (id, data) => api.put(`/portfolio/${id}`, data),
  delete: (id) => api.delete(`/portfolio/${id}`),
};

// Returns APIs
export const returnsAPI = {
  getMonthlyReturns: (months = 12) => api.get(`/returns?months=${months}`),
  getSummary: () => api.get('/returns/summary'),
  create: (data) => api.post('/returns', data),
  update: (id, data) => api.put(`/returns/${id}`, data),
};

export default api;


