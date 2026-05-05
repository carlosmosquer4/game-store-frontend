import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../services/api'

export const useAuthStore = defineStore('auth', () => {

  // ─── ESTADO ──────────────────────────────────────────
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const loading = ref(false)
  const error = ref(null)

  // ─── COMPUTED ─────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // ─── ACCIONES ─────────────────────────────────────────
async function login(email, password) {
  loading.value = true
  error.value = null
  try {
    const res = await authApi.login({ email, password })
    const { data } = res.data

    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    return true
  } catch (err) {
    // Mensaje específico para correo no verificado
    if (err.response?.status === 403) {
      error.value = 'Debes verificar tu correo antes de iniciar sesión'
    } else {
      error.value = err.response?.data?.message || 'Error al iniciar sesión'
    }
    return false
  } finally {
    loading.value = false
  }
}

async function register(userData) {
  loading.value = true
  error.value = null
  try {
    const res = await authApi.register(userData)
    // El backend solo devuelve mensaje, no token
    // Retornamos true para indicar éxito
    return true
  } catch (err) {
    if (err.response?.data?.errors?.length > 0) {
      error.value = err.response.data.errors
        .map(e => e.message)
        .join('. ')
    } else {
      error.value = err.response?.data?.message || 'Error al registrarse'
    }
    return false
  } finally {
    loading.value = false
  }
}

  async function fetchProfile() {
    try {
      const res = await authApi.getProfile()
      user.value = res.data.data.user
      localStorage.setItem('user', JSON.stringify(user.value))
    } catch (err) {
      console.error('Error al obtener perfil:', err)
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    register,
    fetchProfile,
    logout,
  }
})