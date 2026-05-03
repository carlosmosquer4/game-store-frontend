<template>
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <div class="container nav-inner">

      <!-- Logo -->
      <router-link to="/" class="nav-logo">
        <span class="logo-icon">🎮</span>
        <div class="logo-text">
          <span class="logo-main">Game Store</span>
          <span class="logo-sub">Neiva</span>
        </div>
      </router-link>

      <!-- Links del centro -->
      <div class="nav-links" :class="{ open: mobileOpen }">
        <router-link to="/" class="nav-link" @click="mobileOpen = false">
          Inicio
        </router-link>
        <router-link to="/productos" class="nav-link" @click="mobileOpen = false">
          Catálogo
        </router-link>
        <router-link to="/contacto" class="nav-link" @click="mobileOpen = false">
          Contacto
        </router-link>
      </div>

      <!-- Acciones de la derecha -->
      <div class="nav-actions">

        <!-- Carrito (solo si hay sesión) -->
        <router-link
          v-if="auth.isAuthenticated"
          to="/carrito"
          class="cart-btn"
        >
          🛒
          <span v-if="cart.itemCount > 0" class="cart-badge">
            {{ cart.itemCount }}
          </span>
        </router-link>

        <!-- Menú de usuario (si hay sesión) -->
        <div class="user-menu" v-if="auth.isAuthenticated" ref="userMenuRef">
          <button class="user-btn" @click="userMenuOpen = !userMenuOpen">
            <div class="user-avatar">
              {{ auth.user?.name?.charAt(0)?.toUpperCase() }}
            </div>
          </button>

          <!-- Dropdown -->
          <div class="dropdown" v-if="userMenuOpen">
            <div class="dropdown-header">
              <p class="dropdown-name">{{ auth.user?.name }}</p>
              <p class="dropdown-email">{{ auth.user?.email }}</p>
            </div>
            <router-link
              to="/perfil"
              class="dropdown-item"
              @click="userMenuOpen = false"
            >
              👤 Mi Perfil
            </router-link>
            <router-link
              to="/pedidos"
              class="dropdown-item"
              @click="userMenuOpen = false"
            >
              📦 Mis Pedidos
            </router-link>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" @click="handleLogout">
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>

        <!-- Botones de invitado (si no hay sesión) -->
        <div class="guest-btns" v-else>
          <router-link to="/login" class="btn btn-outline btn-sm">
            Entrar
          </router-link>
          <router-link to="/registro" class="btn btn-primary btn-sm">
            Registrarse
          </router-link>
        </div>

        <!-- Botón hamburguesa para móvil -->
        <button class="burger-btn" @click="mobileOpen = !mobileOpen">
          <span :class="{ open: mobileOpen }"></span>
          <span :class="{ open: mobileOpen }"></span>
          <span :class="{ open: mobileOpen }"></span>
        </button>

      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()

// Estado del navbar
const isScrolled = ref(false)
const mobileOpen = ref(false)
const userMenuOpen = ref(false)
const userMenuRef = ref(null)

// Detectar scroll para cambiar estilo del navbar
function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

// Cerrar dropdown al hacer click fuera
function handleClickOutside(e) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    userMenuOpen.value = false
  }
}

function handleLogout() {
  auth.logout()
  userMenuOpen.value = false
  mobileOpen.value = false
  router.push('/')
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 16px 0;
  transition: all 0.3s ease;
}

/* Cuando se hace scroll cambia el fondo */
.navbar.scrolled {
  background: rgba(15, 15, 19, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  padding: 10px 0;
}

.nav-inner {
  display: flex;
  align-items: center;
  gap: 32px;
}

/* Logo */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.logo-main {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
}

.logo-sub {
  font-size: 11px;
  color: var(--color-text-muted);
  letter-spacing: 2px;
}

/* Links */
.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.nav-link {
  padding: 7px 14px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-light);
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--color-text);
  background: var(--color-bg-elevated);
}

/* Router-link activo */
.nav-link.router-link-exact-active {
  color: var(--color-primary);
  background: var(--color-primary-dim);
}

/* Acciones */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Carrito */
.cart-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  font-size: 18px;
  transition: background 0.2s;
}

.cart-btn:hover {
  background: var(--color-bg-elevated);
}

.cart-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--color-accent);
  color: white;
  font-size: 10px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

/* Avatar de usuario */
.user-menu {
  position: relative;
}

.user-btn {
  padding: 0;
  background: none;
  border: none;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #0f0f13;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.user-avatar:hover {
  opacity: 0.85;
}

/* Dropdown */
.dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 210px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-hover);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  animation: fadeDown 0.2s ease;
}

@keyframes fadeDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
}

.dropdown-name {
  font-weight: 600;
  font-size: 14px;
}

.dropdown-email {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 16px;
  font-size: 14px;
  color: var(--color-text-light);
  transition: all 0.2s;
  width: 100%;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--color-bg-elevated);
  color: var(--color-text);
}

.dropdown-item.danger:hover {
  color: var(--color-danger);
}

.dropdown-divider {
  height: 1px;
  background: var(--color-border);
  margin: 4px 0;
}

/* Botones de invitado */
.guest-btns {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 7px 16px;
  font-size: 13px;
}

/* Burger para móvil */
.burger-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 6px;
  width: 38px;
  height: 38px;
  justify-content: center;
}

.burger-btn span {
  display: block;
  height: 2px;
  width: 100%;
  background: var(--color-text-light);
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-links {
    display: none;
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: rgba(15, 15, 19, 0.98);
    padding: 16px;
    flex-direction: column;
    border-bottom: 1px solid var(--color-border);
  }

  .nav-links.open {
    display: flex;
  }

  .nav-link {
    padding: 12px 16px;
    font-size: 16px;
    width: 100%;
  }

  .burger-btn {
    display: flex;
  }

  .guest-btns .btn-outline {
    display: none;
  }
}
</style>