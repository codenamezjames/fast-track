<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { User, LogOut } from 'lucide-vue-next'
import BottomNav from './BottomNav.vue'

const router = useRouter()
const authStore = useAuthStore()

function goToProfile() {
  router.push('/profile')
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="main-layout">
    <header class="main-layout__header">
      <div class="header__content">
        <h1 class="header__title">Fast Track</h1>

        <div class="header__actions">
          <button class="header__action" @click="goToProfile" aria-label="Profile">
            <User :size="20" />
          </button>
          <button class="header__action" @click="handleLogout" aria-label="Logout">
            <LogOut :size="20" />
          </button>
        </div>
      </div>
    </header>

    <main class="main-layout__content">
      <slot></slot>
    </main>

    <BottomNav />
  </div>
</template>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
}

.main-layout__header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 1rem;
}

.header__content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
}

.header__actions {
  display: flex;
  gap: 0.5rem;
}

.header__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.header__action:hover {
  background: var(--color-surface-variant);
  color: var(--color-text-primary);
}

.header__action:active {
  transform: scale(0.95);
}

.main-layout__content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  padding-bottom: calc(4rem + env(safe-area-inset-bottom));
}

/* Desktop adjustments */
@media (min-width: 768px) {
  .main-layout__content {
    padding-bottom: 1.5rem;
  }
}
</style>
