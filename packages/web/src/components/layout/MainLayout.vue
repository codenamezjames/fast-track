<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { User, LogOut, Zap } from 'lucide-vue-next'
import BottomNav from './BottomNav.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Determine current section color based on route
const sectionConfig = computed(() => {
  const path = route.path

  if (path.includes('/meals')) {
    return {
      color: '#ff9500',
      gradient: 'linear-gradient(135deg, #ff9500 0%, #ffaa33 100%)',
      textGradient: 'linear-gradient(135deg, #ffffff 0%, #ff9500 100%)',
      glow: 'rgba(255, 149, 0, 0.4)',
    }
  } else if (path.includes('/workouts')) {
    return {
      color: '#ff3366',
      gradient: 'linear-gradient(135deg, #ff3366 0%, #ff5588 100%)',
      textGradient: 'linear-gradient(135deg, #ffffff 0%, #ff3366 100%)',
      glow: 'rgba(255, 51, 102, 0.4)',
    }
  } else if (path.includes('/activity')) {
    return {
      color: '#00ccff',
      gradient: 'linear-gradient(135deg, #00ccff 0%, #33ddff 100%)',
      textGradient: 'linear-gradient(135deg, #ffffff 0%, #00ccff 100%)',
      glow: 'rgba(0, 204, 255, 0.4)',
    }
  } else if (path.includes('/fasting')) {
    return {
      color: '#cc00ff',
      gradient: 'linear-gradient(135deg, #cc00ff 0%, #dd33ff 100%)',
      textGradient: 'linear-gradient(135deg, #ffffff 0%, #cc00ff 100%)',
      glow: 'rgba(204, 0, 255, 0.4)',
    }
  }

  // Default (home/dashboard)
  return {
    color: '#c0ff00',
    gradient: 'linear-gradient(135deg, #c0ff00 0%, #7fff00 100%)',
    textGradient: 'linear-gradient(135deg, #ffffff 0%, #c0ff00 100%)',
    glow: 'rgba(192, 255, 0, 0.4)',
  }
})

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
        <div class="header__brand">
          <div
            class="header__logo"
            :style="{
              background: sectionConfig.gradient,
              boxShadow: `0 0 20px ${sectionConfig.glow}`,
            }"
          >
            <Zap :size="24" class="header__logo-icon" />
          </div>
          <h1
            class="header__title"
            :style="{
              background: sectionConfig.textGradient,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }"
          >
            Fast Track
          </h1>
        </div>

        <div class="header__actions">
          <button class="header__action" @click="goToProfile" aria-label="Profile">
            <User :size="20" />
          </button>
          <button class="header__action header__action--logout" @click="handleLogout" aria-label="Logout">
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
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-backdrop-blur));
  -webkit-backdrop-filter: blur(var(--glass-backdrop-blur));
  border-bottom: 1px solid var(--glass-border);
  padding: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
}

.header__content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header__logo {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.header__logo-icon {
  color: #0d0d0d;
}

.header__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  transition: all 0.3s ease;
}

.header__actions {
  display: flex;
  gap: 0.5rem;
}

.header__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  background: var(--color-surface-variant);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-lg);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.header__action:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 0 20px var(--color-primary-glow);
}

.header__action--logout:hover {
  background: var(--color-error);
  border-color: var(--color-error);
  box-shadow: 0 0 20px var(--color-error-glow);
}

.header__action:active {
  transform: translateY(0) scale(0.95);
}

.main-layout__content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  padding-bottom: calc(5rem + env(safe-area-inset-bottom));
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Desktop adjustments */
@media (min-width: 768px) {
  .main-layout__content {
    padding: 2.5rem 1.5rem;
    padding-bottom: 2.5rem;
  }

  .header__logo {
    width: 3rem;
    height: 3rem;
  }

  .header__logo-icon {
    width: 28px;
    height: 28px;
  }

  .header__title {
    font-size: 1.75rem;
  }

  .header__action {
    width: 3rem;
    height: 3rem;
  }
}

/* Touch device optimizations */
@media (hover: none) {
  .header__action:hover {
    transform: none;
  }
}
</style>
