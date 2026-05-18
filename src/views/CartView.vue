<template>
  <div class="cart-view">
    <div class="container">

      <div class="page-header">
        <h1 class="page-title">Mi Carrito</h1>
      </div>

      <!-- Loading -->
      <div class="loading-state" v-if="cart.loading">
        <div class="spinner"></div>
      </div>

      <!-- Carrito vacío -->
      <div class="empty-state" v-else-if="cart.items.length === 0">
        <div class="empty-icon">🛒</div>
        <h3>Tu carrito está vacío</h3>
        <p>Agrega productos desde el catálogo</p>
        <router-link to="/productos" class="btn btn-primary">
          Ver Catálogo
        </router-link>
      </div>

      <!-- Contenido del carrito -->
      <div class="cart-layout" v-else>

        <!-- Lista de items -->
        <div class="cart-items">

          <!-- Cabecera -->
          <div class="items-header">
            <span>Producto</span>
            <span>Precio</span>
            <span>Cantidad</span>
            <span>Subtotal</span>
            <span></span>
          </div>

          <!-- Items -->
          <TransitionGroup name="item" tag="div">
            <div
              v-for="item in cart.items"
              :key="item.id"
              class="cart-item"
            >
              <!-- Imagen y nombre -->
              <div class="item-product">
                <div class="item-img">
                  <img
                    :src="getProductImage(item.product)"
                    :alt="item.product.name"
                    @error="e => { e.target.onerror = null; e.target.src = getCategoryImage(item.product.category?.name) }"
                  />
                </div>
                <div class="item-info">
                  <router-link
                    :to="`/productos/${item.product.id}`"
                    class="item-name"
                  >
                    {{ item.product.name }}
                  </router-link>
                  <span
                    class="item-stock"
                    :class="item.product.stock > 0 ? 'in-stock' : 'out-of-stock'"
                  >
                    {{ item.product.stock > 0 ? 'Disponible' : 'Agotado' }}
                  </span>
                </div>
              </div>

              <!-- Precio unitario -->
              <div class="item-price">
                {{ formatPrice(item.product.price) }}
              </div>

              <!-- Control de cantidad -->
              <div class="item-qty">
                <button
                  @click="updateQty(item, item.quantity - 1)"
                  :disabled="item.quantity <= 1"
                >−</button>
                <span>{{ item.quantity }}</span>
                <button
                  @click="updateQty(item, item.quantity + 1)"
                  :disabled="item.quantity >= item.product.stock"
                >+</button>
              </div>

              <!-- Subtotal -->
              <div class="item-subtotal">
                {{ formatPrice(item.product.price * item.quantity) }}
              </div>

              <!-- Eliminar -->
              <button
                class="item-remove"
                @click="removeItem(item.id)"
                title="Eliminar"
              >
                🗑
              </button>

            </div>
          </TransitionGroup>

          <!-- Acciones del carrito -->
          <div class="cart-actions">
            <router-link to="/productos" class="btn btn-outline btn-sm">
              ← Seguir comprando
            </router-link>
            <button
              class="btn btn-outline btn-sm danger"
              @click="showClearModal = true"
            >
              Vaciar carrito
            </button>
          </div>

        </div>

        <!-- Resumen del pedido -->
        <div class="order-summary">
          <h3 class="summary-title">Resumen del pedido</h3>

          <div class="summary-rows">
            <div class="summary-row">
              <span>Productos ({{ cart.itemCount }})</span>
              <span>{{ formatPrice(cart.total) }}</span>
            </div>
            <div class="summary-row">
              <span>Envío</span>
              <span class="free-shipping">Gratis</span>
            </div>
          </div>

          <div class="summary-total">
            <span>Total</span>
            <span>{{ formatPrice(cart.total) }}</span>
          </div>

          <router-link to="/checkout" class="btn btn-primary checkout-btn">
            Proceder al pago →
          </router-link>

          <!-- Métodos de pago -->
          <div class="payment-info">
            <p class="payment-label">Aceptamos:</p>
            <div class="payment-badges">
              <span>💳 Tarjeta</span>
              <span>🏦 PSE</span>
              <span>📦 Contraentrega</span>
              <span>🅿️ PayPal</span>
            </div>
          </div>

        </div>
      </div>

    </div>

    <!-- Modal confirmación vaciar carrito -->
    <Transition name="modal">
      <div class="modal-backdrop" v-if="showClearModal" @click.self="showClearModal = false">
        <div class="modal-box">
          <div class="modal-icon">🗑️</div>
          <h3 class="modal-title">¿Vaciar el carrito?</h3>
          <p class="modal-desc">Se eliminarán todos los productos. Esta acción no se puede deshacer.</p>
          <div class="modal-actions">
            <button class="btn btn-outline" @click="showClearModal = false">Cancelar</button>
            <button class="btn btn-danger" @click="confirmClear">Sí, vaciar</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCartStore } from '../stores/cart'

