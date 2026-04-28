import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
});

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);

export const uploadProduct = (formData) => api.post('/products', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

export const fetchProducts = () => api.get('/products');

export const trackEvent = (data) => api.post('/analytics', data);

export default api;
