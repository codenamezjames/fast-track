<script setup lang="ts">
interface Props {
  variant?: 'solid' | 'ghost'
  color?: 'primary' | 'secondary' | 'danger' | 'orange' | 'red' | 'blue' | 'purple'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'ghost',
  color: 'primary',
  size: 'md',
  disabled: false,
})
</script>

<template>
  <button
    :class="[
      'icon-button',
      `icon-button--${variant}`,
      `icon-button--${color}`,
      `icon-button--${size}`,
    ]"
    :disabled="disabled"
    :aria-label="ariaLabel"
    type="button"
  >
    <slot></slot>
  </button>
</template>

<style scoped>
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.icon-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon-button:active:not(:disabled) {
  transform: scale(0.95);
}

/* Sizes */
.icon-button--sm {
  width: 2rem;
  height: 2rem;
}

.icon-button--md {
  width: 2.5rem;
  height: 2.5rem;
}

.icon-button--lg {
  width: 3rem;
  height: 3rem;
}

/* Solid variant */
.icon-button--solid.icon-button--primary {
  background: var(--color-primary);
  color: white;
}

.icon-button--solid.icon-button--primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.icon-button--solid.icon-button--secondary {
  background: var(--color-secondary);
  color: white;
}

.icon-button--solid.icon-button--secondary:hover:not(:disabled) {
  background: var(--color-secondary-dark);
}

.icon-button--solid.icon-button--danger {
  background: var(--color-error);
  color: white;
}

.icon-button--solid.icon-button--danger:hover:not(:disabled) {
  background: #dc2626;
}

.icon-button--solid.icon-button--orange {
  background: var(--color-meals);
  color: white;
}

.icon-button--solid.icon-button--orange:hover:not(:disabled) {
  background: #ea580c;
}

.icon-button--solid.icon-button--red {
  background: var(--color-workouts);
  color: white;
}

.icon-button--solid.icon-button--red:hover:not(:disabled) {
  background: #dc2626;
}

.icon-button--solid.icon-button--blue {
  background: var(--color-activity);
  color: white;
}

.icon-button--solid.icon-button--blue:hover:not(:disabled) {
  background: #2563eb;
}

.icon-button--solid.icon-button--purple {
  background: var(--color-fasting);
  color: white;
}

.icon-button--solid.icon-button--purple:hover:not(:disabled) {
  background: #7c3aed;
}

/* Ghost variant */
.icon-button--ghost {
  background: transparent;
  color: var(--color-text-secondary);
}

.icon-button--ghost:hover:not(:disabled) {
  background: var(--color-surface-variant);
  color: var(--color-text-primary);
}

.icon-button--ghost.icon-button--primary:hover:not(:disabled) {
  color: var(--color-primary);
}

.icon-button--ghost.icon-button--secondary:hover:not(:disabled) {
  color: var(--color-secondary);
}

.icon-button--ghost.icon-button--danger:hover:not(:disabled) {
  color: var(--color-error);
}

.icon-button--ghost.icon-button--orange:hover:not(:disabled) {
  color: var(--color-meals);
}

.icon-button--ghost.icon-button--red:hover:not(:disabled) {
  color: var(--color-workouts);
}

.icon-button--ghost.icon-button--blue:hover:not(:disabled) {
  color: var(--color-activity);
}

.icon-button--ghost.icon-button--purple:hover:not(:disabled) {
  color: var(--color-fasting);
}
</style>