const cart = useCartStore()
const showClearModal = ref(false)

function getCategoryImage(categoryName) {
  const name = (categoryName || '').toLowerCase()
  if (name.includes('raton') || name.includes('mouse')) {
    return 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=200&q=80'
  }
  if (name.includes('teclado')) {
    return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&q=80'
  }
  if (name.includes('auricular')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80'
  }
  if (name.includes('monitor')) {
    return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&q=80'
  }
  if (name.includes('celular')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80'
  }
  if (name.includes('mousepad')) {
    return 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=200&q=80'
  }
  if (name.includes('laptop') || name.includes('portatil')) {
    return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&q=80'
  }
  if (name.includes('accesorio')) {
    return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&q=80'
  }
  return 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=200&q=80'
}

function getProductImage(product) {
  if (product.images?.length > 0 && product.images[0].imageUrl) {
    return product.images[0].imageUrl
  }
  if (product.imageUrl) {
    return product.imageUrl
  }
  return getCategoryImage(product.category?.name)
}

function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(price)
}

async function updateQty(item, newQty) {
  if (newQty < 1 || newQty > item.product.stock) return
  await cart.updateItem(item.id, newQty)
}

async function removeItem(itemId) {
  await cart.removeItem(itemId)
}

async function confirmClear() {
  showClearModal.value = false
  await cart.clearCart()
}

onMounted(() => {
  cart.fetchCart()
})
</script>

<style scoped>
.cart-view {
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
.cart-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 28px;
  align-items: start;
}

/* Items */
.cart-items {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.items-header {
  display: grid;
  grid-template-columns: 1fr 120px 120px 120px 40px;
  gap: 12px;
  padding: 12px 20px;
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cart-item {
  display: grid;
  grid-template-columns: 1fr 120px 120px 120px 40px;
  gap: 12px;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  transition: background 0.2s;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item:hover {
  background: rgba(99, 179, 237, 0.02);
}

/* Producto */
.item-product {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-img {
  width: 60px;
  height: 60px;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  flex-shrink: 0;
}

.item-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  transition: color 0.2s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-name:hover {
  color: var(--color-primary);
}

.item-stock {
  font-size: 11px;
  font-weight: 500;
}

.item-stock.in-stock { color: var(--color-success); }
.item-stock.out-of-stock { color: var(--color-text-muted); }

/* Precio */
.item-price {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-light);
}

/* Cantidad */
.item-qty {
  display: flex;
  align-items: center;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
  width: fit-content;
}

.item-qty button {
  width: 28px;
  height: 32px;
  font-size: 16px;
  color: var(--color-text-light);
  transition: all 0.2s;
}

.item-qty button:hover:not(:disabled) {
  background: var(--color-primary-dim);
  color: var(--color-primary);
}

.item-qty button:disabled {
  opacity: 0.3;
}

.item-qty span {
  width: 32px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
}

/* Subtotal */
.item-subtotal {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-accent);
}

/* Eliminar */
.item-remove {
  font-size: 16px;
  opacity: 0.5;
  transition: opacity 0.2s;
  padding: 6px;
}

.item-remove:hover {
  opacity: 1;
}

/* Acciones */
.cart-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--color-bg-elevated);
  border-top: 1px solid var(--color-border);
}

.btn-sm {
  padding: 7px 14px;
  font-size: 13px;
}

.danger {
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.danger:hover {
  background: rgba(252, 129, 129, 0.1);
}

/* Resumen */
.order-summary {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: sticky;
  top: 90px;
}

.summary-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
}

.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--color-text-light);
}

.free-shipping {
  color: var(--color-success);
  font-weight: 600;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
}

.summary-total span:last-child {
  color: var(--color-accent);
}

.checkout-btn {
  width: 100%;
  padding: 13px;
  font-size: 15px;
}

/* Métodos de pago */
.payment-info {
  border-top: 1px solid var(--color-border);
  padding-top: 14px;
}

.payment-label {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}

.payment-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.payment-badges span {
  font-size: 11px;
  padding: 4px 10px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  color: var(--color-text-light);
}

/* Transición de items */
.item-enter-active,
.item-leave-active {
  transition: all 0.3s ease;
}

.item-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 16px;
}

.modal-box {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 32px 28px;
  max-width: 360px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
}

.modal-icon {
  font-size: 40px;
  line-height: 1;
}

.modal-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}

.modal-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 8px;
}

.modal-actions .btn {
  flex: 1;
  padding: 10px;
  font-size: 14px;
}

.btn-danger {
  background: var(--color-danger, #fc8181);
  color: #0f0f13;
  border: none;
  border-radius: var(--radius);
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-danger:hover {
  opacity: 0.85;
}

/* Transición del modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.95);
  opacity: 0;
}

/* Responsive */
@media (max-width: 900px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: static;
  }

  .items-header {
    display: none;
  }

  .cart-item {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 8px;
  }

  .item-product {
    grid-column: 1 / -1;
  }
}
</style>