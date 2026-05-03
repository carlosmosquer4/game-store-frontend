<template>
  <div class="app">
    <AppNavbar />

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <AppFooter />

    <!-- Toast de notificaciones -->
    <transition name="toast">
      <div class="toast" v-if="toastMsg">
        ✅ {{ toastMsg }}
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cart'
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'

const auth = useAuthStore()
const cart = useCartStore()

const toastMsg = ref('')
let toastTimer = null

function showToast(msg) {
  toastMsg.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMsg.value = ''
  }, 3000)
}

provide('showToast', showToast)

onMounted(async () => {
  if (auth.isAuthenticated) {
    await auth.fetchProfile()
    await cart.fetchCart()
  }
})
</script>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 70px;
}

.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-success);
  color: var(--color-success);
  padding: 12px 20px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  box-shadow: var(--shadow-lg);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>