<template>
  <div class="checkout-view">
    <div class="container">

      <div class="page-header">
        <h1 class="page-title">Finalizar Compra</h1>
      </div>

      <!-- Confirmación después de pagar -->
      <div class="confirmation" v-if="orderDone">
        <div class="confirm-icon" :class="paymentOk ? 'success' : 'failed'">
          {{ paymentOk ? '✅' : '❌' }}
        </div>
        <h2 class="confirm-title">
          {{ paymentOk ? '¡Pedido confirmado!' : 'Pago rechazado' }}
        </h2>
        <p class="confirm-desc" v-if="paymentOk">
          Tu pedido <strong>#{{ orderNumber }}</strong> fue recibido.
          Te notificaremos cuando sea enviado.
        </p>
        <p class="confirm-desc" v-else>
          El pago fue rechazado. Intenta con otro método.
        </p>
        <div class="confirm-actions">
          <router-link
            v-if="paymentOk"
            to="/pedidos"
            class="btn btn-primary"
          >
            Ver mis pedidos
          </router-link>
          <button
            v-else
            class="btn btn-primary"
            @click="orderDone = false"
          >
            Intentar de nuevo
          </button>
          <router-link to="/" class="btn btn-outline">
            Ir al inicio
          </router-link>
        </div>
      </div>

      <!-- Formulario de checkout -->
      <div class="checkout-layout" v-else>

        <!-- Formulario -->
        <div class="checkout-form">

          <!-- Sección envío -->
          <div class="form-section">
            <h3 class="form-section-title">📍 Dirección de envío</h3>
            <div class="form-grid">
              <div class="field-group full">
                <label class="field-label">Dirección completa *</label>
                <input
                  v-model="form.address"
                  placeholder="Calle, número, barrio..."
                  class="input"
                  required
                />
              </div>
              <div class="field-group">
                <label class="field-label">Ciudad *</label>
                <input
                  v-model="form.city"
                  placeholder="Ciudad"
                  class="input"
                />
              </div>
              <div class="field-group">
                <label class="field-label">Departamento *</label>
                <input
                  v-model="form.department"
                  placeholder="Departamento"
                  class="input"
                />
              </div>
            </div>
          </div>

          <!-- Sección método de pago -->
          <div class="form-section">
            <h3 class="form-section-title">💳 Método de pago</h3>
            <div class="payment-options">
              <label
                v-for="method in paymentMethods"
                :key="method.value"
                class="payment-option"
                :class="{ selected: form.paymentMethod === method.value }"
              >
                <input
                  type="radio"
                  :value="method.value"
                  v-model="form.paymentMethod"
                  class="sr-only"
                />
                <span class="method-icon">{{ method.icon }}</span>
                <div class="method-info">
                  <span class="method-name">{{ method.name }}</span>
                  <span class="method-desc">{{ method.desc }}</span>
                </div>
                <span class="method-check" v-if="form.paymentMethod === method.value">
                  ✓
                </span>
              </label>
            </div>
          </div>

          <!-- Error -->
          <div class="alert alert-error" v-if="errorMsg">
            {{ errorMsg }}
          </div>

          <!-- Botón pagar -->
          <button
            class="btn btn-primary pay-btn"
            @click="handleCheckout"
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading">
              Procesando pago...
            </span>
            <span v-else>
              Pagar {{ formatPrice(cart.total) }}
            </span>
          </button>

        </div>

        <!-- Resumen del pedido -->
        <div class="order-summary">
          <h3 class="summary-title">Tu pedido</h3>

          <div class="summary-items">
            <div
              v-for="item in cart.items"
              :key="item.id"
              class="summary-item"
            >
              <div class="si-img">
                <img
                  :src="item.product.imageUrl || 'https://placehold.co/48x48/1a1a24/63b3ed?text=GS'"
                  :alt="item.product.name"
                  @error="e => { e.target.onerror = null; e.target.src = 'https://placehold.co/48x48/1a1a24/63b3ed?text=GS' }"
                />
              </div>
              <div class="si-info">
                <span class="si-name">{{ item.product.name }}</span>
                <span class="si-qty">× {{ item.quantity }}</span>
              </div>
              <span class="si-price">
                {{ formatPrice(item.product.price * item.quantity) }}
              </span>
            </div>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-row">
            <span>Envío</span>
            <span class="free">Gratis</span>
          </div>

          <div class="summary-total">
            <span>Total</span>
            <span>{{ formatPrice(cart.total) }}</span>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ordersApi, paymentsApi } from '../services/api'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

const cart = useCartStore()
const auth = useAuthStore()
const router = useRouter()

// ─── ESTADO ──────────────────────────────────────────────
const loading = ref(false)
const errorMsg = ref('')
const orderDone = ref(false)
const paymentOk = ref(false)
const orderNumber = ref('')

