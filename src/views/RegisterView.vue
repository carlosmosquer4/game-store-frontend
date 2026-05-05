<template>
  <div class="auth-view">
    <div class="auth-card wide">

      <div class="auth-header">
        <span class="auth-icon">🎮</span>
        <h1 class="auth-title">Crear Cuenta</h1>
        <p class="auth-sub">Únete a Game Store Neiva</p>
      </div>

      <!-- Mensaje de éxito -->
      <div class="registered-msg" v-if="registered">
        <div class="reg-icon">📧</div>
        <h2 class="reg-title">¡Registro exitoso!</h2>
        <p class="reg-desc">
          Revisa tu correo <strong>{{ registeredEmail }}</strong> para activar tu cuenta.
          Sin activación no podrás iniciar sesión.
        </p>
        <router-link to="/login" class="btn btn-primary">
          Ir al login
        </router-link>
      </div>

      <!-- Formulario solo si NO se registró -->
      <div v-if="!registered">
        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-grid">

            <div class="field-group full">
              <label class="field-label">Nombre completo *</label>
              <input v-model="form.name" type="text" placeholder="Juan Pérez" class="input" required />
            </div>

            <div class="field-group">
              <label class="field-label">Número de identificación *</label>
              <input v-model="form.identificationNumber" type="text" placeholder="1234567890" class="input" required />
            </div>

            <div class="field-group">
              <label class="field-label">Fecha de nacimiento *</label>
              <input v-model="form.birthDate" type="date" class="input" required />
            </div>

            <div class="field-group full">
              <label class="field-label">Correo electrónico *</label>
              <input v-model="form.email" type="email" placeholder="tu@email.com" class="input" required />
            </div>

            <div class="field-group full">
              <label class="field-label">Contraseña *</label>
              <div class="input-wrap">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Mínimo 6 caracteres"
                  class="input"
                  required
                />
                <button type="button" class="toggle-pwd" @click="showPassword = !showPassword">
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <div class="field-group full">
              <label class="field-label">Dirección *</label>
              <input v-model="form.address" type="text" placeholder="Calle 123 #45-67" class="input" required />
            </div>

            <div class="field-group">
              <label class="field-label">Ciudad *</label>
              <input v-model="form.city" type="text" placeholder="Neiva" class="input" required />
            </div>

            <div class="field-group">
              <label class="field-label">Departamento *</label>
              <input v-model="form.department" type="text" placeholder="Huila" class="input" required />
            </div>

            <div class="field-group full">
              <label class="field-label">Teléfono (opcional)</label>
              <input v-model="form.phone" type="tel" placeholder="+573001234567" class="input" />
            </div>

          </div>

          <div class="alert alert-error" v-if="auth.error">
            {{ auth.error }}
          </div>

          <button type="submit" class="btn btn-primary auth-btn" :disabled="auth.loading">
            {{ auth.loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
          </button>
        </form>

        <div class="auth-footer">
          ¿Ya tienes cuenta?
          <router-link to="/login" class="auth-link">Inicia sesión</router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const showPassword = ref(false)
const registered = ref(false)
const registeredEmail = ref('')

const form = reactive({
  name: '',
  identificationNumber: '',
  birthDate: '',
  email: '',
  password: '',
  address: '',
  city: 'Neiva',
  department: 'Huila',
  phone: ''
})

async function handleRegister() {
  const payload = { ...form }
  if (!payload.phone) delete payload.phone

  const ok = await auth.register(payload)
  if (ok) {
    registered.value = true
    registeredEmail.value = form.email
  }
}
</script>

<style scoped>
.auth-view {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
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

.auth-card.wide {
  max-width: 600px;
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
  font-size: 26px;
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-group.full {
  grid-column: 1 / -1;
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

.auth-footer {
  text-align: center;
  font-size: 14px;
  color: var(--color-text-muted);
  margin-top: 8px;
}

.auth-link {
  color: var(--color-primary);
  font-weight: 500;
  margin-left: 4px;
}

.registered-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  text-align: center;
}

.reg-icon { font-size: 52px; }

.reg-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--color-success);
}

.reg-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.7;
  max-width: 300px;
}

@media (max-width: 540px) {
  .form-grid { grid-template-columns: 1fr; }
  .field-group.full { grid-column: 1; }
  .auth-card { padding: 28px 20px; }
}
</style>