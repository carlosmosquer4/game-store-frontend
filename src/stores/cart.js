import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cartApi } from '../services/api'
import { useAuthStore } from './auth'

export const useCartStore = defineStore('cart', () => {

  // ─── ESTADO ──────────────────────────────────────────
  const cart = ref(null)
  const loading = ref(false)

  // ─── COMPUTED ─────────────────────────────────────────
  // Cantidad total de items en el carrito
  const itemCount = computed(() => cart.value?.totalItems || 0)

  // Total en pesos
  const total = computed(() => cart.value?.totalPrice || '0.00')

  // Lista de items
  const items = computed(() => cart.value?.items || [])

  // ─── ACCIONES ─────────────────────────────────────────
  async function fetchCart() {
    const auth = useAuthStore()
    // Solo busca el carrito si hay sesión activa
    if (!auth.isAuthenticated) return

    loading.value = true
    try {
      const res = await cartApi.get()
      cart.value = res.data.data.cart
    } catch (err) {
      console.error('Error al cargar carrito:', err)
    } finally {
      loading.value = false
    }
  }

  async function addItem(productId, quantity = 1) {
    try {
      const res = await cartApi.addItem({ productId, quantity })
      cart.value = res.data.data.cart
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Error al agregar'
      }
    }
  }

  async function updateItem(itemId, quantity) {
    try {
      const res = await cartApi.updateItem(itemId, { quantity })
      cart.value = res.data.data.cart
    } catch (err) {
      console.error('Error al actualizar item:', err)
    }
  }

  async function removeItem(itemId) {
    try {
      const res = await cartApi.removeItem(itemId)
      cart.value = res.data.data.cart
    } catch (err) {
      console.error('Error al eliminar item:', err)
    }
  }

  async function clearCart() {
    try {
      const res = await cartApi.clear()
      cart.value = res.data.data.cart
    } catch (err) {
      console.error('Error al vaciar carrito:', err)
    }
  }

  return {
    cart,
    loading,
    itemCount,
    total,
    items,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
  }
})