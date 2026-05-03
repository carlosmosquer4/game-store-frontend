<template>
  <footer class="footer">

    <!-- Contenido principal -->
    <div class="footer-main">
      <div class="container footer-grid">

        <!-- Columna marca -->
        <div class="footer-brand">
          <div class="brand-logo">
            <span class="brand-icon">🎮</span>
            <div>
              <p class="brand-name">Game Store</p>
              <p class="brand-city">Neiva</p>
            </div>
          </div>
          <p class="brand-desc">
            Tu tienda gamer de confianza en Neiva, Huila.
            Los mejores periféricos y accesorios gaming
            con envío a toda Colombia.
          </p>
          <div class="social-row">
            <a href="#" class="social-icon" title="Instagram">📷</a>
            <a href="#" class="social-icon" title="Facebook">📘</a>
            <a href="#" class="social-icon" title="Twitter">🐦</a>
            <a href="#" class="social-icon" title="YouTube">▶️</a>
          </div>
        </div>

        <!-- Columna catálogo -->
        <div class="footer-col">
          <h4 class="col-title">Catálogo</h4>
          <ul class="col-links">
            <li>
              <router-link to="/productos">Todos los productos</router-link>
            </li>
            <li>
              <router-link to="/productos?featured=true">
                Destacados
              </router-link>
            </li>
            <li>
              <router-link to="/productos?categoryId=1">
                Ratones Gamer
              </router-link>
            </li>
            <li>
              <router-link to="/productos?categoryId=2">
                Teclados Gamer
              </router-link>
            </li>
            <li>
              <router-link to="/productos?categoryId=3">
                Auriculares
              </router-link>
            </li>
            <li>
              <router-link to="/productos?categoryId=5">
                Monitores
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Columna cuenta -->
        <div class="footer-col">
          <h4 class="col-title">Mi Cuenta</h4>
          <ul class="col-links">
            <li>
              <router-link to="/login">Iniciar sesión</router-link>
            </li>
            <li>
              <router-link to="/registro">Crear cuenta</router-link>
            </li>
            <li>
              <router-link to="/pedidos">Mis pedidos</router-link>
            </li>
            <li>
              <router-link to="/perfil">Mi perfil</router-link>
            </li>
            <li>
              <router-link to="/carrito">Mi carrito</router-link>
            </li>
          </ul>
        </div>

        <!-- Columna info -->
        <div class="footer-col">
          <h4 class="col-title">Información</h4>
          <ul class="col-links">
            <li>
              <router-link to="/contacto">Contacto</router-link>
            </li>
            <li>
              <router-link to="/contacto">Devoluciones</router-link>
            </li>
            <li>
              <router-link to="/contacto">Garantías</router-link>
            </li>
            <li>
              <router-link to="/contacto">Envíos</router-link>
            </li>
          </ul>

          <!-- Contacto rápido -->
          <div class="quick-contact">
            <div class="qc-item">
              <span>📍</span>
              <span>Neiva, Huila</span>
            </div>
            <div class="qc-item">
              <span>📧</span>
              <span>soporte@gamestoreneiva.co</span>
            </div>
            <div class="qc-item">
              <span>🕐</span>
              <span>Lun–Sáb: 9am – 7pm</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Métodos de pago -->
    <div class="footer-payments">
      <div class="container payments-inner">
        <span class="payments-label">Métodos de pago:</span>
        <div class="payments-list">
          <span class="payment-badge">💳 Tarjeta</span>
          <span class="payment-badge">🏦 PSE</span>
          <span class="payment-badge">🅿️ PayPal</span>
          <span class="payment-badge">📦 Contraentrega</span>
          <span class="payment-badge">🔁 Transferencia</span>
        </div>
      </div>
    </div>

    <!-- Barra inferior -->
    <div class="footer-bottom">
      <div class="container bottom-inner">
        <span class="copyright">
          © {{ currentYear }} Game Store Neiva — Todos los derechos reservados
        </span>
        <span class="made-with">
          Hecho con ❤️ en Neiva, Huila
        </span>
      </div>
    </div>

  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  background: var(--color-bg-card);
  border-top: 1px solid var(--color-border);
  margin-top: auto;
}

/* Main */
.footer-main {
  padding: 56px 0 40px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.8fr 1fr 1fr 1.2fr;
  gap: 40px;
}

/* Marca */
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon {
  font-size: 28px;
}

.brand-name {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.brand-city {
  font-size: 11px;
  color: var(--color-text-muted);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.brand-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.8;
  max-width: 260px;
}

.social-row {
  display: flex;
  gap: 8px;
}

.social-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
}

.social-icon:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

/* Columnas */
.footer-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.col-title {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.col-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.col-links a {
  font-size: 13px;
  color: var(--color-text-muted);
  transition: color 0.2s, padding-left 0.2s;
  display: inline-block;
}

.col-links a:hover {
  color: var(--color-primary);
  padding-left: 4px;
}

/* Contacto rápido */
.quick-contact {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid var(--color-border);
  padding-top: 14px;
  margin-top: 4px;
}

.qc-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-muted);
}

/* Pagos */
.footer-payments {
  border-top: 1px solid var(--color-border);
  padding: 14px 0;
  background: rgba(0,0,0,0.15);
}

.payments-inner {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.payments-label {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.payments-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.payment-badge {
  font-size: 12px;
  padding: 4px 12px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  color: var(--color-text-light);
}

/* Bottom */
.footer-bottom {
  border-top: 1px solid var(--color-border);
  padding: 14px 0;
}

.bottom-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.copyright {
  font-size: 12px;
  color: var(--color-text-muted);
}

.made-with {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* Responsive */
@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
}

@media (max-width: 640px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .footer-main {
    padding: 36px 0 28px;
  }

  .bottom-inner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>