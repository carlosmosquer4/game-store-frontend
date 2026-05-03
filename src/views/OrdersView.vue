<template>
  <div class="orders-view">
    <div class="container">

      <div class="page-header">
        <h1 class="page-title">Mis Pedidos</h1>
        <p class="page-sub">Historial de todas tus compras</p>
      </div>

      <!-- Loading -->
      <div class="loading-state" v-if="loading">
        <div class="spinner"></div>
        <span>Cargando pedidos...</span>
      </div>

      <!-- Sin pedidos -->
      <div class="empty-state" v-else-if="orders.length === 0">
        <div class="empty-icon">📦</div>
        <h3>Aún no tienes pedidos</h3>
        <p>Realiza tu primera compra</p>
        <router-link to="/productos" class="btn btn-primary">
          Ver Catálogo
        </router-link>
      </div>

      <!-- Lista de pedidos -->
      <div class="orders-list" v-else>
        <div
          v-for="order in orders"
          :key="order.id"
          class="order-card"
        >
          <!-- Cabecera del pedido -->
          <div class="order-header">
            <div class="order-number">
              <span class="order-label">Pedido</span>
              <span class="order-id">#{{ order.orderNumber }}</span>
            </div>
            <span class="order-status" :class="`status-${order.status}`">
              {{ statusLabels[order.status] }}
            </span>
          </div>

          <!-- Info del pedido -->
          <div class="order-body">

            <!-- Miniaturas de productos -->
            <div class="order-products">
              <div
                v-for="item in order.items?.slice(0, 4)"
                :key="item.id"
                class="order-thumb"
              >
                <img
                  :src="item.product?.imageUrl || 'https://placehold.co/48x48/1a1a24/63b3ed?text=GS'"
                  :alt="item.product?.name"
                  @error="e => { e.target.onerror = null; e.target.src = 'https://placehold.co/48x48/1a1a24/63b3ed?text=GS' }"
                />
              </div>
              <div
                class="order-thumb more"
                v-if="order.items?.length > 4"
              >
                +{{ order.items.length - 4 }}
              </div>
            </div>

            <!-- Detalles -->
            <div class="order-details">
              <div class="order-detail-row">
                <span class="detail-label">Fecha</span>
                <span class="detail-value">{{ formatDate(order.createdAt) }}</span>
              </div>
              <div class="order-detail-row">
                <span class="detail-label">Total</span>
                <span class="detail-value accent">{{ formatPrice(order.total) }}</span>
              </div>
              <div class="order-detail-row">
                <span class="detail-label">Pago</span>
                <span
                  class="detail-value"
                  :class="`payment-${order.payment?.status}`"
                >
                  {{ paymentLabels[order.payment?.status] || 'Pendiente' }}
                </span>
              </div>
            </div>

          </div>

          <!-- Dirección de envío -->
          <div class="order-address">
            📍 {{ order.shippingAddress }}
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ordersApi } from '../services/api'

const orders = ref([])
const loading = ref(true)

const statusLabels = {
  pendiente: '🕐 Pendiente',
  procesando: '⚙️ Procesando',
  enviado: '🚚 Enviado',
  entregado: '✅ Entregado',
  cancelado: '❌ Cancelado',
}

const paymentLabels = {
  aprobado: '✅ Aprobado',
  rechazado: '❌ Rechazado',
  pendiente: '🕐 Pendiente',
}

function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(price)
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(async () => {
  try {
    const res = await ordersApi.getMyOrders()
    orders.value = res.data.data
  } catch (err) {
    console.error('Error cargando pedidos:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.orders-view {
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
  margin-bottom: 4px;
}

.page-sub {
  font-size: 14px;
  color: var(--color-text-muted);
}

/* Lista */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Card de pedido */
.order-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color 0.2s;
}

.order-card:hover {
  border-color: var(--color-border-hover);
}

/* Cabecera */
.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
}

.order-number {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-label {
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.order-id {
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-primary);
}

/* Status badges */
.order-status {
  font-size: 13px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
}

.status-pendiente {
  background: rgba(246, 137, 42, 0.1);
  color: var(--color-accent);
  border: 1px solid rgba(246, 137, 42, 0.2);
}

.status-procesando {
  background: rgba(99, 179, 237, 0.1);
  color: var(--color-primary);
  border: 1px solid rgba(99, 179, 237, 0.2);
}

.status-enviado {
  background: rgba(159, 122, 234, 0.1);
  color: #9f7aea;
  border: 1px solid rgba(159, 122, 234, 0.2);
}

.status-entregado {
  background: rgba(104, 211, 145, 0.1);
  color: var(--color-success);
  border: 1px solid rgba(104, 211, 145, 0.2);
}

.status-cancelado {
  background: rgba(252, 129, 129, 0.1);
  color: var(--color-danger);
  border: 1px solid rgba(252, 129, 129, 0.2);
}

/* Body */
.order-body {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px;
}

/* Miniaturas */
.order-products {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.order-thumb {
  width: 52px;
  height: 52px;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
}

.order-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}

.order-thumb.more {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
}

/* Detalles */
.order-details {
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
}

.order-detail-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.detail-label {
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.detail-value.accent {
  color: var(--color-accent);
}

.payment-aprobado { color: var(--color-success); }
.payment-rechazado { color: var(--color-danger); }
.payment-pendiente { color: var(--color-accent); }

/* Dirección */
.order-address {
  padding: 12px 20px;
  font-size: 13px;
  color: var(--color-text-muted);
  border-top: 1px solid var(--color-border);
  background: rgba(0,0,0,0.1);
}

@media (max-width: 640px) {
  .order-body {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .order-details {
    gap: 16px;
  }
}
</style>