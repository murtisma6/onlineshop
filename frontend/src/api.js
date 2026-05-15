import axios from 'axios';

const getApiUrl = () => {
  const { hostname, protocol, port } = window.location;
  
  // Use environment variable if provided (e.g., during build)
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl;

  // If running in development mode (Vite typically uses ports like 5173 or 3000)
  // and we want to hit the backend directly on 8080
  if (port === '5173' || port === '3000') {
    return `http://${hostname}:8080/api`;
  }

  // Otherwise, use the Nginx proxy path (relative to current origin)
  // This is the preferred way for Docker/Production
  return `${protocol}//${hostname}${port ? ':' + port : ''}/api`;
};

export const API_URL = getApiUrl();

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
export const updateStore = (id, formData) => api.put(`/stores/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteStoreLogo = (id) => api.delete(`/stores/${id}/logo`);
export const deleteLeftBanner = (id) => api.delete(`/stores/${id}/left-banner`);
export const deleteRightBanner = (id) => api.delete(`/stores/${id}/right-banner`);
export const deleteStore = (id) => api.delete(`/stores/${id}`);

export const trackEvent = (data) => api.post('/analytics', data);

export const fetchAdminDashboard = () => api.get('/admin/dashboard');
export const fetchAdminTraffic = () => api.get('/admin/traffic');
export const fetchAllUsers = () => api.get('/admin/users');
export const adminCreateUser = (data) => api.post('/admin/users', data);
export const adminUpdateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const adminDeleteUser = (id) => api.delete(`/admin/users/${id}`);
export const adminResetPassword = (id, password) => api.post(`/admin/users/${id}/reset-password`, { password });
export const createBulkUsers = (users) => api.post('/admin/users/bulk', users);
export const createBulkStores = (stores) => api.post('/admin/stores/bulk', stores);

export const fetchReviews = (productId) => api.get(`/reviews/product/${productId}`);
export const addReview = (productId, data) => api.post(`/reviews/product/${productId}`, data);

export const fetchActivePromotions = () => api.get('/promotions/active');
export const fetchAllPromotions = () => api.get('/promotions/admin/all');
export const savePromotion = (data) => api.post('/promotions/admin', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deletePromotion = (id) => api.delete(`/promotions/admin/${id}`);

export default api;
