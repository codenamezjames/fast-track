<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
})
</script>

<template>
  <span :class="['badge', `badge--${variant}`, `badge--${size}`]">
    <slot></slot>
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

/* Sizes */
.badge--sm {
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
}

.badge--md {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

/* Variants */
.badge--primary {
  background: rgba(25, 118, 210, 0.15);
  color: var(--color-primary-light);
}

.badge--secondary {
  background: rgba(38, 166, 154, 0.15);
  color: var(--color-secondary-light);
}

.badge--success {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
}

.badge--warning {
  background: rgba(245, 158, 11, 0.15);
  color: var(--color-warning);
}

.badge--error {
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-error);
}

.badge--info {
  background: rgba(59, 130, 246, 0.15);
  color: var(--color-info);
}
</style>
