import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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


