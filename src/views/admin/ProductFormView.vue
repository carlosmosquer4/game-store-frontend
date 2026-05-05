<template>
  <div class="form-view">
    <div class="container">

      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <router-link to="/admin" class="back-btn">
            ← Volver al panel
          </router-link>
          <h1 class="page-title">
            {{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}
          </h1>
        </div>
      </div>

      <!-- Loading inicial (cuando edita) -->
      <div class="loading-state" v-if="loadingProduct">
        <div class="spinner"></div>
        <span>Cargando producto...</span>
      </div>

      <!-- Formulario -->
      <div class="form-layout" v-else>

        <!-- Columna principal -->
        <div class="form-main">

          <!-- Información básica -->
          <div class="form-section">
            <h3 class="section-title">📋 Información básica</h3>

            <div class="field-group">
              <label class="field-label">Nombre del producto *</label>
              <input
                v-model="form.name"
                placeholder="Ej: Mouse Gamer Logitech G502"
                class="input"
                required
              />
            </div>

            <div class="field-group">
              <label class="field-label">Descripción</label>
              <textarea
                v-model="form.description"
                placeholder="Describe el producto..."
                class="input"
                rows="4"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="field-group">
                <label class="field-label">Marca</label>
                <input
                  v-model="form.brand"
                  placeholder="Ej: Logitech"
                  class="input"
                />
              </div>
              <div class="field-group">
                <label class="field-label">Color</label>
                <input
                  v-model="form.color"
                  placeholder="Ej: Negro"
                  class="input"
                />
              </div>
            </div>

          </div>

          <!-- Precio y stock -->
          <div class="form-section">
            <h3 class="section-title">💰 Precio y stock</h3>

            <div class="form-row">
              <div class="field-group">
                <label class="field-label">Precio (COP) *</label>
                <input
                  v-model.number="form.price"
                  type="number"
                  placeholder="Ej: 150000"
                  class="input"
                  min="0"
                  required
                />
              </div>
              <div class="field-group">
                <label class="field-label">Precio original (opcional)</label>
                <input
                  v-model.number="form.originalPrice"
                  type="number"
                  placeholder="Ej: 200000"
                  class="input"
                  min="0"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="field-group">
                <label class="field-label">Stock *</label>
                <input
                  v-model.number="form.stock"
                  type="number"
                  placeholder="Ej: 50"
                  class="input"
                  min="0"
                  required
                />
              </div>
              <div class="field-group">
                <label class="field-label">Descuento (%)</label>
                <input
                  v-model.number="form.discountPercentage"
                  type="number"
                  placeholder="Ej: 20"
                  class="input"
                  min="0"
                  max="100"
                />
              </div>
            </div>

          </div>

          <!-- Especificaciones -->
          <div class="form-section">
            <h3 class="section-title">🔧 Especificaciones técnicas</h3>
            <p class="section-desc">
              Agrega las especificaciones como pares clave — valor
            </p>

            <div
              v-for="(spec, index) in specs"
              :key="index"
              class="spec-row"
            >
              <input
                v-model="spec.key"
                placeholder="Ej: Sensor"
                class="input"
              />
              <span class="spec-sep">:</span>
              <input
                v-model="spec.value"
                placeholder="Ej: HERO 25K"
                class="input"
              />
              <button
                class="spec-remove"
                @click="removeSpec(index)"
                title="Eliminar"
              >✕</button>
            </div>

            <button
              class="btn btn-outline add-spec-btn"
              @click="addSpec"
            >
              + Agregar especificación
            </button>

          </div>

        </div>

        <!-- Columna lateral -->
        <div class="form-sidebar">

          <!-- Imagen -->
          <div class="form-section">
            <h3 class="section-title">🖼️ Imagen</h3>

            <div class="field-group">
              <label class="field-label">URL de la imagen *</label>
              <input
                v-model="form.imageUrl"
                placeholder="https://..."
                class="input"
                @input="previewUrl = form.imageUrl"
              />
            </div>

            <!-- Preview de imagen -->
            <div class="img-preview" v-if="previewUrl">
              <img
                :src="previewUrl"
                alt="Preview"
                @error="e => { e.target.onerror = null; previewUrl = '' }"
              />
            </div>
            <div class="img-placeholder" v-else>
              <span>Sin imagen</span>
            </div>

          </div>

          <!-- Categoría y opciones -->
          <div class="form-section">
            <h3 class="section-title">⚙️ Opciones</h3>

            <div class="field-group">
              <label class="field-label">Categoría *</label>
              <select v-model.number="form.categoryId" class="input" required>
                <option value="">Selecciona categoría</option>
                <option
                  v-for="cat in categories"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div class="field-group">
              <label class="field-label">Proveedor</label>
              <input
                v-model="form.supplier"
                placeholder="Ej: Logitech Colombia"
                class="input"
              />
            </div>

            <!-- Toggle destacado -->
            <label class="toggle-wrap">
              <input
                type="checkbox"
                v-model="form.featured"
                class="toggle-input"
              />
              <span class="toggle-track"></span>
              <span class="toggle-text">⭐ Producto destacado</span>
            </label>

            <!-- Toggle activo (solo edición) -->
            <label class="toggle-wrap" v-if="isEditing">
              <input
                type="checkbox"
                v-model="form.active"
                class="toggle-input"
              />
              <span class="toggle-track"></span>
              <span class="toggle-text">✅ Producto activo</span>
            </label>

          </div>

          <!-- Error y botón -->
          <div class="alert alert-error" v-if="errorMsg">
            {{ errorMsg }}
          </div>

          <div class="alert alert-success" v-if="successMsg">
            {{ successMsg }}
          </div>

          <button
            class="btn btn-primary save-btn"
            @click="handleSubmit"
            :disabled="saving || !isFormValid"
          >
            {{ saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto' }}
          </button>

          <router-link to="/admin" class="btn btn-outline cancel-btn">
            Cancelar
          </router-link>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productsApi, categoriesApi } from '../../services/api'
import api from '../../services/api'

const route = useRoute()
const router = useRouter()

// ─── ESTADO ──────────────────────────────────────────────
const loadingProduct = ref(false)
const saving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const categories = ref([])
const previewUrl = ref('')

// Detectar si estamos editando o creando
const isEditing = computed(() => !!route.params.id)

// Especificaciones como array para el formulario
const specs = ref([{ key: '', value: '' }])

const form = reactive({
  name: '',
  description: '',
  brand: '',
  color: '',
  price: null,
  originalPrice: null,
  stock: null,
  discountPercentage: null,
  imageUrl: '',
  categoryId: '',
  supplier: '',
  featured: false,
  active: true,
})

// ─── COMPUTED ────────────────────────────────────────────
const isFormValid = computed(() => {
  return form.name &&
    form.price > 0 &&
    form.stock >= 0 &&
    form.categoryId &&
    form.imageUrl
})

// ─── SPECS ───────────────────────────────────────────────
function addSpec() {
  specs.value.push({ key: '', value: '' })
}

function removeSpec(index) {
  specs.value.splice(index, 1)
}

// Convierte el array de specs a objeto para el backend
function buildSpecsObject() {
  const obj = {}
  specs.value.forEach(s => {
    if (s.key.trim() && s.value.trim()) {
      obj[s.key.trim()] = s.value.trim()
    }
  })
  return Object.keys(obj).length > 0 ? obj : null
}

// Convierte el objeto de specs del backend al array
function parseSpecs(specsObj) {
  if (!specsObj) return [{ key: '', value: '' }]
  return Object.entries(specsObj).map(([key, value]) => ({ key, value }))
}

// ─── CARGAR PRODUCTO (edición) ───────────────────────────
async function loadProduct() {
  if (!isEditing.value) return
  loadingProduct.value = true
  try {
    const res = await productsApi.getById(route.params.id)
    const p = res.data.data.product

    // Llenar el formulario con los datos del producto
    form.name = p.name || ''
    form.description = p.description || ''
    form.brand = p.brand || ''
    form.color = p.color || ''
    form.price = p.price
    form.originalPrice = p.originalPrice || null
    form.stock = p.stock
    form.discountPercentage = p.discountPercentage || null
    form.imageUrl = p.imageUrl || ''
    form.categoryId = p.categoryId
    form.supplier = p.supplier || ''
    form.featured = p.featured || false
    form.active = p.active !== false

    previewUrl.value = p.imageUrl || ''
    specs.value = parseSpecs(p.specifications)

  } catch (err) {
    errorMsg.value = 'Error al cargar el producto'
  } finally {
    loadingProduct.value = false
  }
}

// ─── GUARDAR ─────────────────────────────────────────────
async function handleSubmit() {
  if (!isFormValid.value) return
  saving.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    // Construir payload
    const payload = {
      name: form.name,
      description: form.description || undefined,
      brand: form.brand || undefined,
      color: form.color || undefined,
      price: form.price,
      stock: form.stock,
      categoryId: form.categoryId,
      imageUrl: form.imageUrl,
      featured: form.featured,
    }

    if (form.originalPrice) payload.originalPrice = form.originalPrice
    if (form.discountPercentage) payload.discountPercentage = form.discountPercentage
    if (form.supplier) payload.supplier = form.supplier
    if (isEditing.value) payload.active = form.active

    const specsObj = buildSpecsObject()
    if (specsObj) payload.specifications = specsObj

    if (isEditing.value) {
      await api.put(`/products/${route.params.id}`, payload)
      successMsg.value = '✅ Producto actualizado correctamente'
    } else {
      await api.post('/products', payload)
      successMsg.value = '✅ Producto creado correctamente'
      // Redirigir al panel después de crear
      setTimeout(() => router.push('/admin'), 1500)
    }

  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Error al guardar el producto'
  } finally {
    saving.value = false
  }
}

// ─── LIFECYCLE ───────────────────────────────────────────
onMounted(async () => {
  const [_, catRes] = await Promise.all([
    loadProduct(),
    categoriesApi.getAll()
  ])
  categories.value = catRes.data.data.categories
})
</script>

<style scoped>
.form-view {
  min-height: 100vh;
  padding-bottom: 60px;
}

.page-header {
  padding: 24px 0 20px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 28px;
}

.back-btn {
  display: inline-block;
  font-size: 13px;
  color: var(--color-primary);
  margin-bottom: 8px;
  transition: opacity 0.2s;
}

.back-btn:hover {
  opacity: 0.7;
}

.page-title {
  font-family: var(--font-display);
  font-size: clamp(20px, 4vw, 28px);
  font-weight: 700;
}

/* Layout */
.form-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  align-items: start;
}

