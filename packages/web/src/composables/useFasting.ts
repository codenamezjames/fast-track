import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFastingStore } from '@/stores/fastingStore'

export function useFasting() {
  const fastingStore = useFastingStore()
  const currentTime = ref(new Date())
  let intervalId: number | null = null

  // Computed progress values
  const elapsed = computed(() => {
    if (!fastingStore.activeFast) return 0

    const start = new Date(fastingStore.activeFast.startTime)
    const now = currentTime.value
    const elapsedMs = now.getTime() - start.getTime()
    const elapsedHours = elapsedMs / (1000 * 60 * 60)

    return Math.max(0, elapsedHours)
  })

  const remaining = computed(() => {
    if (!fastingStore.activeFast) return 0

    const goalHours = fastingStore.activeFast.goalHours
    const remainingHours = goalHours - elapsed.value

    return Math.max(0, remainingHours)
  })

  const percentage = computed(() => {
    if (!fastingStore.activeFast) return 0

    const goalHours = fastingStore.activeFast.goalHours
    const progress = (elapsed.value / goalHours) * 100

    return Math.min(100, Math.max(0, progress))
  })

  const isCompleted = computed(() => percentage.value >= 100)

  const formattedElapsed = computed(() => {
    return formatDuration(elapsed.value)
  })

  const formattedRemaining = computed(() => {
    return formatDuration(remaining.value)
  })

  const formattedGoal = computed(() => {
    if (!fastingStore.activeFast) return '0h'
    return formatDuration(fastingStore.activeFast.goalHours)
  })

  // Format duration in hours to human-readable string
  function formatDuration(hours: number): string {
    const totalMinutes = Math.floor(hours * 60)
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60

    if (h === 0) {
      return `${m}m`
    }

    return m === 0 ? `${h}h` : `${h}h ${m}m`
  }

  // Start the timer that updates current time every second
  function startTimer() {
    if (intervalId !== null) return

    intervalId = window.setInterval(() => {
      currentTime.value = new Date()
    }, 1000)
  }

  // Stop the timer
  function stopTimer() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // Start fast
  async function startFast(goalHours: number, notes?: string) {
    try {
      await fastingStore.startFast({
        startTime: new Date(),
        goalHours,
        notes,
      })
      startTimer()
    } catch (error) {
      console.error('Failed to start fast:', error)
      throw error
    }
  }

  // End fast
  async function endFast(notes?: string) {
    if (!fastingStore.activeFast) return

    try {
      await fastingStore.endFast(fastingStore.activeFast.id, {
        endTime: new Date(),
        notes,
      })
      stopTimer()
    } catch (error) {
      console.error('Failed to end fast:', error)
      throw error
    }
  }

  // Lifecycle hooks
  onMounted(() => {
    if (fastingStore.activeFast) {
      startTimer()
    }
  })

  onUnmounted(() => {
    stopTimer()
  })

  return {
    // State
    activeFast: computed(() => fastingStore.activeFast),
    hasActiveFast: computed(() => fastingStore.hasActiveFast),
    loading: computed(() => fastingStore.loading),
    error: computed(() => fastingStore.error),

    // Computed progress
    elapsed,
    remaining,
    percentage,
    isCompleted,
    formattedElapsed,
    formattedRemaining,
    formattedGoal,

    // Actions
    startFast,
    endFast,
    fetchActiveFast: fastingStore.fetchActiveFast,
    clearError: fastingStore.clearError,
  }
}
