<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Download, X } from 'lucide-vue-next'
import Button from './Button.vue'

const showPrompt = ref(false)
const deferredPrompt = ref<any>(null)

function handleBeforeInstallPrompt(e: Event) {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault()
  // Stash the event so it can be triggered later
  deferredPrompt.value = e
  // Show the install prompt
  showPrompt.value = true
}

async function handleInstallClick() {
  if (!deferredPrompt.value) {
    return
  }

  // Show the install prompt
  deferredPrompt.value.prompt()

  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.value.userChoice

  if (outcome === 'accepted') {
    console.log('User accepted the install prompt')
  } else {
    console.log('User dismissed the install prompt')
  }

  // Clear the deferredPrompt
  deferredPrompt.value = null
  showPrompt.value = false
}

function handleDismiss() {
  showPrompt.value = false
  deferredPrompt.value = null
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

  // Check if app is already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('App is running in standalone mode')
    showPrompt.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
})
</script>

<template>
  <Transition name="slide-up">
    <div v-if="showPrompt" class="pwa-install-prompt">
      <div class="pwa-install-prompt__content">
        <Download :size="24" class="pwa-install-prompt__icon" />
        <div class="pwa-install-prompt__text">
          <h3 class="pwa-install-prompt__title">Install Fast Track</h3>
          <p class="pwa-install-prompt__description">
            Install this app on your device for quick access and offline use
          </p>
        </div>
        <div class="pwa-install-prompt__actions">
          <Button variant="primary" size="sm" @click="handleInstallClick">
            Install
          </Button>
          <button class="pwa-install-prompt__close" @click="handleDismiss" aria-label="Dismiss">
            <X :size="20" />
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.pwa-install-prompt {
  position: fixed;
  bottom: 80px; /* Above bottom navigation */
  left: 16px;
  right: 16px;
  z-index: 1000;
  background: var(--color-surface);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.pwa-install-prompt__content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pwa-install-prompt__icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.pwa-install-prompt__text {
  flex: 1;
  min-width: 0;
}

.pwa-install-prompt__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 4px 0;
}

.pwa-install-prompt__description {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.4;
}

.pwa-install-prompt__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.pwa-install-prompt__close {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.pwa-install-prompt__close:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
}

/* Slide up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (min-width: 640px) {
  .pwa-install-prompt {
    left: auto;
    right: 16px;
    max-width: 400px;
  }
}
</style>
