<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, Utensils, Dumbbell, Activity, Timer } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

interface NavItem {
  name: string
  path: string
  icon: any
  label: string
}

const navItems: NavItem[] = [
  { name: 'dashboard', path: '/', icon: Home, label: 'Home' },
  { name: 'meals', path: '/meals', icon: Utensils, label: 'Meals' },
  { name: 'workouts', path: '/workouts', icon: Dumbbell, label: 'Workouts' },
  { name: 'activity', path: '/activity', icon: Activity, label: 'Activity' },
  { name: 'fasting', path: '/fasting', icon: Timer, label: 'Fasting' },
]

const isActive = computed(() => (path: string) => {
  return route.path === path
})

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <nav class="bottom-nav">
    <button
      v-for="item in navItems"
      :key="item.name"
      :class="['bottom-nav__item', { 'bottom-nav__item--active': isActive(item.path) }]"
      @click="navigate(item.path)"
    >
      <component :is="item.icon" :size="24" :stroke-width="isActive(item.path) ? 2.5 : 2" />
      <span class="bottom-nav__label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 0.5rem 0;
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  z-index: 100;
}

.bottom-nav__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: var(--color-text-disabled);
  cursor: pointer;
  transition: all 0.2s ease;
}

.bottom-nav__item:active {
  transform: scale(0.95);
}

.bottom-nav__item--active {
  color: var(--color-primary);
}

.bottom-nav__label {
  font-size: 0.75rem;
  font-weight: 500;
}

/* Desktop - hide bottom nav */
@media (min-width: 768px) {
  .bottom-nav {
    display: none;
  }
}
</style>
