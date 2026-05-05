<template>
  <div class="auth-view">
    <div class="auth-card">

      <div class="auth-header">
        <span class="auth-icon">🎮</span>
        <h1 class="auth-title">Iniciar Sesión</h1>
        <p class="auth-sub">Accede a tu cuenta de Game Store Neiva</p>
      </div>

            <!-- Banner cuenta verificada -->
      <div class="alert alert-success" v-if="verifiedBanner">
        ✅ ¡Cuenta verificada! Ya puedes iniciar sesión.
      </div>

      <!-- Banner error verificación -->
      <div class="alert alert-error" v-if="errorBanner">
        ❌ {{ errorBanner }}
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

      <div class="forgot-link">
        <router-link to="/forgot-password" class="auth-link">
          ¿Olvidaste tu contraseña?
        </router-link>
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
import { reactive, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()
const route = useRoute()
const verifiedBanner = ref(false)
const errorBanner = ref('')

const showPassword = ref(false)

const form = reactive({
  email: '',
  password: ''
})

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  
  if (params.get('verified') === 'true') {
    verifiedBanner.value = true
  }
  if (params.get('error') === 'verificacion_fallida') {
    errorBanner.value = 'El enlace es inválido o ha expirado'
  }
})

async function handleLogin() {
  try {
    const ok = await auth.login(form.email, form.password)
    if (ok) {
      await cart.fetchCart()
      router.push('/')
    }
  } catch (err) {
    // El store maneja el error pero verificamos si es 403
    if (err?.response?.status === 403) {
      auth.error = 'Debes verificar tu correo antes de iniciar sesión'
    }
  }
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

.forgot-link {
  text-align: center;
  font-size: 13px;
  margin-top: -8px;
}
</style>