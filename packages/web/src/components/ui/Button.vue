<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'gradient' | 'meals' | 'workouts' | 'activity' | 'fasting'
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
  gap: 0.625rem;
  font-weight: 600;
  border-radius: var(--radius-lg);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  border: none;
  font-family: inherit;
  position: relative;
  white-space: nowrap;
  letter-spacing: 0.01em;
  box-shadow: var(--shadow-sm);
}

.button:active:not(.button--disabled) {
  transform: scale(0.96);
}

/* Sizes */
.button--sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  min-height: 2rem;
}

.button--md {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  min-height: 2.75rem;
}

.button--lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  min-height: 3.25rem;
}

/* Variants */
.button--primary {
  background: var(--color-primary);
  color: #0d0d0d;
  box-shadow: var(--shadow-md), 0 0 0 0 var(--color-primary-glow);
}

.button--primary:hover:not(.button--disabled) {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-lg), 0 0 20px var(--color-primary-glow);
  transform: translateY(-2px);
}

.button--gradient {
  background: var(--color-primary-gradient);
  color: #0d0d0d;
  box-shadow: var(--shadow-md), 0 0 0 0 var(--color-primary-glow);
  position: relative;
  overflow: hidden;
}

.button--gradient::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.button--gradient:hover:not(.button--disabled)::before {
  opacity: 1;
}

.button--gradient:hover:not(.button--disabled) {
  box-shadow: var(--shadow-xl), 0 0 30px var(--color-primary-glow);
  transform: translateY(-2px);
}

.button--secondary {
  background: var(--color-secondary);
  color: white;
  box-shadow: var(--shadow-md);
}

.button--secondary:hover:not(.button--disabled) {
  background: var(--color-secondary-dark);
  box-shadow: var(--shadow-lg), 0 0 20px var(--color-success-glow);
  transform: translateY(-2px);
}

.button--danger {
  background: var(--color-error);
  color: white;
  box-shadow: var(--shadow-md);
}

.button--danger:hover:not(.button--disabled) {
  background: #dc2626;
  box-shadow: var(--shadow-lg), 0 0 20px var(--color-error-glow);
  transform: translateY(-2px);
}

.button--ghost {
  background: transparent;
  color: var(--color-text-primary);
  box-shadow: none;
}

.button--ghost:hover:not(.button--disabled) {
  background: var(--color-surface-variant);
}

.button--outline {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-border);
  box-shadow: none;
}

.button--outline:hover:not(.button--disabled) {
  background: var(--color-surface-variant);
  border-color: var(--color-primary);
  box-shadow: 0 0 20px var(--color-primary-glow);
}

/* Section-specific variants */
.button--meals {
  background: var(--color-meals);
  color: #0d0d0d;
  box-shadow: var(--shadow-md);
}

.button--meals:hover:not(.button--disabled) {
  background: linear-gradient(135deg, #ff9500 0%, #ffaa33 100%);
  box-shadow: var(--shadow-lg), 0 0 20px rgba(255, 149, 0, 0.4);
  transform: translateY(-2px);
}

.button--workouts {
  background: var(--color-workouts);
  color: white;
  box-shadow: var(--shadow-md);
}

.button--workouts:hover:not(.button--disabled) {
  background: linear-gradient(135deg, #ff3366 0%, #ff5588 100%);
  box-shadow: var(--shadow-lg), 0 0 20px rgba(255, 51, 102, 0.4);
  transform: translateY(-2px);
}

.button--activity {
  background: var(--color-activity);
  color: #0d0d0d;
  box-shadow: var(--shadow-md);
}

.button--activity:hover:not(.button--disabled) {
  background: linear-gradient(135deg, #00ccff 0%, #33ddff 100%);
  box-shadow: var(--shadow-lg), 0 0 20px rgba(0, 204, 255, 0.4);
  transform: translateY(-2px);
}

.button--fasting {
  background: var(--color-fasting);
  color: white;
  box-shadow: var(--shadow-md);
}

.button--fasting:hover:not(.button--disabled) {
  background: linear-gradient(135deg, #cc00ff 0%, #dd33ff 100%);
  box-shadow: var(--shadow-lg), 0 0 20px rgba(204, 0, 255, 0.4);
  transform: translateY(-2px);
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
  width: 1.125rem;
  height: 1.125rem;
  border: 2.5px solid currentColor;
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

/* Touch device optimizations */
@media (hover: none) {
  .button:hover:not(.button--disabled) {
    transform: none;
  }
}
</style>
