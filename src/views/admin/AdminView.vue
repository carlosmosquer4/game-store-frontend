<template>
  <div class="admin-view">
    <div class="container">

      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Panel Admin</h1>
          <p class="page-sub">Gestión de productos</p>
        </div>
        <div class="header-actions">
          <router-link to="/admin/pedidos" class="btn btn-outline">
            📦 Ver Pedidos
          </router-link>
          <router-link to="/admin/productos/nuevo" class="btn btn-primary">
            + Nuevo Producto
          </router-link>
        </div>
      </div>

      <!-- Stats rápidas -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-icon">📦</span>
          <div>
            <p class="stat-num">{{ total }}</p>
            <p class="stat-label">Productos</p>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">⭐</span>
          <div>
            <p class="stat-num">{{ featured }}</p>
            <p class="stat-label">Destacados</p>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🏷️</span>
          <div>
            <p class="stat-num">{{ categories.length }}</p>
            <p class="stat-label">Categorías</p>
          </div>
        </div>
      </div>

      <!-- Buscador -->
      <div class="toolbar">
        <input
          v-model="search"
          @input="debouncedSearch"
          placeholder="Buscar producto..."
          class="input search-input"
        />
        <select v-model="categoryFilter" @change="fetchProducts()" class="input category-select">
          <option value="">Todas las categorías</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <!-- Loading -->
      <div class="loading-state" v-if="loading">
        <div class="spinner"></div>
        <span>Cargando productos...</span>
      </div>

      <!-- Tabla de productos -->
      <div class="table-wrap" v-else>
        <table class="products-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Destacado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id">

              <!-- Imagen -->
              <td>
                <div class="table-img">
                  <img
                    :src="getProductImage(product)"
                    :alt="product.name"
                    @error="e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=100&q=80' }"
                  />
                </div>
              </td>

              <!-- Nombre -->
              <td>
                <p class="product-name">{{ product.name }}</p>
                <p class="product-brand" v-if="product.brand">{{ product.brand }}</p>
              </td>

              <!-- Categoría -->
              <td>
                <span class="badge badge-primary">
                  {{ product.category?.name }}
                </span>
              </td>

              <!-- Precio -->
              <td class="price-cell">{{ formatPrice(product.price) }}</td>

              <!-- Stock -->
              <td>
                <span
                  class="stock-badge"
                  :class="product.stock === 0 ? 'out' : product.stock <= 5 ? 'low' : 'ok'"
                >
                  {{ product.stock }} uds
                </span>
              </td>

              <!-- Destacado -->
              <td>
                <span v-if="product.featured">⭐</span>
                <span v-else class="text-muted">—</span>
              </td>

              <!-- Acciones -->
              <td>
                <div class="action-btns">
                  <router-link
                    :to="`/admin/productos/editar/${product.id}`"
                    class="action-btn edit"
                    title="Editar"
                  >
                    ✏️
                  </router-link>
                  <button
                    class="action-btn delete"
                    @click="handleDelete(product)"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </td>

            </tr>
          </tbody>
        </table>

        <!-- Sin resultados -->
        <div class="empty-state" v-if="products.length === 0">
          <div class="empty-icon">📦</div>
          <h3>Sin productos</h3>
          <p>Crea tu primer producto</p>
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
import { productsApi, categoriesApi } from '../../services/api'
import api from '../../services/api'

const products = ref([])
const categories = ref([])
const loading = ref(true)
const total = ref(0)
const featured = ref(0)
const currentPage = ref(1)
const perPage = 15
const search = ref('')
const categoryFilter = ref('')

const totalPages = computed(() => Math.ceil(total.value / perPage))

function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(price)
}

function getProductImage(product) {
  if (product.images?.length > 0 && product.images[0].imageUrl) {
    return product.images[0].imageUrl
  }
  if (product.imageUrl) return product.imageUrl
  const name = (product.category?.name || '').toLowerCase()
  if (name.includes('raton') || name.includes('mouse')) {
    return 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=100&q=80'
  }
  if (name.includes('teclado')) {
    return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&q=80'
  }
  if (name.includes('auricular')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80'
  }
  if (name.includes('monitor')) {
    return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&q=80'
  }
  if (name.includes('celular')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&q=80'
  }
  if (name.includes('mousepad')) {
    return 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=100&q=80'
  }
  if (name.includes('laptop')) {
    return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100&q=80'
  }
  return 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=100&q=80'
}

async function fetchProducts(page = 1) {
  loading.value = true
  currentPage.value = page
  try {
    const params = { page, limit: perPage }
    if (search.value) params.search = search.value
    if (categoryFilter.value) params.categoryId = categoryFilter.value

    const res = await productsApi.getAll(params)
    products.value = res.data.data
    total.value = res.data.pagination.total

    // Contar destacados
    const featRes = await productsApi.getAll({ featured: true, limit: 100 })
    featured.value = featRes.data.pagination.total

  } catch (err) {
    console.error('Error cargando productos:', err)
  } finally {
    loading.value = false
  }
}

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  fetchProducts(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

let searchTimer = null
function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchProducts(), 400)
}

async function handleDelete(product) {
  if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return
  try {
    await api.delete(`/products/${product.id}`)
    // Quitar de la lista sin recargar
    products.value = products.value.filter(p => p.id !== product.id)
    total.value--
    alert('Producto eliminado correctamente')
  } catch (err) {
    alert(err.response?.data?.message || 'Error al eliminar producto')
  }
}

onMounted(async () => {
  const [_, catRes] = await Promise.all([
    fetchProducts(),
    categoriesApi.getAll()
  ])
  categories.value = catRes.data.data.categories
})
</script>

<style scoped>
.admin-view {
  min-height: 100vh;
  padding-bottom: 60px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 0 24px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
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

.header-actions {
  display: flex;
  gap: 10px;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: border-color 0.2s;
}

.stat-card:hover {
  border-color: var(--color-border-hover);
}

.stat-icon {
  font-size: 28px;
}

.stat-num {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 3px;
}

/* Toolbar */
.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.category-select {
  width: 220px;
}

/* Tabla */
.table-wrap {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
}

.products-table th {
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

.products-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
  vertical-align: middle;
}

.products-table tr:last-child td {
  border-bottom: none;
}

.products-table tr:hover td {
  background: rgba(99, 179, 237, 0.02);
}

/* Imagen en tabla */
.table-img {
  width: 52px;
  height: 52px;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
}

.table-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}

.product-name {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 2px;
}

.product-brand {
  font-size: 12px;
  color: var(--color-text-muted);
}

.price-cell {
  font-weight: 600;
  color: var(--color-accent);
  font-family: var(--font-mono);
}

/* Stock badges */
.stock-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.stock-badge.ok {
  background: rgba(104, 211, 145, 0.1);
  color: var(--color-success);
}

.stock-badge.low {
  background: rgba(246, 137, 42, 0.1);
  color: var(--color-accent);
}

.stock-badge.out {
  background: rgba(252, 129, 129, 0.1);
  color: var(--color-danger);
}

.text-muted {
  color: var(--color-text-muted);
}

/* Acciones */
.action-btns {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 34px;
  height: 34px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
  border: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
}

.action-btn.edit:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-dim);
}

.action-btn.delete:hover {
  border-color: var(--color-danger);
  background: rgba(252, 129, 129, 0.1);
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
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .products-table th:nth-child(3),
  .products-table td:nth-child(3),
  .products-table th:nth-child(6),
  .products-table td:nth-child(6) {
    display: none;
  }
}
</style>