/* Secciones */
.form-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.section-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: -8px;
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

textarea.input {
  resize: vertical;
  min-height: 100px;
}

/* Specs */
.spec-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spec-row .input {
  flex: 1;
}

.spec-sep {
  color: var(--color-text-muted);
  flex-shrink: 0;
  font-weight: 700;
}

.spec-remove {
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
  color: var(--color-text-muted);
  font-size: 12px;
  flex-shrink: 0;
  transition: all 0.2s;
}

.spec-remove:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
  background: rgba(252, 129, 129, 0.1);
}

.add-spec-btn {
  align-self: flex-start;
  font-size: 13px;
  padding: 7px 16px;
}

/* Sidebar */
.form-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 90px;
}

/* Preview imagen */
.img-preview {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
}

.img-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 12px;
}

.img-placeholder {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius);
  background: var(--color-bg-elevated);
  border: 2px dashed var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 14px;
}

/* Toggle */
.toggle-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.toggle-input { display: none; }

.toggle-track {
  width: 38px;
  height: 20px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  position: relative;
  transition: all 0.3s;
  flex-shrink: 0;
}

.toggle-track::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 12px;
  height: 12px;
  background: var(--color-text-muted);
  border-radius: 50%;
  transition: all 0.3s;
}

.toggle-input:checked + .toggle-track {
  background: var(--color-primary-dim);
  border-color: var(--color-primary);
}

.toggle-input:checked + .toggle-track::after {
  background: var(--color-primary);
  transform: translateX(18px);
}

.toggle-text {
  font-size: 14px;
  color: var(--color-text-light);
}

/* Botones */
.save-btn {
  width: 100%;
  padding: 13px;
  font-size: 15px;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.cancel-btn {
  width: 100%;
  justify-content: center;
}

/* Responsive */
@media (max-width: 900px) {
  .form-layout {
    grid-template-columns: 1fr;
  }

  .form-sidebar {
    position: static;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>