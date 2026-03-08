// ============================================================
// FRONTEND — src/api/api.js
// Substitui o mysqlApi.js e a dependência do Base44
// ============================================================

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// ---- Auth helpers ----
function getToken() {
  return localStorage.getItem('admin_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro na requisição');
  return data;
}

// ---- AUTH ----
export const authApi = {
  login: (email, password) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => apiFetch('/auth/me'),
  logout: () => localStorage.removeItem('admin_token'),
  saveToken: (token) => localStorage.setItem('admin_token', token),
  isLoggedIn: () => !!getToken(),
};

// ---- PRODUTOS ----
export const productsApi = {
  list: (filters) => {
    const params = new URLSearchParams();
    if (filters?.is_active !== undefined) params.set('is_active', filters.is_active);
    if (filters?.is_featured !== undefined) params.set('is_featured', filters.is_featured);
    return apiFetch(`/products${params.toString() ? '?' + params : ''}`);
  },
  get: (id) => apiFetch(`/products/${id}`),
  create: (data) => apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/products/${id}`, { method: 'DELETE' }),
  filter: (filters) => productsApi.list(filters),
};

// ---- SABORES ----
export const flavorsApi = {
  list: () => apiFetch('/flavors'),
  create: (data) => apiFetch('/flavors', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/flavors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/flavors/${id}`, { method: 'DELETE' }),
};

// ---- BANNERS ----
export const bannersApi = {
  list: () => apiFetch('/banners'),
  create: (data) => apiFetch('/banners', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/banners/${id}`, { method: 'DELETE' }),
};

// ---- PEDIDOS ----
export const ordersApi = {
  list: () => apiFetch('/orders'),
  get: (id) => apiFetch(`/orders/${id}`),
  create: (data) => apiFetch('/orders', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/orders/${id}`, { method: 'DELETE' }),
};

// ---- CONFIGURAÇÕES ----
export const settingsApi = {
  get: () => apiFetch('/settings'),
  save: (data) => apiFetch('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};

// ---- UPLOAD ----
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro no upload');
  return data; // { file_url }
};