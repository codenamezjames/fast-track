import { ref, computed, onUnmounted } from 'vue'

export function useTimer(initialTime = 0) {
  const elapsedMs = ref(initialTime)
  const isRunning = ref(false)
  const startTime = ref<number | null>(null)
  let intervalId: number | null = null

  const elapsedSeconds = computed(() => Math.floor(elapsedMs.value / 1000))
  const elapsedMinutes = computed(() => Math.floor(elapsedSeconds.value / 60))
  const elapsedHours = computed(() => Math.floor(elapsedMinutes.value / 60))

  const formattedTime = computed(() => {
    const hours = elapsedHours.value
    const minutes = elapsedMinutes.value % 60
    const seconds = elapsedSeconds.value % 60

    const mm = String(minutes).padStart(2, '0')
    const ss = String(seconds).padStart(2, '0')

    if (hours > 0) {
      return `${hours}:${mm}:${ss}`
    } else {
      return `${minutes}:${ss}`
    }
  })

  function start() {
    if (isRunning.value) return

    isRunning.value = true
    startTime.value = Date.now() - elapsedMs.value

    intervalId = window.setInterval(() => {
      if (startTime.value !== null) {
        elapsedMs.value = Date.now() - startTime.value
      }
    }, 100) // Update every 100ms for smooth display
  }

  function pause() {
    if (!isRunning.value) return

    isRunning.value = false

    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function reset() {
    pause()
    elapsedMs.value = 0
    startTime.value = null
  }

  function stop() {
    const finalTime = elapsedMs.value
    reset()
    return finalTime
  }

  // Cleanup on unmount
  onUnmounted(() => {
    if (intervalId !== null) {
      clearInterval(intervalId)
    }
  })

  return {
    elapsedMs,
    elapsedSeconds,
    elapsedMinutes,
    elapsedHours,
    formattedTime,
    isRunning,
    start,
    pause,
    reset,
    stop,
  }
}
