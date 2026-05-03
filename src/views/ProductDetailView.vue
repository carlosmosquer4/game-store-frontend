<template>
  <div class="detail-view" v-if="product">

    <!-- Breadcrumb -->
    <div class="breadcrumb-bar">
      <div class="container">
        <nav class="breadcrumb">
          <router-link to="/">Inicio</router-link>
          <span>/</span>
          <router-link to="/productos">Catálogo</router-link>
          <span>/</span>
          <span class="breadcrumb-current">{{ product.name }}</span>
        </nav>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="container detail-layout">

      <!-- ===== GALERÍA ===== -->
      <div class="gallery" ref="galleryRef">

        <!-- Imagen principal -->
        <div class="gallery-main">
          <img
            :src="activeImage"
            :alt="product.name"
            @error="onImgError"
          />
          <!-- Badges -->
          <div class="gallery-badges">
            <span v-if="product.featured" class="badge badge-primary">
              ⭐ Destacado
            </span>
            <span v-if="product.discountPercentage" class="badge badge-accent">
              -{{ product.discountPercentage }}%
            </span>
          </div>
        </div>

        <!-- Miniaturas -->
        <div class="gallery-thumbs" v-if="allImages.length > 1">
          <div
            v-for="(img, i) in allImages"
            :key="i"
            class="thumb"
            :class="{ active: activeImage === img }"
            @click="activeImage = img"
          >
            <img
              :src="img"
              :alt="`Vista ${i + 1}`"
              @error="onImgError"
            />
          </div>
        </div>

      </div>

      <!-- ===== INFO DEL PRODUCTO ===== -->
      <div class="product-info" ref="infoRef">

        <!-- Categoría y marca -->
        <div class="info-meta">
          <span class="info-category">{{ product.category?.name }}</span>
          <span class="info-brand" v-if="product.brand">{{ product.brand }}</span>
        </div>

        <!-- Nombre -->
        <h1 class="product-name">{{ product.name }}</h1>

        <!-- Calificación -->
        <div class="rating-row" v-if="reviews.total > 0">
          <div class="stars">
            <span
              v-for="i in 5"
              :key="i"
              class="star"
              :class="{ filled: i <= Math.round(reviews.average) }"
            >★</span>
          </div>
          <span class="rating-text">
            {{ reviews.average }} ({{ reviews.total }} reseñas)
          </span>
        </div>

        <!-- Precio -->
        <div class="price-block">
          <span class="price-main">{{ formatPrice(product.price) }}</span>
          <div class="price-old-wrap" v-if="product.originalPrice">
            <span class="price-old">{{ formatPrice(product.originalPrice) }}</span>
            <span class="badge badge-accent">-{{ product.discountPercentage }}%</span>
          </div>
        </div>

        <!-- Stock -->
        <div class="stock-row" :class="stockClass">
          <span class="stock-dot"></span>
          <span>{{ stockText }}</span>
        </div>

        <!-- Cantidad y agregar al carrito -->
        <div class="purchase-row">
          <div class="qty-control">
            <button @click="qty = Math.max(1, qty - 1)">−</button>
            <span>{{ qty }}</span>
            <button @click="qty = Math.min(product.stock, qty + 1)">+</button>
          </div>

          <button
            class="btn btn-primary add-btn"
            @click="handleAddToCart"
            :disabled="adding || product.stock === 0"
          >
            {{ adding ? 'Agregando...' : product.stock === 0 ? 'Sin stock' : '🛒 Agregar al carrito' }}
          </button>
        </div>

        <!-- Descripción -->
        <div class="description-block">
          <h3 class="block-title">Descripción</h3>
          <p class="description-text" :class="{ truncated: !descExpanded }">
            {{ product.description }}
          </p>
          <button
            v-if="product.description?.length > 200"
            class="expand-btn"
            @click="descExpanded = !descExpanded"
          >
            {{ descExpanded ? 'Ver menos ↑' : 'Ver más ↓' }}
          </button>
        </div>

        <!-- Especificaciones -->
        <div class="specs-block" v-if="product.specifications">
          <button class="specs-toggle" @click="specsOpen = !specsOpen">
            <span>Especificaciones técnicas</span>
            <span>{{ specsOpen ? '▲' : '▼' }}</span>
          </button>
          <div class="specs-content" v-if="specsOpen">
            <div
              v-for="(value, key) in product.specifications"
              :key="key"
              class="spec-row"
            >
              <span class="spec-key">{{ key }}</span>
              <span class="spec-value">{{ value }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ===== RESEÑAS ===== -->
    <section class="reviews-section">
      <div class="container">
        <h2 class="section-title">Reseñas del producto</h2>

        <!-- Formulario de reseña -->
        <div class="review-form" v-if="auth.isAuthenticated">
          <h4 class="review-form-title">Deja tu opinión</h4>
          <div class="star-picker">
            <span
              v-for="i in 5"
              :key="i"
              class="star-pick"
              :class="{ active: i <= newReview.rating }"
              @click="newReview.rating = i"
            >★</span>
          </div>
          <textarea
            v-model="newReview.comment"
            placeholder="Cuéntanos tu experiencia..."
            class="input review-textarea"
            rows="3"
          ></textarea>
          <button
            class="btn btn-primary"
            @click="submitReview"
            :disabled="submitting || !newReview.rating"
          >
            {{ submitting ? 'Enviando...' : 'Publicar reseña' }}
          </button>
        </div>

        <div class="login-prompt" v-else>
          <router-link to="/login" class="btn btn-outline">
            Inicia sesión para dejar una reseña
          </router-link>
        </div>

        <!-- Lista de reseñas -->
        <div class="reviews-list" v-if="reviews.reviews?.length">
          <div
            v-for="review in reviews.reviews"
            :key="review.id"
            class="review-card"
          >
            <div class="review-header">
              <div class="review-avatar">
                {{ review.user?.name?.charAt(0)?.toUpperCase() }}
              </div>
              <div class="review-meta">
                <span class="review-name">{{ review.user?.name }}</span>
                <div class="stars small">
                  <span
                    v-for="i in 5"
                    :key="i"
                    class="star"
                    :class="{ filled: i <= review.rating }"
                  >★</span>
                </div>
              </div>
              <span class="review-date">{{ formatDate(review.createdAt) }}</span>
            </div>
            <p class="review-comment" v-if="review.comment">
              {{ review.comment }}
            </p>
          </div>
        </div>

        <p class="no-reviews" v-else>
          Aún no hay reseñas. ¡Sé el primero en opinar!
        </p>

      </div>
    </section>

    <!-- ===== PRODUCTOS SIMILARES ===== -->
    <section class="similar-section" v-if="similarProducts.length">
      <div class="container">
        <h2 class="section-title">También te puede gustar</h2>
        <div class="products-grid">
          <ProductCard
            v-for="p in similarProducts.slice(0, 4)"
            :key="p.id"
            :product="p"
          />
        </div>
      </div>
    </section>

  </div>

  <!-- Loading -->
  <div class="loading-state" v-else-if="loading">
    <div class="spinner"></div>
    <span>Cargando producto...</span>
  </div>

  <!-- No encontrado -->
  <div class="empty-state" v-else>
    <div class="empty-icon">😕</div>
    <h3>Producto no encontrado</h3>
    <router-link to="/productos" class="btn btn-primary">
      Ver catálogo
    </router-link>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import { useRoute } from 'vue-router'
import { gsap } from 'gsap'
import { productsApi, reviewsApi, wishlistApi } from '../services/api'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import ProductCard from '../components/ProductCard.vue'

const route = useRoute()
const cart = useCartStore()
const auth = useAuthStore()
const showToast = inject('showToast', null)

// ─── REFS DEL DOM ────────────────────────────────────────
const galleryRef = ref(null)
const infoRef = ref(null)

// ─── ESTADO ──────────────────────────────────────────────
const product = ref(null)
const loading = ref(true)
const activeImage = ref('')
const qty = ref(1)
const adding = ref(false)
const specsOpen = ref(true)
const descExpanded = ref(false)
const reviews = ref({ reviews: [], average: 0, total: 0 })
const similarProducts = ref([])
const submitting = ref(false)
const newReview = ref({ rating: 0, comment: '' })

// ─── COMPUTED ────────────────────────────────────────────
const allImages = computed(() => {
  if (!product.value) return []
  const imgs = product.value.images?.map(i => i.imageUrl) || []
  if (product.value.imageUrl && !imgs.includes(product.value.imageUrl)) {
    imgs.unshift(product.value.imageUrl)
  }
  return imgs.length ? imgs : [getCategoryImage(product.value?.category?.name)]
})

const stockClass = computed(() => {
  if (!product.value || product.value.stock === 0) return 'out-of-stock'
  if (product.value.stock <= 5) return 'low-stock'
  return 'in-stock'
})

const stockText = computed(() => {
  if (!product.value) return ''
  if (product.value.stock === 0) return 'Agotado'
  if (product.value.stock <= 5) return `Solo quedan ${product.value.stock} unidades`
  return `En stock — ${product.value.stock} disponibles`
})

// ─── FUNCIONES ───────────────────────────────────────────
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

function getCategoryImage(categoryName) {
  const name = (categoryName || '').toLowerCase()
  if (name.includes('raton') || name.includes('mouse')) {
    return 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&q=80'
  }
  if (name.includes('teclado')) {
    return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80'
  }
  if (name.includes('auricular')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'
  }
  if (name.includes('monitor')) {
    return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80'
  }
  if (name.includes('celular')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80'
  }
  if (name.includes('mousepad')) {
    return 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=600&q=80'
  }
  if (name.includes('laptop') || name.includes('portatil')) {
    return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80'
  }
  if (name.includes('accesorio')) {
    return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80'
  }
  return 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&q=80'
}

function onImgError(e) {
  e.target.onerror = null
  e.target.src = getCategoryImage(product.value?.category?.name)
}

async function loadProduct() {
  loading.value = true
  try {
    const id = route.params.id

    // Cargar producto, reseñas y similares al mismo tiempo
    const [prodRes, reviewsRes, similarRes] = await Promise.all([
      productsApi.getById(id),
      reviewsApi.getByProduct(id),
      productsApi.getSimilar(id)
    ])

    product.value = prodRes.data.data.product
    reviews.value = reviewsRes.data.data
    similarProducts.value = similarRes.data.data.products || []
    activeImage.value = allImages.value[0]

  } catch (err) {
    product.value = null
    console.error('Error cargando producto:', err)
  } finally {
    loading.value = false
  }
}

async function handleAddToCart() {
  if (!auth.isAuthenticated) {
    showToast && showToast('Inicia sesión para agregar al carrito')
    return
  }
  adding.value = true
  const result = await cart.addItem(product.value.id, qty.value)
  adding.value = false

  if (result.success) {
    showToast && showToast(`${product.value.name} agregado al carrito`)
  } else {
    alert(result.message)
  }
}

async function submitReview() {
  if (!newReview.value.rating) return
  submitting.value = true
  try {
    await reviewsApi.create(product.value.id, newReview.value)
    showToast && showToast('¡Reseña publicada!')
    newReview.value = { rating: 0, comment: '' }
    // Recargar reseñas
    const res = await reviewsApi.getByProduct(product.value.id)
    reviews.value = res.data.data
  } catch (err) {
    alert(err.response?.data?.message || 'Error al publicar reseña')
  } finally {
    submitting.value = false
  }
}

// ─── ANIMACIONES GSAP ────────────────────────────────────
function initAnimations() {
  // Galería entra desde la izquierda
  gsap.from(galleryRef.value, {
    opacity: 0,
    x: -40,
    duration: 0.7,
    ease: 'power2.out'
  })
  // Info entra desde la derecha
  gsap.from(infoRef.value, {
    opacity: 0,
    x: 40,
    duration: 0.7,
    ease: 'power2.out',
    delay: 0.1
  })
}

// ─── LIFECYCLE ───────────────────────────────────────────
onMounted(async () => {
  await loadProduct()
  if (product.value) {
    initAnimations()
  }
})

// Recargar si cambia el id en la URL
watch(() => route.params.id, async () => {
  qty.value = 1
  await loadProduct()
  if (product.value) {
    initAnimations()
  }
})
</script>

<style scoped>
.detail-view {
  min-height: 100vh;
  padding-bottom: 60px;
}

/* Breadcrumb */
.breadcrumb-bar {
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  padding: 12px 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.breadcrumb a:hover {
  color: var(--color-primary);
}

.breadcrumb-current {
  color: var(--color-text);
  font-weight: 500;
  /* Máximo 40 caracteres */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* Layout */
.detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  padding-top: 36px;
  padding-bottom: 48px;
}

/* Galería */
.gallery {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gallery-main {
  position: relative;
  aspect-ratio: 1;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.gallery-main img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 16px;
  transition: transform 0.4s ease;
}

.gallery-main:hover img {
  transform: scale(1.04);
}

.gallery-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Miniaturas */
.gallery-thumbs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.thumb {
  width: 68px;
  height: 68px;
  border-radius: var(--radius);
  overflow: hidden;
  border: 2px solid var(--color-border);
  cursor: pointer;
  flex-shrink: 0;
  background: var(--color-bg-card);
  transition: border-color 0.2s;
}

.thumb.active {
  border-color: var(--color-primary);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}

/* Info */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.info-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-category {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-brand {
  font-size: 12px;
  color: var(--color-text-muted);
}

.product-name {
  font-family: var(--font-display);
  font-size: clamp(20px, 3vw, 28px);
  font-weight: 700;
  line-height: 1.3;
}

/* Calificación */
.rating-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 16px;
  color: var(--color-bg-elevated);
}

.star.filled {
  color: var(--color-accent);
}

.stars.small .star {
  font-size: 13px;
}

.rating-text {
  font-size: 13px;
  color: var(--color-text-muted);
}

/* Precio */
.price-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.price-main {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: var(--color-accent);
}

.price-old-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-old {
  font-size: 14px;
  color: var(--color-text-muted);
  text-decoration: line-through;
}

/* Stock */
.stock-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
}

.stock-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.in-stock { color: var(--color-success); }
.in-stock .stock-dot { background: var(--color-success); }
.low-stock { color: var(--color-accent); }
.low-stock .stock-dot { background: var(--color-accent); }
.out-of-stock { color: var(--color-text-muted); }
.out-of-stock .stock-dot { background: var(--color-text-muted); }

/* Compra */
.purchase-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.qty-control {
  display: flex;
  align-items: center;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
}

.qty-control button {
  width: 36px;
  height: 40px;
  font-size: 18px;
  color: var(--color-text-light);
  transition: background 0.2s;
}

.qty-control button:hover {
  background: var(--color-bg-card);
  color: var(--color-primary);
}

.qty-control span {
  width: 44px;
  text-align: center;
  font-weight: 600;
  font-size: 15px;
}

.add-btn {
  flex: 1;
  min-width: 180px;
  padding: 12px;
}

/* Descripción */
.description-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.block-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.description-text {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.8;
}

.description-text.truncated {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.expand-btn {
  font-size: 13px;
  color: var(--color-primary);
  font-weight: 500;
  align-self: flex-start;
}

/* Specs */
.specs-block {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.specs-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 14px 16px;
  background: var(--color-bg-elevated);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
}

.specs-content {
  padding: 4px 0;
}

.spec-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-border);
  font-size: 13px;
}

.spec-row:last-child {
  border-bottom: none;
}

.spec-key {
  color: var(--color-text-muted);
}

.spec-value {
  color: var(--color-text);
  font-weight: 500;
  text-align: right;
}

/* Reseñas */
.reviews-section {
  padding: 48px 0;
  background: var(--color-bg-card);
  border-top: 1px solid var(--color-border);
}

.section-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 24px;
}

.review-form {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.review-form-title {
  font-size: 15px;
  font-weight: 600;
}

.star-picker {
  display: flex;
  gap: 6px;
}

.star-pick {
  font-size: 28px;
  color: var(--color-bg-elevated);
  cursor: pointer;
  transition: all 0.2s;
  filter: grayscale(1);
}

.star-pick.active,
.star-pick:hover {
  color: var(--color-accent);
  filter: grayscale(0);
  transform: scale(1.1);
}

.review-textarea {
  resize: vertical;
  min-height: 90px;
}

.login-prompt {
  margin-bottom: 28px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.review-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.review-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #0f0f13;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.review-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.review-name {
  font-size: 14px;
  font-weight: 600;
}

.review-date {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-left: auto;
}

.review-comment {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.7;
}

.no-reviews {
  font-size: 14px;
  color: var(--color-text-muted);
  text-align: center;
  padding: 24px 0;
}

/* Similares */
.similar-section {
  padding: 48px 0;
}

/* Responsive */
@media (max-width: 900px) {
  .detail-layout {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}
</style>