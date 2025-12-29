<script setup lang="ts">
interface Props {
  title: string
  description?: string
  icon?: any
  actionText?: string
}

defineProps<Props>()

const emit = defineEmits<{
  action: []
}>()

function handleAction() {
  emit('action')
}
</script>

<template>
  <div class="empty-state">
    <div v-if="icon" class="empty-state__icon">
      <component :is="icon" :size="48" :stroke-width="1.5" />
    </div>

    <h3 class="empty-state__title">{{ title }}</h3>

    <p v-if="description" class="empty-state__description">{{ description }}</p>

    <slot name="action">
      <button v-if="actionText" class="empty-state__action" @click="handleAction">
        {{ actionText }}
      </button>
    </slot>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1.5rem;
  min-height: 300px;
}

.empty-state__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background: var(--color-surface-variant);
  border-radius: var(--radius-full);
  color: var(--color-text-disabled);
  margin-bottom: 1.5rem;
}

.empty-state__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-state__description {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0 0 1.5rem 0;
  max-width: 400px;
}

.empty-state__action {
  padding: 0.625rem 1.25rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-primary);
  background: transparent;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-state__action:hover {
  background: var(--color-primary);
  color: white;
}
</style>
