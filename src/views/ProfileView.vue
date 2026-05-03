<template>
  <div class="profile-view">
    <div class="container">

      <div class="page-header">
        <h1 class="page-title">Mi Perfil</h1>
      </div>

      <div class="profile-layout">

        <!-- Tarjeta de perfil -->
        <div class="profile-card">
          <div class="profile-avatar">
            {{ auth.user?.name?.charAt(0)?.toUpperCase() }}
          </div>
          <h2 class="profile-name">{{ auth.user?.name }}</h2>
          <p class="profile-email">{{ auth.user?.email }}</p>
          <span
            class="profile-role badge"
            :class="auth.isAdmin ? 'badge-accent' : 'badge-primary'"
          >
            {{ auth.isAdmin ? '⚙️ Admin' : '👤 Cliente' }}
          </span>

          <div class="profile-info">
            <div class="info-row" v-if="auth.user?.city">
              <span class="info-icon">📍</span>
              <span>{{ auth.user.city }}, {{ auth.user.department }}</span>
            </div>
            <div class="info-row" v-if="auth.user?.phone">
              <span class="info-icon">📱</span>
              <span>{{ auth.user.phone }}</span>
            </div>
            <div class="info-row" v-if="auth.user?.address">
              <span class="info-icon">🏠</span>
              <span>{{ auth.user.address }}</span>
            </div>
          </div>

          <router-link to="/pedidos" class="btn btn-outline view-orders-btn">
            📦 Ver mis pedidos
          </router-link>
        </div>

        <!-- Formulario de edición -->
        <div class="edit-card">
          <h3 class="edit-title">Actualizar información</h3>

          <form @submit.prevent="handleUpdate" class="edit-form">

            <div class="field-group full">
              <label class="field-label">Dirección</label>
              <input
                v-model="form.address"
                placeholder="Calle 123 #45-67"
                class="input"
              />
            </div>

            <div class="form-row">
              <div class="field-group">
                <label class="field-label">Ciudad</label>
                <input
                  v-model="form.city"
                  placeholder="Neiva"
                  class="input"
                />
              </div>
              <div class="field-group">
                <label class="field-label">Departamento</label>
                <input
                  v-model="form.department"
                  placeholder="Huila"
                  class="input"
                />
              </div>
            </div>

            <div class="field-group full">
              <label class="field-label">Teléfono</label>
              <input
                v-model="form.phone"
                placeholder="+573001234567"
                class="input"
              />
            </div>

            <!-- Mensajes -->
            <div class="alert alert-success" v-if="successMsg">
              {{ successMsg }}
            </div>
            <div class="alert alert-error" v-if="errorMsg">
              {{ errorMsg }}
            </div>

            <button
              type="submit"
              class="btn btn-primary save-btn"
              :disabled="saving"
            >
              {{ saving ? 'Guardando...' : 'Guardar cambios' }}
            </button>

          </form>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { authApi } from '../services/api'

const auth = useAuthStore()
const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const form = reactive({
  address: '',
  city: '',
  department: '',
  phone: ''
})

async function handleUpdate() {
  saving.value = true
  successMsg.value = ''
  errorMsg.value = ''

  try {
    await authApi.updateProfile(form)
    await auth.fetchProfile()
    successMsg.value = '¡Perfil actualizado correctamente!'
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Error al actualizar'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  // Pre-llenar con datos actuales
  form.address = auth.user?.address || ''
  form.city = auth.user?.city || ''
  form.department = auth.user?.department || ''
  form.phone = auth.user?.phone || ''
})
</script>

<style scoped>
.profile-view {
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
.profile-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 28px;
  align-items: start;
}

/* Tarjeta de perfil */
.profile-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #0f0f13;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 4px;
}

.profile-name {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
}

.profile-email {
  font-size: 13px;
  color: var(--color-text-muted);
  word-break: break-all;
}

.profile-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
  border-top: 1px solid var(--color-border);
  padding-top: 14px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-light);
  text-align: left;
}

.info-icon {
  flex-shrink: 0;
  font-size: 14px;
}

.view-orders-btn {
  width: 100%;
  justify-content: center;
  margin-top: 4px;
}

/* Formulario de edición */
.edit-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 28px;
}

.edit-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 22px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
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

.save-btn {
  align-self: flex-start;
  padding: 11px 28px;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>