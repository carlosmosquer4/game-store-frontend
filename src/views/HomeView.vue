<template>
  <div class="home">

    <!-- ===== HERO ===== -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">

          <p class="hero-tag" ref="heroTag">
            🎮 Tienda Gamer · Neiva, Huila
          </p>

          <h1 class="hero-title" ref="heroTitle">
            Tu Setup Gamer<br>
            <span class="hero-title-accent">Empieza Aquí</span>
          </h1>

          <p class="hero-desc" ref="heroDesc">
            Ratones, teclados, monitores, auriculares y laptops gaming.
            Envíos a toda Colombia desde Neiva.
          </p>

          <div class="hero-btns" ref="heroBtns">
            <router-link to="/productos" class="btn btn-primary">
              Ver Catálogo
            </router-link>
            <router-link to="/productos?featured=true" class="btn btn-outline">
              ⭐ Destacados
            </router-link>
          </div>

          <!-- Stats rápidas -->
          <div class="hero-stats" ref="heroStats">
            <div class="stat">
              <span class="stat-num">30+</span>
              <span class="stat-label">Productos</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-num">7</span>
              <span class="stat-label">Categorías</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-num">24h</span>
              <span class="stat-label">Soporte</span>
            </div>
          </div>

        </div>
      </div>

      <!-- Fondo decorativo -->
      <div class="hero-bg">
        <div class="hero-circle hero-circle-1"></div>
        <div class="hero-circle hero-circle-2"></div>
      </div>
    </section>

<!-- ===== CATEGORÍAS ===== -->
<section class="section" ref="categoriesSection">
  <div class="container">
    <h2 class="section-title">Explorar por Categoría</h2>

    <div class="categories-grid" v-if="loadingCategories">
      <div
        v-for="i in 7"
        :key="i"
        class="skeleton"
        style="height: 100px; border-radius: 12px;"
      ></div>
    </div>

    <div class="categories-grid" v-else>
      <router-link
        v-for="cat in categories"
        :key="cat.id"
        :to="`/productos?categoryId=${cat.id}`"
        class="category-card"
      >
        <span class="cat-emoji">{{ getCatEmoji(cat.name) }}</span>
        <span>{{ cat.name }}</span>
      </router-link>
    </div>
  </div>
</section>

    <!-- ===== PRODUCTOS DESTACADOS ===== -->
    <section class="section section-dark" ref="featuredSection">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Productos Destacados</h2>
          <router-link to="/productos?featured=true" class="section-link">
            Ver todos →
          </router-link>
        </div>

        <div class="loading-state" v-if="loadingProducts">
          <div class="spinner"></div>
          <span>Cargando productos...</span>
        </div>

        <div class="products-grid" v-else>
          <ProductCard
            v-for="product in featuredProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <!-- ===== POR QUÉ ELEGIRNOS ===== -->
    <section class="section" ref="featuresSection">
      <div class="container">
        <h2 class="section-title text-center">¿Por qué Game Store Neiva?</h2>

        <div class="features-grid">
          <div
            class="feature-card"
            v-for="feature in features"
            :key="feature.title"
          >
            <span class="feature-icon">{{ feature.icon }}</span>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { productsApi, categoriesApi } from '../services/api'
import ProductCard from '../components/ProductCard.vue'

// Registrar el plugin ScrollTrigger en GSAP
gsap.registerPlugin(ScrollTrigger)

// ─── REFS DEL DOM (para GSAP) ────────────────────────────
const heroTag = ref(null)
const heroTitle = ref(null)
const heroDesc = ref(null)
const heroBtns = ref(null)
const heroStats = ref(null)
const categoriesSection = ref(null)
const featuredSection = ref(null)
const featuresSection = ref(null)

// ─── DATOS ───────────────────────────────────────────────
const categories = ref([])
const featuredProducts = ref([])
const loadingCategories = ref(true)
const loadingProducts = ref(true)

const features = [
  {
    icon: '🚚',
    title: 'Envíos Rápidos',
    desc: 'Despachamos en 24h a toda Colombia con seguimiento en tiempo real.'
  },
  {
    icon: '✅',
    title: 'Garantía Real',
    desc: 'Todos nuestros productos tienen garantía de fábrica. Sin letra chiquita.'
  },
  {
    icon: '💳',
    title: 'Pago Seguro',
    desc: 'Tarjeta, PSE, PayPal o contraentrega. Tú eliges cómo pagar.'
  },
  {
    icon: '🔄',
    title: 'Devoluciones',
    desc: '30 días para devolver si el producto no cumple tus expectativas.'
  },
]

// ─── CARGAR DATOS ────────────────────────────────────────
async function loadData() {
  try {
    // Cargar categorías y productos al mismo tiempo
    const [catRes, prodRes] = await Promise.all([
      categoriesApi.getAll(),
      productsApi.getAll({ featured: true, limit: 8 })
    ])

    categories.value = catRes.data.data.categories
    featuredProducts.value = prodRes.data.data

  } catch (err) {
    console.error('Error cargando datos del home:', err)
  } finally {
    loadingCategories.value = false
    loadingProducts.value = false
  }
}

