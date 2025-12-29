<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

withDefaults(defineProps<Props>(), {
  size: 'md',
})
</script>

<template>
  <div :class="['spinner', `spinner--${size}`]" :style="{ borderTopColor: color }"></div>
</template>

<style scoped>
.spinner {
  border: 3px solid var(--color-surface-variant);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner--sm {
  width: 1rem;
  height: 1rem;
  border-width: 2px;
}

.spinner--md {
  width: 2rem;
  height: 2rem;
  border-width: 3px;
}

.spinner--lg {
  width: 3rem;
  height: 3rem;
  border-width: 4px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
