import axios from 'axios'

// Instancia base de axios con la URL del backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  timeout: 15000,
})

// INTERCEPTOR DE REQUEST
// Antes de cada petición, agrega el token JWT automáticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// INTERCEPTOR DE RESPONSE
// Si el backend responde 401 (no autorizado), cierra sesión
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── ENDPOINTS DE AUTH ─────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
}

// ─── ENDPOINTS DE PRODUCTOS ────────────────────────────
export const productsApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getSimilar: (id) => api.get(`/products/${id}/similar`),
}

// ─── ENDPOINTS DE CATEGORÍAS ───────────────────────────
export const categoriesApi = {
  getAll: () => api.get('/categories'),
}

// ─── ENDPOINTS DEL CARRITO ─────────────────────────────
export const cartApi = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/items', data),
  updateItem: (id, data) => api.put(`/cart/items/${id}`, data),
  removeItem: (id) => api.delete(`/cart/items/${id}`),
  clear: () => api.delete('/cart/clear'),
}

// ─── ENDPOINTS DE PEDIDOS ──────────────────────────────
export const ordersApi = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
}

// ─── ENDPOINTS DE PAGOS ────────────────────────────────
export const paymentsApi = {
  process: (data) => api.post('/payments', data),
}

// ─── ENDPOINTS DE RESEÑAS ──────────────────────────────
export const reviewsApi = {
  getByProduct: (id) => api.get(`/reviews/product/${id}`),
  create: (id, data) => api.post(`/reviews/product/${id}`, data),
}

// ─── ENDPOINTS DE WISHLIST ─────────────────────────────
export const wishlistApi = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist/items', { productId }),
  remove: (productId) => api.delete(`/wishlist/items/${productId}`),
  check: (productId) => api.get(`/wishlist/${productId}`),
}

// ─── CHATBOT ───────────────────────────────────────────
export const chatbotApi = {
  send: (message, history) => api.post('/chatbot/message', { message, history }),
}

export default api