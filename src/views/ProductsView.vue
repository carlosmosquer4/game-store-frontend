<template>
  <div class="products-view">

    <!-- Header de la página -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">Catálogo de Productos</h1>
        <p class="page-sub">{{ total }} productos disponibles</p>
      </div>
    </div>

    <div class="container page-layout">

      <!-- ===== SIDEBAR FILTROS ===== -->
      <aside class="sidebar" :class="{ open: sidebarOpen }">

        <div class="sidebar-head">
          <h3 class="sidebar-title">Filtros</h3>
          <button class="sidebar-close" @click="sidebarOpen = false">✕</button>
        </div>

        <!-- Búsqueda -->
        <div class="filter-group">
          <label class="filter-label">Buscar</label>
          <input
            v-model="filters.search"
            @input="debouncedFetch"
            placeholder="Nombre del producto..."
            class="input"
          />
        </div>

        <!-- Categorías -->
        <div class="filter-group">
          <label class="filter-label">Categoría</label>
          <div class="filter-options">
            <button
              class="filter-option"
              :class="{ active: !filters.categoryId }"
              @click="setCategory(null)"
            >
              Todas
            </button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              class="filter-option"
              :class="{ active: filters.categoryId === cat.id }"
              @click="setCategory(cat.id)"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>

        <!-- Precio -->
        <div class="filter-group">
          <label class="filter-label">Rango de precio</label>
          <div class="price-range">
            <div class="price-field">
              <span class="price-prefix">$</span>
              <input
                v-model.number="filters.minPrice"
                type="number"
                placeholder="Mínimo"
                class="input price-input"
                min="0"
              />
            </div>
            <div class="price-separator">—</div>
            <div class="price-field">
              <span class="price-prefix">$</span>
              <input
                v-model.number="filters.maxPrice"
                type="number"
                placeholder="Máximo"
                class="input price-input"
                min="0"
              />
            </div>
          </div>
          <button
            class="btn btn-primary btn-sm"
            @click="fetchProducts()"
            style="width: 100%; margin-top: 4px;"
          >
            Aplicar precio
          </button>
        </div>

        <!-- Solo destacados -->
        <div class="filter-group">
          <label class="filter-label">Destacados</label>
          <label class="toggle-wrap">
            <input
              type="checkbox"
              v-model="filters.featured"
              @change="fetchProducts()"
              class="toggle-input"
            />
            <span class="toggle-track"></span>
            <span class="toggle-text">Solo destacados</span>
          </label>
        </div>

        <!-- Ordenar -->
        <div class="filter-group">
          <label class="filter-label">Ordenar por</label>
          <select
            v-model="filters.sort"
            @change="fetchProducts()"
            class="input"
          >
            <option value="">Más recientes</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
          </select>
        </div>

        <button
          class="btn btn-outline"
          style="width: 100%"
          @click="clearFilters"
        >
          Limpiar filtros
        </button>

      </aside>

      <!-- ===== CONTENIDO PRINCIPAL ===== -->
      <main class="products-main">

        <!-- Toolbar -->
        <div class="toolbar">
          <button
            class="btn btn-outline btn-sm filter-toggle"
            @click="sidebarOpen = !sidebarOpen"
          >
            ☰ Filtros
          </button>

          <span class="results-text" v-if="!loading">
            {{ total }} resultados
          </span>
        </div>

        <!-- Loading -->
        <div class="loading-state" v-if="loading">
          <div class="spinner"></div>
          <span>Cargando productos...</span>
        </div>

        <!-- Sin resultados -->
        <div class="empty-state" v-else-if="products.length === 0">
          <div class="empty-icon">🔍</div>
          <h3>Sin resultados</h3>
          <p>Intenta con otros filtros</p>
          <button class="btn btn-outline" @click="clearFilters">
            Limpiar filtros
          </button>
        </div>

        <!-- Grid de productos -->
        <div class="products-grid" v-else>
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>

        <!-- Paginación -->
        <div class="pagination" v-if="totalPages > 1">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            ←
          </button>

          <button
            v-for="page in totalPages"
            :key="page"
            class="page-btn"
            :class="{ active: page === currentPage }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>

          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            →
          </button>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { productsApi, categoriesApi } from '../services/api'
import ProductCard from '../components/ProductCard.vue'

const route = useRoute()

// ─── ESTADO ──────────────────────────────────────────────
const products = ref([])
const categories = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const perPage = 12
const sidebarOpen = ref(false)

const filters = reactive({
  search: '',
  categoryId: null,
  minPrice: null,
  maxPrice: null,
  featured: false,
  sort: ''
})

// ─── COMPUTED ────────────────────────────────────────────
const totalPages = computed(() => Math.ceil(total.value / perPage))

