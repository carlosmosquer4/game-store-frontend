<template>
  <div class="auth-view">
    <div class="auth-card">

      <div class="auth-header">
        <span class="auth-icon">🔐</span>
        <h1 class="auth-title">Recuperar Contraseña</h1>
        <p class="auth-sub">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
        </p>
      </div>

      <!-- Éxito -->
      <div class="success-msg" v-if="sent">
        <div class="success-icon">📧</div>
        <h3 class="success-title">¡Correo enviado!</h3>
        <p class="success-desc">
          Si el correo <strong>{{ email }}</strong> está registrado,
          recibirás un enlace en los próximos minutos.
          Revisa también tu carpeta de spam.
        </p>
        <router-link to="/login" class="btn btn-primary">
          Volver al login
        </router-link>
      </div>

      <!-- Formulario -->
      <div v-if="!sent">
        <form @submit.prevent="handleSubmit" class="auth-form">

          <div class="field-group">
            <label class="field-label">Correo electrónico</label>
            <input
              v-model="email"
              type="email"
              placeholder="tu@email.com"
              class="input"
              required
            />
          </div>

          <div class="alert alert-error" v-if="errorMsg">
            {{ errorMsg }}
          </div>

          <button
            type="submit"
            class="btn btn-primary auth-btn"
            :disabled="loading"
          >
            {{ loading ? 'Enviando...' : 'Enviar enlace' }}
          </button>

        </form>

        <div class="auth-footer">
          <router-link to="/login" class="auth-link">
            ← Volver al login
          </router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { authApi } from '../services/api'

const email = ref('')
const loading = ref(false)
const errorMsg = ref('')
const sent = ref(false)

async function handleSubmit() {
  loading.value = true
  errorMsg.value = ''
  try {
    await authApi.forgotPassword(email.value)
    // El backend siempre responde igual
    // para no revelar si el correo existe
    sent.value = true
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Error al enviar el correo'
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
  line-height: 1.6;
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

.auth-footer {
  text-align: center;
  font-size: 14px;
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