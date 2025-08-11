<template>
  <q-banner v-if="showInstallPrompt" class="bg-primary text-white install-banner" rounded>
    <template v-slot:avatar>
      <q-icon name="get_app" color="white" />
    </template>

    <div class="install-content">
      <div class="text-subtitle1">Install FastTrack</div>
      <div class="text-caption">Get the full app experience with offline access</div>
    </div>

    <template v-slot:action>
      <q-btn flat color="white" label="Install" @click="installApp" :loading="installing" />
      <q-btn flat color="white" icon="close" @click="dismissPrompt" dense />
    </template>
  </q-banner>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

// Composables
const $q = useQuasar()

// Reactive data
const showInstallPrompt = ref(false)
const installing = ref(false)
const deferredPrompt = ref(null)

// Check if user has already dismissed the prompt
const hasUserDismissed = () => {
  return localStorage.getItem('pwa-install-dismissed') === 'true'
}

// Check if app is already installed
const isAppInstalled = () => {
  return (
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone ||
    localStorage.getItem('pwa-installed') === 'true'
  )
}

// Show install prompt logic
const shouldShowPrompt = () => {
  return !hasUserDismissed() && !isAppInstalled() && deferredPrompt.value && !$q.platform.is.mobile // Only show on desktop/tablet for now
}

// Install app handler
const installApp = async () => {
  if (!deferredPrompt.value) return

  installing.value = true

  try {
    // Show the install prompt
    deferredPrompt.value.prompt()

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.value.userChoice

    if (outcome === 'accepted') {
      console.log('PWA install accepted')
      localStorage.setItem('pwa-installed', 'true')

      $q.notify({
        type: 'positive',
        message: 'App installed successfully!',
        position: 'top',
        timeout: 3000,
      })
    } else {
      console.log('PWA install dismissed')
    }

    // Clear the prompt
    deferredPrompt.value = null
    showInstallPrompt.value = false
  } catch (error) {
    console.error('PWA install error:', error)
    $q.notify({
      type: 'negative',
      message: 'Installation failed. Please try again.',
      position: 'top',
    })
  } finally {
    installing.value = false
  }
}

// Dismiss prompt handler
const dismissPrompt = () => {
  showInstallPrompt.value = false
  localStorage.setItem('pwa-install-dismissed', 'true')

  // Set a timeout to show again in 7 days
  const dismissTime = Date.now()
  localStorage.setItem('pwa-install-dismiss-time', dismissTime.toString())
}

// Check if enough time has passed since last dismissal
const canShowAfterDismissal = () => {
  const dismissTime = localStorage.getItem('pwa-install-dismiss-time')
  if (!dismissTime) return true

  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000
  return Date.now() - parseInt(dismissTime) > sevenDaysInMs
}

// Event handlers
const handleBeforeInstallPrompt = (e) => {
  console.log('beforeinstallprompt event fired')

  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault()

  // Save the event for later use
  deferredPrompt.value = e

  // Check if we should show our custom prompt
  if (canShowAfterDismissal()) {
    // Reset dismissal if enough time has passed
    localStorage.removeItem('pwa-install-dismissed')
  }

  if (shouldShowPrompt()) {
    // Small delay to ensure page has loaded
    setTimeout(() => {
      showInstallPrompt.value = true
    }, 2000)
  }
}

const handleAppInstalled = () => {
  console.log('PWA was installed')
  localStorage.setItem('pwa-installed', 'true')
  showInstallPrompt.value = false
  deferredPrompt.value = null

  $q.notify({
    type: 'positive',
    message: 'FastTrack installed! You can now access it from your home screen.',
    position: 'top',
    timeout: 5000,
  })
}

// Lifecycle
onMounted(() => {
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

  // Listen for the appinstalled event
  window.addEventListener('appinstalled', handleAppInstalled)

  // Check if app is already installable (in case event fired before mount)
  if (window.deferredPrompt) {
    deferredPrompt.value = window.deferredPrompt
    if (shouldShowPrompt()) {
      showInstallPrompt.value = true
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('appinstalled', handleAppInstalled)
})

// Expose methods for external use
defineExpose({
  showInstallPrompt: () => {
    if (deferredPrompt.value && !isAppInstalled()) {
      showInstallPrompt.value = true
    }
  },
  isInstallable: () => !!deferredPrompt.value,
  isInstalled: isAppInstalled,
})
</script>

<style scoped>
.install-banner {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  z-index: 2000;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.install-content {
  flex: 1;
}

/* Mobile adjustments */
@media (max-width: 480px) {
  .install-banner {
    bottom: 10px;
    left: 10px;
    right: 10px;
  }

  .install-content .text-subtitle1 {
    font-size: 1rem;
  }

  .install-content .text-caption {
    font-size: 0.8rem;
  }
}

/* Hide on very small screens */
@media (max-width: 320px) {
  .install-banner {
    font-size: 0.9rem;
  }
}

/* Animation */
.install-banner {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
