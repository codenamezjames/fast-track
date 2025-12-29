<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false,
  type: 'button',
})

const buttonClasses = computed(() => {
  const classes = ['button']

  // Variant classes
  classes.push(`button--${props.variant}`)

  // Size classes
  classes.push(`button--${props.size}`)

  // State classes
  if (props.disabled || props.loading) {
    classes.push('button--disabled')
  }

  if (props.fullWidth) {
    classes.push('button--full-width')
  }

  return classes.join(' ')
})
</script>

<template>
  <button :type="type" :class="buttonClasses" :disabled="disabled || loading">
    <span v-if="loading" class="button__spinner"></span>
    <span :class="{ 'button__content--loading': loading }">
      <slot></slot>
    </span>
  </button>
</template>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  font-family: inherit;
  position: relative;
  white-space: nowrap;
}

.button:active:not(.button--disabled) {
  transform: scale(0.98);
}

/* Sizes */
.button--sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.button--md {
  padding: 0.625rem 1.25rem;
  font-size: 1rem;
}

.button--lg {
  padding: 0.875rem 1.75rem;
  font-size: 1.125rem;
}

/* Variants */
.button--primary {
  background: var(--color-primary);
  color: white;
}

.button--primary:hover:not(.button--disabled) {
  background: var(--color-primary-dark);
}

.button--secondary {
  background: var(--color-secondary);
  color: white;
}

.button--secondary:hover:not(.button--disabled) {
  background: var(--color-secondary-dark);
}

.button--danger {
  background: var(--color-error);
  color: white;
}

.button--danger:hover:not(.button--disabled) {
  background: #dc2626;
}

.button--ghost {
  background: transparent;
  color: var(--color-text-primary);
}

.button--ghost:hover:not(.button--disabled) {
  background: var(--color-surface);
}

.button--outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-border);
}

.button--outline:hover:not(.button--disabled) {
  background: var(--color-surface);
  border-color: var(--color-primary);
}

/* States */
.button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.button--full-width {
  width: 100%;
}

/* Loading spinner */
.button__spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.button__content--loading {
  opacity: 0;
}
</style>
