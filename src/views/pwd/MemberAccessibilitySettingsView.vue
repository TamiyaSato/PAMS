<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const STORAGE_KEY = 'accessibility-settings'

const fontSize = ref<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md')
type FontSizeValue = typeof fontSize.value
const fontSizes: { label: string; value: FontSizeValue }[] = [
  { label: 'A--', value: 'xs' },
  { label: 'A-', value: 'sm' },
  { label: 'Normal', value: 'md' },
  { label: 'A+', value: 'lg' },
  { label: 'A++', value: 'xl' },
]

const theme = ref<'default' | 'dark' | 'high-contrast'>('default')

const highlightFocus = ref(true)

const previewRef = ref<HTMLDivElement | null>(null)

function applyPreview() {
  if (!previewRef.value) return
  previewRef.value.setAttribute('data-font-size', fontSize.value)
  previewRef.value.setAttribute('data-theme', theme.value)
  previewRef.value.classList.toggle('focus-highlight', highlightFocus.value)
}

function applyFontSize(size: string) {
  document.documentElement.setAttribute('data-font-size', size)
}

function applyTheme(value: string) {
  document.documentElement.setAttribute('data-theme', value)
}

function applyFocusHighlight(enabled: boolean) {
  document.documentElement.classList.toggle('focus-highlight', enabled)
}

function saveSettings() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      fontSize: fontSize.value,
      theme: theme.value,
      highlightFocus: highlightFocus.value,
    }),
  )
}

watch([fontSize, theme, highlightFocus], () => {
  applyPreview()
  applyFontSize(fontSize.value)
  applyTheme(theme.value)
  applyFocusHighlight(highlightFocus.value)
  saveSettings()
})

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    const parsed = JSON.parse(saved)
    fontSize.value = (parsed.fontSize ?? 'md') as typeof fontSize.value
    theme.value = (parsed.theme ?? 'default') as typeof theme.value
    highlightFocus.value = parsed.highlightFocus ?? true
  }
  applyPreview()
  applyFontSize(fontSize.value)
  applyTheme(theme.value)
  applyFocusHighlight(highlightFocus.value)
})

function resetSettings() {
  fontSize.value = 'md'
  theme.value = 'default'
  highlightFocus.value = true
  localStorage.removeItem(STORAGE_KEY)
  applyPreview()
  applyFontSize(fontSize.value)
  applyTheme(theme.value)
  applyFocusHighlight(highlightFocus.value)
}
</script>

<template>
  <div class="member-settings">
    <header class="page-header">
      <h1>Accessibility Settings</h1>
    </header>

    <section class="settings-card">
      <div class="preview" ref="previewRef">
        <h2>Live Preview</h2>
        <p>This is a sample paragraph to preview font size, theme, and focus highlight.</p>
        <div class="preview-controls">
          <button class="preview-btn">Sample Button</button>
          <input class="preview-input" placeholder="Sample input" />
        </div>
      </div>

      <div class="subtitle">
        <h2>Customize your viewing experience to suit your needs.</h2>
      </div>

      <div class="section">
        <h2>Visual Adjustments</h2>
        <div class="font-size">
          <label>Font Size</label>
          <div class="button-group">
            <button
              v-for="size in fontSizes"
              :key="size.value"
              :class="{ active: fontSize === size.value }"
              @click="fontSize = size.value"
            >
              {{ size.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Color & Contrast</h2>
        <div class="button-group">
          <button
            class="theme-btn default"
            :class="{ active: theme === 'default' }"
            @click="theme = 'default'"
          >
            Default
          </button>
          <button
            class="theme-btn dark"
            :class="{ active: theme === 'dark' }"
            @click="theme = 'dark'"
          >
            Dark
          </button>
          <button
            class="theme-btn contrast"
            :class="{ active: theme === 'high-contrast' }"
            @click="theme = 'high-contrast'"
          >
            High Contrast
          </button>
        </div>
      </div>

      <div class="section">
        <h2><span class="icon">⤢</span>Navigation Focus</h2>
        <div class="toggle-row">
          <span>Highlight focus (thick border on hover/focus)</span>
          <label class="switch">
            <input type="checkbox" v-model="highlightFocus" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <button class="reset" @click="resetSettings">Reset all settings to default</button>
    </section>
  </div>
</template>

<style scoped>
.member-settings {
  padding: 24px;
  min-height: 100vh;
  background: #f4f8fb;
}

.page-header h1 {
  margin: 0;
}

.settings-card {
  font-size: 20px;
  background: #fff;
  border-radius: 20px;
  padding: 50px;
  margin-top: 50px;
  max-width: 1000px;
}

.preview {
  border: 1px dashed #ccc;
  padding: 20px;
  margin-bottom: 30px;
  border-radius: 14px;
  text-align: center;
  transition: all 0.3s;
}
.preview[data-font-size='xs'] {
  font-size: 12px;
}
.preview[data-font-size='sm'] {
  font-size: 14px;
}
.preview[data-font-size='md'] {
  font-size: 16px;
}
.preview[data-font-size='lg'] {
  font-size: 18px;
}
.preview[data-font-size='xl'] {
  font-size: 20px;
}

.preview[data-theme='default'] {
  background: #fff;
  color: #000;
}
.preview[data-theme='dark'] {
  background: #333;
  color: #fff;
}
.preview[data-theme='high-contrast'] {
  background: #000;
  color: #ff0;
}

.preview.focus-highlight button,
.preview.focus-highlight input {
  outline: 3px solid red;
}

.preview-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.preview-btn {
  padding: 6px 16px;
  border-radius: 8px;
  border: none;
  background: #1e88e5;
  color: #fff;
  cursor: pointer;
}

.preview-input {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  width: 180px;
  text-align: center;
}

.subtitle {
  margin-bottom: 24px;
  font-size: 15px;
}
.section {
  margin-bottom: 28px;
}
.section h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  margin-bottom: 12px;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

button {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: #f3f3f3;
  cursor: pointer;
}

button.active {
  border-color: #1e88e5;
  background: #e3f2fd;
}
.theme-btn.dark {
  background: #333;
  color: #fff;
}
.theme-btn.contrast {
  background: #ffb300;
  color: #000;
}

.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.switch {
  position: relative;
  width: 46px;
  height: 24px;
}
.switch input {
  display: none;
}
.slider {
  position: absolute;
  inset: 0;
  background: #ccc;
  border-radius: 24px;
  transition: 0.3s;
}
.slider::before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: 0.3s;
}
input:checked + .slider {
  background: #2e7d32;
}
input:checked + .slider::before {
  transform: translateX(22px);
}

.reset {
  margin-top: 12px;
  background: none;
  color: #1e88e5;
  border: none;
  padding: 0;
  cursor: pointer;
}
</style>
