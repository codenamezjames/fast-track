import { ref, onMounted, onUnmounted } from 'vue'

export function usePwa() {
  const isOnline = ref(navigator.onLine)
  const needRefresh = ref(false)
  const updateAvailable = ref(false)

  function handleOnline() {
    isOnline.value = true
  }

  function handleOffline() {
    isOnline.value = false
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    isOnline,
    needRefresh,
    updateAvailable,
  }
}
