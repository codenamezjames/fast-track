<script setup lang="ts">
interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  clickable?: boolean
}

withDefaults(defineProps<Props>(), {
  padding: 'md',
  clickable: false,
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
      { 'card--clickable': clickable }
    ]"
    @click="handleClick"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
}

.card--padding-none {
  padding: 0;
}

.card--padding-sm {
  padding: 0.75rem;
}

.card--padding-md {
  padding: 1.25rem;
}

.card--padding-lg {
  padding: 1.75rem;
}

.card--clickable {
  cursor: pointer;
}

.card--clickable:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card--clickable:active {
  transform: translateY(0);
}
</style>
