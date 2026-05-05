<template>
  <div class="auth-view">
    <div class="auth-card">

      <div class="auth-header">
        <span class="auth-icon">🔑</span>
        <h1 class="auth-title">Nueva Contraseña</h1>
        <p class="auth-sub">Ingresa tu nueva contraseña</p>
      </div>

      <!-- Sin token -->
      <div class="error-state" v-if="!token">
        <p class="error-text">
          ❌ Enlace inválido. Solicita uno nuevo desde
          <router-link to="/forgot-password" class="auth-link">
            recuperar contraseña
          </router-link>
        </p>
      </div>

      <!-- Éxito -->
      <div class="success-msg" v-else-if="done">
        <div class="success-icon">✅</div>
        <h3 class="success-title">¡Contraseña actualizada!</h3>
        <p class="success-desc">
          Ya puedes iniciar sesión con tu nueva contraseña.
        </p>
        <router-link to="/login" class="btn btn-primary">
          Ir al login
        </router-link>
      </div>

      <!-- Formulario -->
      <div v-else>
        <form @submit.prevent="handleSubmit" class="auth-form">

          <div class="field-group">
            <label class="field-label">Nueva contraseña *</label>
            <div class="input-wrap">
              <input
                v-model="password"
                :type="showPwd ? 'text' : 'password'"
                placeholder="Mínimo 6 caracteres"
                class="input"
                required
                minlength="6"
              />
              <button
                type="button"
                class="toggle-pwd"
                @click="showPwd = !showPwd"
              >
                {{ showPwd ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Confirmar contraseña *</label>
            <div class="input-wrap">
              <input
                v-model="confirmPassword"
                :type="showPwd ? 'text' : 'password'"
                placeholder="Repite la contraseña"
                class="input"
                required
              />
            </div>
          </div>

          <!-- Error de coincidencia -->
          <div class="alert alert-error" v-if="password && confirmPassword && password !== confirmPassword">
            Las contraseñas no coinciden
          </div>

          <div class="alert alert-error" v-if="errorMsg">
            {{ errorMsg }}
          </div>

          <button
            type="submit"
            class="btn btn-primary auth-btn"
            :disabled="loading || password !== confirmPassword || !password"
          >
            {{ loading ? 'Guardando...' : 'Cambiar contraseña' }}
          </button>

        </form>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../services/api'

const router = useRouter()

const token = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPwd = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const done = ref(false)

onMounted(() => {
  // Leer el token de la URL
  const params = new URLSearchParams(window.location.search)
  token.value = params.get('token') || ''
})

async function handleSubmit() {
  if (password.value !== confirmPassword.value) return

  loading.value = true
  errorMsg.value = ''

  try {
    await authApi.resetPassword(token.value, password.value)
    done.value = true
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'El enlace es inválido o ha expirado'
  } finally {
    loading.value = false
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

.auth-icon { font-size: 40px; }

.auth-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
}

.auth-sub {
  font-size: 14px;
  color: var(--color-text-muted);
}

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
}

.auth-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* Error state */
.error-state {
  text-align: center;
  padding: 10px 0;
}

.error-text {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.7;
}

.auth-link {
  color: var(--color-primary);
  font-weight: 500;
}

/* Éxito */
.success-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
  padding: 10px 0;
}

.success-icon { font-size: 48px; }

.success-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-success);
}

.success-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.7;
}
</style>