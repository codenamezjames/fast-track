<template>
  <transition name="slide-down">
    <q-banner v-if="!isOnline" class="bg-orange text-white offline-banner" dense>
      <template v-slot:avatar>
        <q-icon name="cloud_off" color="white" />
      </template>

      <div class="offline-content">
        <span class="text-subtitle2">You're offline</span>
        <span class="text-caption q-ml-sm">• Data will sync when reconnected</span>
      </div>
    </q-banner>
  </transition>

  <!-- Connection restored notification -->
  <transition name="slide-down">
    <q-banner v-if="showReconnectedBanner" class="bg-positive text-white reconnected-banner" dense>
      <template v-slot:avatar>
        <q-icon name="cloud_done" color="white" />
      </template>

      <div class="reconnected-content">
        <span class="text-subtitle2">Back online</span>
        <span class="text-caption q-ml-sm">• {{ pendingDataMessage }}</span>
      </div>

      <template v-slot:action>
        <q-btn flat color="white" icon="close" @click="hideReconnectedBanner" dense size="sm" />
      </template>
    </q-banner>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useCaloriesStore } from '../stores/calories.js'
import { useFastingStore } from '../stores/fasting.js'
import { useWeightStore } from '../stores/weight.js'

// Stores
const caloriesStore = useCaloriesStore()
const fastingStore = useFastingStore()
const weightStore = useWeightStore()

// Reactive data
const isOnline = ref(navigator.onLine)
const showReconnectedBanner = ref(false)
const wasOffline = ref(false)

// Computed properties
const pendingDataCount = computed(() => {
  // In a real app with sync, this would check for unsynced data
  // For now, we'll show a general message since we're offline-first
  const unsyncedMeals = caloriesStore.meals.filter((meal) => !meal.synced).length
  const unsyncedSessions = fastingStore.sessions.filter((session) => !session.synced).length
  const unsyncedWeights = weightStore.entries.filter((entry) => !entry.synced).length

  return unsyncedMeals + unsyncedSessions + unsyncedWeights
})

const pendingDataMessage = computed(() => {
  const count = pendingDataCount.value
  if (count === 0) {
    return 'All data synced'
  } else {
    return `${count} item${count !== 1 ? 's' : ''} ready to sync`
  }
})

// Event handlers
const handleOnline = () => {
  isOnline.value = true

  if (wasOffline.value) {
    // Show reconnected banner for a few seconds
    showReconnectedBanner.value = true

    // Auto-hide after 4 seconds
    setTimeout(() => {
      showReconnectedBanner.value = false
    }, 4000)

    // In a real sync scenario, you would trigger sync here
    // await syncPendingData()

    wasOffline.value = false
  }
}

const handleOffline = () => {
  isOnline.value = false
  wasOffline.value = true
  showReconnectedBanner.value = false
}

const hideReconnectedBanner = () => {
  showReconnectedBanner.value = false
}



// Lifecycle
onMounted(() => {
  // Add network event listeners
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Initial check
  isOnline.value = navigator.onLine
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})

// Expose status for external use
defineExpose({
  isOnline: () => isOnline.value,
  pendingDataCount: () => pendingDataCount.value,
})
</script>

<style scoped>
.offline-banner,
.reconnected-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 3000;
  border-radius: 0;
}

.offline-content,
.reconnected-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition:
    transform 0.3s ease-out,
    opacity 0.3s ease-out;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Mobile adjustments */
@media (max-width: 480px) {
  .offline-content,
  .reconnected-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .offline-content .text-caption,
  .reconnected-content .text-caption {
    margin-left: 0 !important;
  }

  .offline-banner,
  .reconnected-banner {
    padding: 8px 16px;
  }
}

/* Ensure banner doesn't interfere with app content */
.offline-banner + * {
  margin-top: 60px;
}

.reconnected-banner + * {
  margin-top: 60px;
}
</style>
