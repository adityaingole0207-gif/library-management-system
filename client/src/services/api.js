import axios from 'axios';

// In production, uses VITE_API_URL if defined, otherwise falls back to /api
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const booksApi = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
};

export const membersApi = {
  getAll: (params) => api.get('/members', { params }),
  getById: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
};

export const loansApi = {
  getAll: (params) => api.get('/loans', { params }),
  getOverdue: () => api.get('/loans/overdue'),
  getStats: () => api.get('/loans/stats'),
  getById: (id) => api.get(`/loans/${id}`),
  create: (data) => api.post('/loans', data),
  returnBook: (id) => api.put(`/loans/${id}/return`),
  delete: (id) => api.delete(`/loans/${id}`),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getDbInfo: () => api.get('/admin/db-info'),
};

export default api;
