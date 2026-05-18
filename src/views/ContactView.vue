<template>
  <div class="contact-view">

    <!-- Header -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">Contáctanos</h1>
        <p class="page-sub">
          ¿Tienes dudas? Estamos aquí para ayudarte
        </p>
      </div>
    </div>

    <div class="container contact-layout">

      <!-- Info de contacto -->
      <div class="contact-info">
        <h3 class="info-title">Información de contacto</h3>

        <div class="info-items">
          <div class="info-item">
            <span class="info-icon">📍</span>
            <div>
              <p class="info-label">Ubicación</p>
              <p class="info-value">Neiva, Huila, Colombia</p>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">📧</span>
            <div>
              <p class="info-label">Correo</p>
              <p class="info-value">soporte@gamestoreneiva.co</p>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">📱</span>
            <div>
              <p class="info-label">WhatsApp</p>
              <p class="info-value">+57 300 123 4567</p>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">🕐</span>
            <div>
              <p class="info-label">Horario</p>
              <p class="info-value">Lunes a Sábado: 9am – 7pm</p>
            </div>
          </div>
        </div>

        <!-- Redes sociales -->
        <div class="social-section">
          <p class="social-title">Síguenos en redes</p>
          <div class="social-links">
            <a href="#" class="social-btn">📷 Instagram</a>
            <a href="#" class="social-btn">📘 Facebook</a>
            <a href="#" class="social-btn">🐦 Twitter</a>
          </div>
        </div>

      </div>

      <!-- Formulario de contacto -->
      <div class="contact-form-card">

        <!-- Formulario -->
        <div v-if="!sent">
          <h3 class="form-title">Envíanos un mensaje</h3>

          <form @submit.prevent="handleSubmit" class="contact-form">

            <div class="field-group">
              <label class="field-label">Nombre *</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Tu nombre completo"
                class="input"
                required
              />
            </div>

            <div class="field-group">
              <label class="field-label">Correo electrónico *</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="tu@email.com"
                class="input"
                required
              />
            </div>

            <div class="field-group">
              <label class="field-label">Asunto *</label>
              <select v-model="form.subject" class="input" required>
                <option value="">Selecciona un asunto</option>
                <option>Consulta sobre producto</option>
                <option>Estado de mi pedido</option>
                <option>Devoluciones y garantías</option>
                <option>Problema con mi cuenta</option>
                <option>Otro</option>
              </select>
            </div>

            <div class="field-group">
              <label class="field-label">Mensaje *</label>
              <textarea
                v-model="form.message"
                placeholder="Cuéntanos en qué podemos ayudarte..."
                class="input"
                rows="5"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              class="btn btn-primary send-btn"
              :disabled="sending"
            >
              {{ sending ? 'Enviando...' : '📨 Enviar mensaje' }}
            </button>

          </form>
        </div>

        <!-- Mensaje de éxito -->
        <div class="sent-state" v-else>
          <div class="sent-icon">✅</div>
          <h3 class="sent-title">¡Mensaje enviado!</h3>
          <p class="sent-desc">
            Gracias por contactarnos. Te responderemos en menos de
            24 horas al correo <strong>{{ form.email }}</strong>.
          </p>
          <button
            class="btn btn-outline"
            @click="resetForm"
          >
            Enviar otro mensaje
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const sent = ref(false)
const sending = ref(false)

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
})


async function handleSubmit() {
  sending.value = true
  // Simulamos el envío (no hay endpoint real para contacto)
  await new Promise(resolve => setTimeout(resolve, 1500))
  sending.value = false
  sent.value = true
}

function resetForm() {
  form.name = ''
  form.email = ''
  form.subject = ''
  form.message = ''
  sent.value = false
}
</script>

<style scoped>
.contact-view {
  min-height: 100vh;
  padding-bottom: 60px;
}

/* Header */
.page-header {
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  padding: 40px 0;
  margin-bottom: 0;
}

.page-title {
  font-family: var(--font-display);
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 700;
  margin-bottom: 8px;
}

.page-sub {
  font-size: 15px;
  color: var(--color-text-muted);
}

/* Layout */
.contact-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
  padding-top: 40px;
}

/* Info */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.info-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.info-icon {
  font-size: 22px;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-label {
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 3px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

/* Redes sociales */
.social-section {
  border-top: 1px solid var(--color-border);
  padding-top: 20px;
}

.social-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-light);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.social-links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.social-btn {
  padding: 8px 16px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 13px;
  color: var(--color-text-light);
  transition: all 0.2s;
}

.social-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Formulario */
.contact-form-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 32px;
}

.form-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 22px;
}

.contact-form {
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

textarea.input {
  resize: vertical;
  min-height: 120px;
}

.send-btn {
  width: 100%;
  padding: 13px;
  font-size: 15px;
}

/* Estado enviado */
.sent-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 40px 0;
  text-align: center;
}

.sent-icon {
  font-size: 52px;
}

.sent-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--color-success);
}

.sent-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.7;
  max-width: 300px;
}

/* Responsive */
@media (max-width: 900px) {
  .contact-layout {
    grid-template-columns: 1fr;
  }
}
</style>