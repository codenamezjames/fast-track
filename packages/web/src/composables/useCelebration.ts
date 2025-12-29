import { ref, onMounted, onUnmounted } from 'vue'

export type CelebrationPhase = 'enter' | 'show' | 'exit' | null

export function useCelebration(duration = 3000) {
  const phase = ref<CelebrationPhase>(null)
  const isActive = ref(false)
  let timeoutId: number | null = null

  function trigger() {
    // Clear any existing timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    // Start celebration sequence
    isActive.value = true
    phase.value = 'enter'

    // Transition to 'show' phase after enter animation (200ms)
    timeoutId = window.setTimeout(() => {
      phase.value = 'show'

      // Transition to 'exit' phase after duration
      timeoutId = window.setTimeout(() => {
        phase.value = 'exit'

        // Complete celebration after exit animation (300ms)
        timeoutId = window.setTimeout(() => {
          phase.value = null
          isActive.value = false
          timeoutId = null
        }, 300)
      }, duration)
    }, 200)
  }

  function cancel() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    phase.value = null
    isActive.value = false
  }

  // Cleanup on unmount
  onUnmounted(() => {
    cancel()
  })

  return {
    phase,
    isActive,
    trigger,
    cancel,
  }
}