// ─── FUNCIONES ───────────────────────────────────────────
async function fetchProducts(page = 1) {
  loading.value = true
  currentPage.value = page

  try {
    // Construir parámetros solo con valores que existen
    const params = {
      page,
      limit: perPage,
    }

    if (filters.search)     params.search = filters.search
    if (filters.categoryId) params.categoryId = filters.categoryId
    if (filters.minPrice)   params.minPrice = filters.minPrice
    if (filters.maxPrice)   params.maxPrice = filters.maxPrice
    if (filters.featured)   params.featured = true
    if (filters.sort)       params.sort = filters.sort

    const res = await productsApi.getAll(params)
    products.value = res.data.data
    total.value = res.data.pagination.total

  } catch (err) {
    console.error('Error cargando productos:', err)
  } finally {
    loading.value = false
  }
}

function setCategory(id) {
  filters.categoryId = id
  fetchProducts()
}

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  fetchProducts(page)
  // Scroll al inicio
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function clearFilters() {
  filters.search = ''
  filters.categoryId = null
  filters.minPrice = null
  filters.maxPrice = null
  filters.featured = false
  filters.sort = ''
  fetchProducts()
}

// Debounce para la búsqueda — espera 400ms antes de buscar
let searchTimer = null
function debouncedFetch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchProducts()
  }, 400)
}

// ─── LIFECYCLE ───────────────────────────────────────────
onMounted(async () => {
  // Leer parámetros de la URL
  if (route.query.search)     filters.search = route.query.search
  if (route.query.categoryId) filters.categoryId = Number(route.query.categoryId)
  if (route.query.featured)   filters.featured = true

  // Cargar categorías y productos al mismo tiempo
  const [_, catRes] = await Promise.all([
    fetchProducts(),
    categoriesApi.getAll()
  ])
  categories.value = catRes.data.data.categories
})

// Observar cambios en la URL
watch(() => route.query, (query) => {
  if (query.search)     filters.search = query.search
  if (query.categoryId) filters.categoryId = Number(query.categoryId)
  if (query.featured)   filters.featured = true
  fetchProducts()
})
</script>

<style scoped>
.products-view {
  min-height: 100vh;
}

/* Header */
.page-header {
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  padding: 32px 0;
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

/* Layout */
.page-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 28px;
  padding-top: 28px;
  padding-bottom: 60px;
  align-items: start;
}

/* Sidebar */
.sidebar {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 90px;
}

.sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
}

.sidebar-close {
  display: none;
  font-size: 16px;
  color: var(--color-text-muted);
}

/* Grupos de filtros */
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
}

.filter-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.filter-option {
  padding: 7px 10px;
  border-radius: var(--radius);
  font-size: 13px;
  color: var(--color-text-light);
  text-align: left;
  transition: all 0.2s;
}

.filter-option:hover {
  background: var(--color-bg-elevated);
  color: var(--color-text);
}

.filter-option.active {
  background: var(--color-primary-dim);
  color: var(--color-primary);
  font-weight: 600;
}

/* Rango de precio */
.price-range {
  display: flex;
  align-items: center;
  gap: 6px;
}

.price-field {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.price-prefix {
  position: absolute;
  left: 10px;
  font-size: 13px;
  color: var(--color-text-muted);
  pointer-events: none;
  z-index: 1;
}

.price-input {
  width: 100%;
  padding: 10px 8px 10px 22px !important;
  font-size: 13px;
}

.price-separator {
  color: var(--color-text-muted);
  flex-shrink: 0;
  font-size: 14px;
}

/* Toggle checkbox */
.toggle-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.toggle-input {
  display: none;
}

.toggle-track {
  width: 38px;
  height: 20px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  position: relative;
  transition: all 0.3s;
  flex-shrink: 0;
}

.toggle-track::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 12px;
  height: 12px;
  background: var(--color-text-muted);
  border-radius: 50%;
  transition: all 0.3s;
}

.toggle-input:checked + .toggle-track {
  background: var(--color-primary-dim);
  border-color: var(--color-primary);
}

.toggle-input:checked + .toggle-track::after {
  background: var(--color-primary);
  transform: translateX(18px);
}

.toggle-text {
  font-size: 13px;
  color: var(--color-text-light);
}

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.filter-toggle {
  display: none;
}

.results-text {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-left: auto;
}

.btn-sm {
  padding: 7px 14px;
  font-size: 13px;
}

/* Paginación */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 40px;
}

.page-btn {
  width: 38px;
  height: 38px;
  border-radius: var(--radius);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  font-size: 14px;
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

/* Responsive */
@media (max-width: 900px) {
  .page-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: -280px;
    width: 280px;
    height: 100vh;
    z-index: 200;
    border-radius: 0;
    overflow-y: auto;
    transition: left 0.3s ease;
    box-shadow: var(--shadow-lg);
  }

  .sidebar.open {
    left: 0;
  }

  .sidebar-close {
    display: block;
  }

  .filter-toggle {
    display: flex;
  }
}
</style>