const form = reactive({
  address: '',
  city: '',
  department: '',
  paymentMethod: 'pse'
})

const paymentMethods = [
  {
    value: 'pse',
    icon: '🏦',
    name: 'PSE',
    desc: 'Débito bancario en línea'
  },
  {
    value: 'tarjeta',
    icon: '💳',
    name: 'Tarjeta',
    desc: 'Crédito o débito'
  },
  {
    value: 'contraentrega',
    icon: '📦',
    name: 'Contraentrega',
    desc: 'Pagas al recibir'
  },
  {
    value: 'paypal',
    icon: '🅿️',
    name: 'PayPal',
    desc: 'Pago con PayPal'
  },
  {
    value: 'transferencia',
    icon: '🔁',
    name: 'Transferencia',
    desc: 'Transferencia bancaria'
  },
]

// ─── COMPUTED ────────────────────────────────────────────
const isFormValid = computed(() => {
  return form.address &&
    form.city &&
    form.department &&
    form.paymentMethod &&
    cart.items.length > 0
})

// ─── FUNCIONES ───────────────────────────────────────────
function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(price)
}

async function handleCheckout() {
  if (!isFormValid.value) return
  loading.value = true
  errorMsg.value = ''

  try {
    // 1. Crear el pedido
    const shippingAddress = `${form.address}, ${form.city}, ${form.department}`
    const orderRes = await ordersApi.create({ shippingAddress })
    const order = orderRes.data.data.order
    orderNumber.value = order.orderNumber

    // 2. Procesar el pago
    const payRes = await paymentsApi.process({
      orderId: order.id,
      method: form.paymentMethod
    })

    paymentOk.value = payRes.data.success
    orderDone.value = true

    // 3. Recargar carrito (ya está vacío)
    if (paymentOk.value) {
      await cart.fetchCart()
    }

  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Error al procesar el pedido'
  } finally {
    loading.value = false
  }
}

// ─── LIFECYCLE ───────────────────────────────────────────
onMounted(async () => {
  await cart.fetchCart()

  // Si el carrito está vacío redirigir
  if (cart.items.length === 0) {
    router.push('/carrito')
    return
  }

  // Pre-llenar con datos del usuario
  if (auth.user) {
    form.address = auth.user.address || ''
    form.city = auth.user.city || ''
    form.department = auth.user.department || ''
  }
})
</script>

<style scoped>
.checkout-view {
  min-height: 100vh;
  padding-bottom: 60px;
}

.page-header {
  padding: 32px 0 24px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 32px;
}

.page-title {
  font-family: var(--font-display);
  font-size: clamp(22px, 4vw, 32px);
  font-weight: 700;
}

/* Layout */
.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 28px;
  align-items: start;
}

/* Secciones del formulario */
.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.form-section-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 18px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-group.full {
  grid-column: 1 / -1;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-light);
}

/* Métodos de pago */
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
}

.payment-option:hover {
  border-color: var(--color-border-hover);
}

.payment-option.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-dim);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

.method-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.method-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.method-name {
  font-size: 14px;
  font-weight: 600;
}

.method-desc {
  font-size: 12px;
  color: var(--color-text-muted);
}

.method-check {
  font-size: 16px;
  color: var(--color-primary);
  font-weight: 700;
}

/* Botón pagar */
.pay-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
}

/* Resumen */
.order-summary {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: 90px;
}

.summary-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.si-img {
  width: 44px;
  height: 44px;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  flex-shrink: 0;
}

.si-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}

.si-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.si-name {
  font-size: 13px;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.si-qty {
  font-size: 11px;
  color: var(--color-text-muted);
}

.si-price {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-accent);
  white-space: nowrap;
}

.summary-divider {
  height: 1px;
  background: var(--color-border);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--color-text-light);
}

.free {
  color: var(--color-success);
  font-weight: 600;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  padding-top: 4px;
}

.summary-total span:last-child {
  color: var(--color-accent);
}

/* Confirmación */
.confirmation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 0;
  text-align: center;
  max-width: 480px;
  margin: 0 auto;
}

.confirm-icon {
  font-size: 56px;
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.confirm-icon.success {
  background: rgba(104, 211, 145, 0.1);
  border: 2px solid var(--color-success);
}

.confirm-icon.failed {
  background: rgba(252, 129, 129, 0.1);
  border: 2px solid var(--color-danger);
}

.confirm-title {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
}

.confirm-desc {
  font-size: 15px;
  color: var(--color-text-muted);
  line-height: 1.7;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 8px;
}

/* Responsive */
@media (max-width: 900px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: static;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .field-group.full {
    grid-column: 1;
  }
}
</style>