<template>
  <div class="orders-admin-view">
    <div class="container">

      <div class="page-header">
        <div class="header-left">
          <router-link to="/admin" class="back-btn">
            ← Volver al panel
          </router-link>
          <h1 class="page-title">Todos los Pedidos</h1>
        </div>

        <!-- Filtro por estado -->
        <select v-model="statusFilter" @change="fetchOrders()" class="input status-select">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="procesando">Procesando</option>
          <option value="enviado">Enviado</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <!-- Stats rápidas -->
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in stats" :key="stat.label">
          <span class="stat-icon">{{ stat.icon }}</span>
          <div>
            <p class="stat-num">{{ stat.num }}</p>
            <p class="stat-label">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-state" v-if="loading">
        <div class="spinner"></div>
        <span>Cargando pedidos...</span>
      </div>

      <!-- Tabla de pedidos -->
      <div class="table-wrap" v-else>
        <table class="orders-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Pago</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">

              <!-- Número -->
              <td>
                <span class="order-number">#{{ order.orderNumber }}</span>
              </td>

              <!-- Cliente -->
              <td>
                <div class="client-info">
                  <div class="client-avatar">
                    {{ order.user?.name?.charAt(0)?.toUpperCase() }}
                  </div>
                  <div>
                    <p class="client-name">{{ order.user?.name }}</p>
                    <p class="client-email">{{ order.user?.email }}</p>
                  </div>
                </div>
              </td>

              <!-- Total -->
              <td class="price-cell">{{ formatPrice(order.total) }}</td>

              <!-- Estado -->
              <td>
                <select
                  class="status-select-inline"
                  :class="`status-${order.status}`"
                  :value="order.status"
                  @change="updateStatus(order, $event.target.value)"
                >
                  <option value="pendiente">🕐 Pendiente</option>
                  <option value="procesando">⚙️ Procesando</option>
                  <option value="enviado">🚚 Enviado</option>
                  <option value="entregado">✅ Entregado</option>
                  <option value="cancelado">❌ Cancelado</option>
                </select>
              </td>

              <!-- Pago -->
              <td>
                <span class="payment-badge" :class="order.payment?.status">
                  {{ paymentLabels[order.payment?.status] || '🕐 Pendiente' }}
                </span>
              </td>

              <!-- Fecha -->
              <td class="date-cell">{{ formatDate(order.createdAt) }}</td>

              <!-- Dirección -->
              <td>
                <span class="address-cell" :title="order.shippingAddress">
                  📍 {{ order.shippingAddress?.substring(0, 25) }}...
                </span>
              </td>

            </tr>
          </tbody>
        </table>

        <!-- Sin resultados -->
        <div class="empty-state" v-if="orders.length === 0">
          <div class="empty-icon">📦</div>
          <h3>Sin pedidos</h3>
          <p>No hay pedidos con ese estado</p>
        </div>

        <!-- Paginación -->
        <div class="pagination" v-if="totalPages > 1">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >←</button>
          <button
            v-for="page in totalPages"
            :key="page"
            class="page-btn"
            :class="{ active: page === currentPage }"
            @click="changePage(page)"
          >{{ page }}</button>
          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >→</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ordersApi } from '../../services/api'
import api from '../../services/api'

const orders = ref([])
const loading = ref(true)
const statusFilter = ref('')
const currentPage = ref(1)
const perPage = 15
const total = ref(0)

const totalPages = computed(() => Math.ceil(total.value / perPage))

const paymentLabels = {
  aprobado: '✅ Aprobado',
  rechazado: '❌ Rechazado',
  pendiente: '🕐 Pendiente',
}

const stats = computed(() => [
  {
    icon: '📦',
    num: orders.value.filter(o => o.status === 'pendiente').length,
    label: 'Pendientes'
  },
  {
    icon: '⚙️',
    num: orders.value.filter(o => o.status === 'procesando').length,
    label: 'Procesando'
  },
  {
    icon: '🚚',
    num: orders.value.filter(o => o.status === 'enviado').length,
    label: 'Enviados'
  },
  {
    icon: '✅',
    num: orders.value.filter(o => o.status === 'entregado').length,
    label: 'Entregados'
  },
])

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
    month: 'short',
    day: 'numeric'
  })
}

async function fetchOrders(page = 1) {
  loading.value = true
  currentPage.value = page
  try {
    const params = { page, limit: perPage }
    if (statusFilter.value) params.status = statusFilter.value

    const res = await ordersApi.getAllAdmin(params)
    orders.value = res.data.data
    total.value = res.data.pagination.total
  } catch (err) {
    console.error('Error cargando pedidos:', err)
  } finally {
    loading.value = false
  }
}

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  fetchOrders(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function updateStatus(order, newStatus) {
  if (order.status === newStatus) return
  try {
    await api.put(`/orders/${order.id}/status`, { status: newStatus })
    order.status = newStatus
    alert(`Pedido actualizado a: ${newStatus}`)
  } catch (err) {
    alert(err.response?.data?.message || 'Error al actualizar estado')
  }
}

onMounted(() => fetchOrders())
</script>

<style scoped>
.orders-admin-view {
  min-height: 100vh;
  padding-bottom: 60px;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 24px 0 20px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.back-btn {
  display: inline-block;
  font-size: 13px;
  color: var(--color-primary);
  margin-bottom: 8px;
  transition: opacity 0.2s;
}

.back-btn:hover { opacity: 0.7; }

.page-title {
  font-family: var(--font-display);
  font-size: clamp(22px, 4vw, 30px);
  font-weight: 700;
}

.status-select {
  width: 200px;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon { font-size: 24px; }

.stat-num {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 3px;
}

/* Tabla */
.table-wrap {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}

.orders-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
  vertical-align: middle;
}

.orders-table tr:last-child td {
  border-bottom: none;
}

.orders-table tr:hover td {
  background: rgba(99, 179, 237, 0.02);
}

.order-number {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
}

/* Cliente */
.client-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.client-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #0f0f13;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}

.client-name {
  font-size: 13px;
  font-weight: 600;
}

.client-email {
  font-size: 11px;
  color: var(--color-text-muted);
}

.price-cell {
  font-weight: 700;
  color: var(--color-accent);
  font-family: var(--font-mono);
}

/* Select de estado inline */
.status-select-inline {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;
  background: transparent;
  cursor: pointer;
}

.status-select-inline.status-pendiente {
  color: var(--color-accent);
  border-color: var(--color-accent);
  background: rgba(246, 137, 42, 0.1);
}

.status-select-inline.status-procesando {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: var(--color-primary-dim);
}

.status-select-inline.status-enviado {
  color: #9f7aea;
  border-color: #9f7aea;
  background: rgba(159, 122, 234, 0.1);
}

.status-select-inline.status-entregado {
  color: var(--color-success);
  border-color: var(--color-success);
  background: rgba(104, 211, 145, 0.1);
}

.status-select-inline.status-cancelado {
  color: var(--color-danger);
  border-color: var(--color-danger);
  background: rgba(252, 129, 129, 0.1);
}

/* Pago */
.payment-badge {
  font-size: 12px;
  font-weight: 600;
}

.payment-badge.aprobado { color: var(--color-success); }
.payment-badge.rechazado { color: var(--color-danger); }
.payment-badge.pendiente { color: var(--color-accent); }

.date-cell {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.address-cell {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* Paginación */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px;
  border-top: 1px solid var(--color-border);
}

.page-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  font-size: 13px;
  color: var(--color-text-light);
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #0f0f13;
  font-weight: 700;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>