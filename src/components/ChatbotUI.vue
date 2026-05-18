<template>
  <div class="chatbot-wrapper">
    <!-- Botón flotante -->
    <button 
      class="chatbot-toggle" 
      @click="toggleChat"
      :class="{ 'is-open': isOpen }"
      aria-label="Abrir asistente de IA"
    >
      <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>

    <!-- Ventana del chat -->
    <transition name="chat-window">
      <div v-if="isOpen" class="chatbot-window">
        <div class="chatbot-header">
          <div class="chatbot-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2v2.1c2.1.3 3.9 1.6 4.7 3.5l.3.8h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1l-.3.8c-.8 1.9-2.6 3.2-4.7 3.5V20a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.1c-2.1-.3-3.9-1.6-4.7-3.5l-.3-.8h-1a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h1l.3-.8c.8-1.9 2.6-3.2 4.7-3.5V4a2 2 0 0 1 2-2h4z"/><circle cx="9" cy="11" r="1"/><circle cx="15" cy="11" r="1"/></svg>
            Asistente IA
          </div>
          <button class="chatbot-close" @click="isOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="chatbot-messages" ref="messagesContainer">
          <div v-if="messages.length === 0" class="chatbot-empty">
            <p>¡Hola! Soy tu asistente virtual. ¿En qué te puedo ayudar hoy?</p>
            <div class="predefined-questions">
              <button class="predefined-btn" @click="sendPredefined('¿Cómo funciona el proceso de devoluciones?')">📦 Proceso de devoluciones</button>
              <button class="predefined-btn" @click="sendPredefined('¿Cuánto tardan los envíos y entregas?')">🚚 Tiempos de envío</button>
              <button class="predefined-btn" @click="sendPredefined('¿Cuáles son los métodos de pago aceptados?')">💳 Métodos de pago</button>
            </div>
          </div>
          
          <div 
            v-for="(msg, index) in messages" 
            :key="index"
            :class="['chatbot-msg-wrapper', msg.role]"
          >
            <div class="chatbot-bubble">
              {{ msg.content }}
            </div>
            <!-- Si hay productos sugeridos y es el último mensaje -->
            <div v-if="msg.suggestedProducts && msg.suggestedProducts.length > 0" class="chatbot-suggestions">
              <span class="suggestion-tag" v-for="id in msg.suggestedProducts" :key="id" @click="goToProduct(id)">
                Ver Producto #{{ id }}
              </span>
            </div>
          </div>
          
          <div v-if="isLoading" class="chatbot-msg-wrapper assistant">
            <div class="chatbot-bubble is-loading">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>

        <form class="chatbot-input-area" @submit.prevent="sendMessage">
          <input 
            type="text" 
            v-model="newMessage" 
            placeholder="Escribe tu mensaje..." 
            class="chatbot-input"
            :disabled="isLoading"
          />
          <button type="submit" class="chatbot-send" :disabled="!newMessage.trim() || isLoading">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { chatbotApi } from '../services/api'

const router = useRouter()

const isOpen = ref(false)
const newMessage = ref('')
const messages = ref([])
const isLoading = ref(false)
const messagesContainer = ref(null)

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendPredefined = (text) => {
  newMessage.value = text
  sendMessage()
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || isLoading.value) return

  const userText = newMessage.value.trim()
  
  // Agregar mensaje del usuario a la UI
  messages.value.push({
    role: 'user',
    content: userText
  })
  
  newMessage.value = ''
  isLoading.value = true
  scrollToBottom()

  try {
    // Preparar historial para enviar al backend (formato: {role, content})
    const history = messages.value.slice(0, -1).map(m => ({
      role: m.role,
      content: m.content
    }))

    const response = await chatbotApi.send(userText, history)
    
    if (response.data && response.data.success) {
      messages.value.push({
        role: 'assistant',
        content: response.data.data.reply,
        suggestedProducts: response.data.data.suggestedProducts || []
      })
    } else {
      throw new Error('Respuesta inválida del servidor')
    }
  } catch (error) {
    console.error('Error al enviar mensaje al chatbot:', error)
    messages.value.push({
      role: 'assistant',
      content: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor intenta más tarde.'
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const goToProduct = (id) => {
  isOpen.value = false
  router.push(`/productos/${id}`)
}
</script>

<style scoped>
.chatbot-wrapper {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  font-family: var(--font-main);
}

.chatbot-toggle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #0f0f13;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.chatbot-toggle:hover {
  transform: scale(1.1);
  background: #90cdf4;
}

.chatbot-toggle.is-open {
  background: var(--color-bg-elevated);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.chatbot-window {
  position: absolute;
  bottom: 76px;
  right: 0;
  width: 350px;
  height: 500px;
  max-height: calc(100vh - 100px);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chatbot-header {
  padding: 16px 20px;
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chatbot-title {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary);
}

.chatbot-close {
  color: var(--color-text-muted);
  transition: color var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chatbot-close:hover {
  color: var(--color-text);
}

.chatbot-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chatbot-empty {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 14px;
  margin: auto 0;
  padding: 20px;
}

.predefined-questions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.predefined-btn {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-primary-dim);
  color: var(--color-text);
  padding: 12px 16px;
  border-radius: var(--radius);
  font-size: 13.5px;
  text-align: left;
  transition: all var(--transition);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.predefined-btn:hover {
  background: var(--color-primary-dim);
  border-color: var(--color-primary);
  transform: translateY(-2px);
  color: #fff;
}

.chatbot-msg-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 85%;
}

.chatbot-msg-wrapper.user {
  align-self: flex-end;
}

.chatbot-msg-wrapper.assistant {
  align-self: flex-start;
}

.chatbot-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.user .chatbot-bubble {
  background: var(--color-primary);
  color: #0f0f13;
  border-bottom-right-radius: 4px;
}

.assistant .chatbot-bubble {
  background: var(--color-bg-elevated);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-bottom-left-radius: 4px;
}

.chatbot-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.suggestion-tag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  background: var(--color-accent-dim);
  color: var(--color-accent);
  cursor: pointer;
  transition: all var(--transition);
}

.suggestion-tag:hover {
  background: var(--color-accent);
  color: white;
}

.chatbot-input-area {
  padding: 16px;
  background: var(--color-bg-elevated);
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 12px;
}

.chatbot-input {
  flex: 1;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 10px 16px;
  color: var(--color-text);
  font-size: 14px;
  transition: border-color var(--transition);
}

.chatbot-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.chatbot-send {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #0f0f13;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
}

.chatbot-send:hover:not(:disabled) {
  background: #90cdf4;
  transform: translateY(-2px);
}

.chatbot-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading animation */
.is-loading {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 16px;
}

.dot {
  width: 6px;
  height: 6px;
  background: var(--color-text-muted);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Transitions */
.chat-window-enter-active,
.chat-window-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-origin: bottom right;
}

.chat-window-enter-from,
.chat-window-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

@media (max-width: 480px) {
  .chatbot-window {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    max-height: none;
    border-radius: 0;
    z-index: 10000;
  }
  
  .chatbot-toggle {
    display: none;
  }
  
  .chatbot-wrapper {
    z-index: 10000;
  }
}
</style>
