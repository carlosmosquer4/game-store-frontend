<template>
  <div class="product-card card">

    <!-- Imagen -->
    <router-link :to="`/productos/${product.id}`" class="card-image-link">
      <div class="card-image">
        <img
          :src="productImage"
          :alt="product.name"
          loading="lazy"
          @error="onImgError"
        />
        <!-- Badges encima de la imagen -->
        <div class="card-badges">
          <span v-if="product.featured" class="badge badge-primary">
            ⭐ Destacado
          </span>
          <span v-if="product.discountPercentage" class="badge badge-accent">
            -{{ product.discountPercentage }}%
          </span>
        </div>
      </div>
    </router-link>

    <!-- Contenido -->
    <div class="card-body">

      <!-- Categoría y marca -->
      <div class="card-meta">
        <span class="card-category">{{ product.category?.name }}</span>
        <span class="card-brand" v-if="product.brand">{{ product.brand }}</span>
      </div>

      <!-- Nombre del producto -->
      <router-link :to="`/productos/${product.id}`" class="card-name">
        {{ product.name }}
      </router-link>

      <!-- Precio -->
      <div class="card-price">
        <span class="price-current">{{ formatPrice(product.price) }}</span>
        <span class="price-old" v-if="product.originalPrice">
          {{ formatPrice(product.originalPrice) }}
        </span>
      </div>

      <!-- Indicador de stock -->
      <div class="card-stock" :class="stockClass">
        <span class="stock-dot"></span>
        <span class="stock-text">{{ stockText }}</span>
      </div>

      <!-- Botón agregar al carrito -->
      <button
        class="btn btn-primary add-btn"
        @click="handleAddToCart"
        :disabled="adding || product.stock === 0"
      >
        <span v-if="adding">Agregando...</span>
        <span v-else-if="product.stock === 0">Sin stock</span>
        <span v-else>🛒 Agregar</span>
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

// Props que recibe el componente
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

// Emits — eventos que puede lanzar hacia el padre
const emit = defineEmits(['added'])

const cart = useCartStore()
const auth = useAuthStore()
const router = useRouter()
const adding = ref(false)

// Obtener la imagen principal del producto
const productImage = computed(() => {
  if (props.product.images?.length > 0) {
    const url = props.product.images[0].imageUrl
    // Si la URL es de unsplash o cloudinary la usamos directo
    if (url.includes('unsplash') || url.includes('cloudinary')) {
      return url
    }
  }
  if (props.product.imageUrl) {
    const url = props.product.imageUrl
    if (url.includes('unsplash') || url.includes('cloudinary')) {
      return url
    }
  }
  // Fallback con imagen según categoría
  return getCategoryImage(props.product.category?.name)
})

function getCategoryImage(categoryName) {
  const name = (categoryName || '').toLowerCase()
  if (name.includes('raton') || name.includes('mouse')) {
    return 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&q=80'
  }
  if (name.includes('teclado')) {
    return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80'
  }
  if (name.includes('auricular') || name.includes('headset')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'
  }
  if (name.includes('monitor')) {
    return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80'
  }
  if (name.includes('celular')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80'
  }
  if (name.includes('mousepad') || name.includes('alfombra')) {
    return 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=400&q=80'
  }
  if (name.includes('laptop') || name.includes('portatil')) {
    return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80'
  }
  if (name.includes('accesorio')) {
    return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80'
  }
  return 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&q=80'
}

// Clase CSS según el stock
const stockClass = computed(() => {
  if (props.product.stock === 0) return 'out-of-stock'
  if (props.product.stock <= 5) return 'low-stock'
  return 'in-stock'
})

// Texto según el stock
const stockText = computed(() => {
  if (props.product.stock === 0) return 'Agotado'
  if (props.product.stock <= 5) return `Solo ${props.product.stock} disponibles`
  return 'En stock'
})

// Formatear precio en pesos colombianos
function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(price)
}

// Inyectar el toast desde App.vue
const showToast = inject('showToast', null)

async function handleAddToCart() {
  if (!auth.isAuthenticated) {
    router.push('/login')
    return
  }

  adding.value = true
  const result = await cart.addItem(props.product.id, 1)
  adding.value = false

  if (result.success) {
    emit('added', props.product.name)
    // Mostrar notificación
    if (showToast) {
      showToast(`${props.product.name} agregado al carrito`)
    }
  } else {
    alert(result.message)
  }
}

function onImgError(e) {
  e.target.onerror = null
  const category = props.product.category?.name || ''
  e.target.src = getCategoryImage(category)
}

</script>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Imagen */
.card-image-link {
  display: block;
}

.card-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--color-bg-elevated);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-card:hover .card-image img {
  transform: scale(1.05);
}

.card-badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* Contenido */
.card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-category {
  font-size: 11px;
  color: var(--color-primary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-brand {
  font-size: 11px;
  color: var(--color-text-muted);
}

.card-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.4;
  /* Máximo 2 líneas */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s;
}

.card-name:hover {
  color: var(--color-primary);
}

/* Precio */
.card-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 4px;
}

.price-current {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-accent);
}

.price-old {
  font-size: 12px;
  color: var(--color-text-muted);
  text-decoration: line-through;
}

/* Stock */
.card-stock {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.stock-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.in-stock .stock-dot { background: var(--color-success); }
.in-stock .stock-text { color: var(--color-success); }

.low-stock .stock-dot { background: var(--color-accent); }
.low-stock .stock-text { color: var(--color-accent); }

.out-of-stock .stock-dot { background: var(--color-text-muted); }
.out-of-stock .stock-text { color: var(--color-text-muted); }

/* Botón */
.add-btn {
  width: 100%;
  margin-top: auto;
  padding: 9px;
  font-size: 13px;
}
</style>