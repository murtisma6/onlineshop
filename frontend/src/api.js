import axios from 'axios';

const API_URL = 'http://192.168.0.105:8080/api';

const api = axios.create({
  baseURL: API_URL,
});

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const sendOtp = (userId, type) => api.post(`/auth/send-otp?userId=${userId}&type=${type}`);
export const verifyOtp = (userId, type, otp) => api.post(`/auth/verify-otp?userId=${userId}&type=${type}&otp=${otp}`);
export const fetchUser = (id) => api.get(`/auth/user/${id}`);
export const updateUser = (id, data) => api.put(`/auth/user/${id}`, data);

export const uploadProduct = (data) => api.post('/products', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const updateProduct = (id, data) => api.put(`/products/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const fetchProducts = () => api.get('/products');
export const fetchProductById = (id) => api.get(`/products/${id}`);
export const fetchStoreProducts = (storeId) => api.get(`/products/store/${storeId}`);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const fetchSellerStores = (sellerId) => api.get(`/stores/seller/${sellerId}`);
export const fetchStoreByUrl = (url) => api.get(`/stores/url/${url}`);
export const createStore = (storeData) => api.post('/stores', storeData);
export const deleteStore = (id) => api.delete(`/stores/${id}`);

export const trackEvent = (data) => api.post('/analytics', data);

export const fetchAdminDashboard = () => api.get('/admin/dashboard');
export const fetchAdminTraffic = () => api.get('/admin/traffic');
export const createBulkUsers = (users) => api.post('/admin/users/bulk', users);
export const createBulkStores = (stores) => api.post('/admin/stores/bulk', stores);

export default api;
