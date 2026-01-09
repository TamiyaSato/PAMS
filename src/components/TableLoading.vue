<script setup lang="ts">
interface Props {
  loading?: boolean
  message?: string
  height?: string
}

withDefaults(defineProps<Props>(), {
  loading: false,
  message: 'Loading...',
  height: '480px',
})
</script>

<template>
  <div style="position: relative" :style="{ height }">
    <slot />
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <v-progress-circular indeterminate color="#0d6efd" size="48"></v-progress-circular>
        <p>{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  z-index: 10;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner p {
  margin: 0;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}
</style>
