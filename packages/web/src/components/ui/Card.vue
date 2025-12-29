<script setup lang="ts">
interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  clickable?: boolean
  glass?: boolean
  gradient?: boolean
}

withDefaults(defineProps<Props>(), {
  padding: 'md',
  clickable: false,
  glass: false,
  gradient: false,
})

const emit = defineEmits<{
  click: []
}>()

function handleClick() {
  emit('click')
}
</script>

<template>
  <div
    :class="[
      'card',
      `card--padding-${padding}`,
      { 'card--clickable': clickable },
      { 'card--glass': glass },
      { 'card--gradient': gradient }
    ]"
    @click="handleClick"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
.card {
  background: var(--color-surface-variant);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(148, 163, 184, 0.2) 50%,
    transparent 100%
  );
  opacity: 0.5;
}

.card--gradient {
  background: var(--color-surface);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.card--glass {
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-backdrop-blur));
  -webkit-backdrop-filter: blur(var(--glass-backdrop-blur));
  border: 1px solid var(--glass-border);
}

.card--padding-none {
  padding: 0;
}

.card--padding-sm {
  padding: 1rem;
}

.card--padding-md {
  padding: 1.5rem;
}

.card--padding-lg {
  padding: 2rem;
}

.card--clickable {
  cursor: pointer;
}

.card--clickable:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-lg), 0 0 0 1px var(--color-primary);
  transform: translateY(-4px) scale(1.01);
}

.card--clickable:active {
  transform: translateY(-2px) scale(1.005);
}

@media (hover: none) {
  .card--clickable:hover {
    transform: none;
  }

  .card--clickable:active {
    transform: scale(0.98);
  }
}
</style>