// ─── ANIMACIONES GSAP ────────────────────────────────────
function initAnimations() {
  const heroTl = gsap.timeline()

  heroTl
    .from(heroTag.value, {
      opacity: 0, y: 20, duration: 0.6, ease: 'power2.out'
    })
    .from(heroTitle.value, {
      opacity: 0, y: 40, duration: 0.7, ease: 'power2.out'
    }, '-=0.3')
    .from(heroDesc.value, {
      opacity: 0, y: 20, duration: 0.6, ease: 'power2.out'
    }, '-=0.3')
    .from(heroBtns.value, {
      opacity: 0, y: 20, duration: 0.5, ease: 'power2.out'
    }, '-=0.2')
    .from(heroStats.value, {
      opacity: 0, y: 20, duration: 0.5, ease: 'power2.out'
    }, '-=0.2')

  // Verificar que existan elementos antes de animar
  const categoryCards = document.querySelectorAll('.category-card')
  if (categoryCards.length > 0) {
    gsap.from('.category-card', {
      opacity: 0, y: 30, duration: 0.5, stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: categoriesSection.value,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to('.category-card', {
            opacity: 1, y: 0, duration: 0.5,
            stagger: 0.08, ease: 'power2.out'
          })
        }
      }
    })
  }

  const productCards = document.querySelectorAll('.products-grid .product-card')
  if (productCards.length > 0) {
    gsap.from('.products-grid .product-card', {
      opacity: 0, y: 40, duration: 0.5, stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: featuredSection.value,
        start: 'top 75%',
        once: true
      }
    })
  }

  const featureCards = document.querySelectorAll('.feature-card')
  if (featureCards.length > 0) {
    gsap.from('.feature-card', {
      opacity: 0, y: 30, duration: 0.5, stagger: 0.12,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: featuresSection.value,
        start: 'top 80%',
        once: true
      }
    })
  }
}

function getCategoryImage(categoryName) {
  const name = (categoryName || '').toLowerCase()
  if (name.includes('raton') || name.includes('mouse')) {
    return 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&q=80'
  }
  if (name.includes('teclado')) {
    return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80'
  }
  if (name.includes('auricular')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'
  }
  if (name.includes('monitor')) {
    return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80'
  }
  if (name.includes('celular')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80'
  }
  if (name.includes('mousepad')) {
    return 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=400&q=80'
  }
  if (name.includes('laptop')) {
    return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80'
  }
  return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80'
}

function onCatImgError(e) {
  e.target.onerror = null
  e.target.src = getCategoryImage('')
}

function getCatEmoji(name) {
  const n = name.toLowerCase()
  if (n.includes('raton') || n.includes('ratón') || n.includes('mouse')) return '🖱️'
  if (n.includes('teclado')) return '⌨️'
  if (n.includes('auricular') || n.includes('headset')) return '🎧'
  if (n.includes('monitor') || n.includes('pantalla')) return '🖥️'
  if (n.includes('mousepad') || n.includes('alfombra')) return '🟦'
  if (n.includes('celular') || n.includes('movil')) return '📱'
  if (n.includes('laptop') || n.includes('portatil')) return '💻'
  if (n.includes('accesorio')) return '🎮'
  return '🕹️'
}

// ─── LIFECYCLE ───────────────────────────────────────────
onMounted(async () => {
  // Primero carga los datos
  await loadData()
  // Después inicializa las animaciones
  // (necesitamos que los elementos existan en el DOM)
  initAnimations()
})
</script>

<style scoped>
/* HERO */
.hero {
  min-height: 90vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 80px 0 60px;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 620px;
}

.hero-tag {
  display: inline-block;
  padding: 6px 14px;
  background: var(--color-primary-dim);
  color: var(--color-primary);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 24px;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(36px, 6vw, 64px);
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: 20px;
  color: var(--color-text);
}

.hero-title-accent {
  color: var(--color-primary);
}

.hero-desc {
  font-size: 17px;
  color: var(--color-text-light);
  line-height: 1.7;
  margin-bottom: 32px;
  max-width: 480px;
}

.hero-btns {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 48px;
}

/* Stats */
.hero-stats {
  display: flex;
  align-items: center;
  gap: 24px;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: var(--color-border);
}

/* Fondo decorativo del hero */
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.hero-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}

.hero-circle-1 {
  width: 500px;
  height: 500px;
  background: rgba(99, 179, 237, 0.08);
  top: -100px;
  right: -100px;
}

.hero-circle-2 {
  width: 300px;
  height: 300px;
  background: rgba(246, 137, 42, 0.06);
  bottom: 0;
  left: 30%;
}

/* SECTIONS */
.section {
  padding: 80px 0;
}

.section-dark {
  background: var(--color-bg-card);
}

.section-title {
  font-family: var(--font-display);
  font-size: clamp(22px, 4vw, 32px);
  font-weight: 700;
  margin-bottom: 36px;
}

.text-center {
  text-align: center;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.section-header .section-title {
  margin-bottom: 0;
}

.section-link {
  font-size: 14px;
  color: var(--color-primary);
  font-weight: 500;
  transition: opacity 0.2s;
}

.section-link:hover {
  opacity: 0.7;
}

/* CATEGORÍAS */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 14px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 12px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all 0.25s ease;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-light);
}

.category-card:hover {
  border-color: var(--color-border-hover);
  color: var(--color-primary);
  transform: translateY(-4px);
}

.cat-emoji {
  font-size: 36px;
  line-height: 1;
}

/* SKELETON */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-card) 25%,
    var(--color-bg-elevated) 50%,
    var(--color-bg-card) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* FEATURES */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.feature-card {
  padding: 28px 24px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: border-color 0.25s, transform 0.25s;
}

.feature-card:hover {
  border-color: var(--color-border-hover);
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 14px;
}

.feature-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.feature-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero {
    min-height: auto;
    padding: 60px 0 40px;
  }

  .hero-stats {
    gap: 16px;
  }

  .section {
    padding: 50px 0;
  }

  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>