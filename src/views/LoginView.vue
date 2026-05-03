<template>
  <div class="auth-view">
    <div class="auth-card">

      <div class="auth-header">
        <span class="auth-icon">🎮</span>
        <h1 class="auth-title">Iniciar Sesión</h1>
        <p class="auth-sub">Accede a tu cuenta de Game Store Neiva</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">

        <div class="field-group">
          <label class="field-label">Correo electrónico</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="tu@email.com"
            class="input"
            required
          />
        </div>

        <div class="field-group">
          <label class="field-label">Contraseña</label>
          <div class="input-wrap">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="input"
              required
            />
            <button
              type="button"
              class="toggle-pwd"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <!-- Error del store -->
        <div class="alert alert-error" v-if="auth.error">
          {{ auth.error }}
        </div>

        <button
          type="submit"
          class="btn btn-primary auth-btn"
          :disabled="auth.loading"
        >
          {{ auth.loading ? 'Ingresando...' : 'Ingresar' }}
        </button>

      </form>

      <!-- Credenciales de prueba -->
      <div class="demo-section">
        <p class="demo-label">Credenciales de prueba:</p>
        <div class="demo-btns">
          <button
            class="demo-btn"
            @click="fillDemo('carlos@email.com', 'password123')"
          >
            👤 Cliente
          </button>
          <button
            class="demo-btn"
            @click="fillDemo('admin@ecommerce.com', 'admin123')"
          >
            ⚙️ Admin
          </button>
        </div>
      </div>

      <div class="auth-footer">
        ¿No tienes cuenta?
        <router-link to="/registro" class="auth-link">
          Regístrate aquí
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()

const showPassword = ref(false)

const form = reactive({
  email: '',
  password: ''
})

async function handleLogin() {
  const ok = await auth.login(form.email, form.password)
  if (ok) {
    // Cargar carrito después del login
    await cart.fetchCart()
    router.push('/')
  }
}

function fillDemo(email, password) {
  form.email = email
  form.password = password
}
</script>

<style scoped>
.auth-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: radial-gradient(
    ellipse at top left,
    rgba(99, 179, 237, 0.06) 0%,
    transparent 60%
  );
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 40px 36px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.auth-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.auth-icon {
  font-size: 40px;
}

.auth-title {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
}

.auth-sub {
  font-size: 14px;
  color: var(--color-text-muted);
}

/* Formulario */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-light);
}

.input-wrap {
  position: relative;
}

.input-wrap .input {
  padding-right: 44px;
}

.toggle-pwd {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  background: none;
  border: none;
  cursor: pointer;
}

.auth-btn {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  margin-top: 4px;
}

/* Demo */
.demo-section {
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.demo-label {
  font-size: 12px;
  color: var(--color-text-muted);
  text-align: center;
}

.demo-btns {
  display: flex;
  gap: 8px;
}

.demo-btn {
  flex: 1;
  padding: 8px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 13px;
  color: var(--color-text-light);
  cursor: pointer;
  transition: all 0.2s;
}

.demo-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Footer */
.auth-footer {
  text-align: center;
  font-size: 14px;
  color: var(--color-text-muted);
}

.auth-link {
  color: var(--color-primary);
  font-weight: 500;
  margin-left: 4px;
}

.auth-link:hover {
  text-decoration: underline;
}
</style>