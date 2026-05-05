import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/productos',
    component: () => import('../views/ProductsView.vue'),
  },
  {
    path: '/productos/:id',
    component: () => import('../views/ProductDetailView.vue'),
  },
  {
    path: '/carrito',
    component: () => import('../views/CartView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout',
    component: () => import('../views/CheckoutView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pedidos',
    component: () => import('../views/OrdersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/perfil',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/registro',
    component: () => import('../views/RegisterView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/contacto',
    component: () => import('../views/ContactView.vue'),
  },
  {
    path: '/admin',
    component: () => import('../views/admin/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/productos/nuevo',
    component: () => import('../views/admin/ProductFormView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/productos/editar/:id',
    component: () => import('../views/admin/ProductFormView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/pedidos',
    component: () => import('../views/admin/AdminOrdersView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/forgot-password',
    component: () => import('../views/ForgotPasswordView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/reset-password',
    component: () => import('../views/ResetPasswordView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Vuelve al inicio de la página al cambiar de ruta
  scrollBehavior() {
    return { top: 0 }
  }
})

// Guard de navegación — se ejecuta antes de cada cambio de ruta
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/login')
  } else if (to.meta.guestOnly && auth.isAuthenticated) {
    next('/')
  } else if (to.meta.requiresAdmin && !auth.isAdmin) {
    // Si no es admin lo manda al home
    next('/')
  } else {
    next()
  }
})

export default router