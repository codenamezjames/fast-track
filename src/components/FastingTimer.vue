<template>
  <div class="fasting-timer-modern">
    <div v-if="fastingStore.isFasting" class="active-fast">
      <!-- Circular Progress -->
      <div class="progress-container">
        <svg width="160" height="160" class="progress-svg">
          <!-- Background circle -->
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="#e9ecef"
            stroke-width="8"
          />
          
          <!-- Fasting period (green) -->
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="#4ade80"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="fastingArcLength"
            :stroke-dashoffset="fastingOffset"
            transform="rotate(-90 80 80)"
          />
          
          <!-- Progress indicator (blue) -->
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="#4f7cff"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="progressArcLength"
            :stroke-dashoffset="progressOffset"
            transform="rotate(-90 80 80)"
          />
        </svg>
        
        <!-- Center content -->
        <div class="center-content">
          <div class="fast-type">16:8</div>
          <div class="time-remaining">{{ timeDisplay }}</div>
        </div>
      </div>
    </div>
    
    <div v-else class="no-fast">
      <div class="start-message">Ready to start fasting?</div>
      <div class="quick-start-buttons">
        <q-btn
          v-for="preset in [12, 16, 18, 24]"
          :key="preset"
          :label="`${preset}h`"
          outline
          color="primary"
          class="preset-btn"
          @click="startQuickFast(preset)"
          :loading="fastingStore.isLoading"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { Notify } from 'quasar'
import { useFastingStore } from '../stores/fasting.js'

const fastingStore = useFastingStore()

const circumference = 2 * Math.PI * 70 // radius = 70

// Calculate arc lengths for 16:8 fasting (16h fast, 8h eating)
const fastingArcLength = computed(() => {
  const fastingHours = 16
  const totalHours = 24
  const fastingPercentage = fastingHours / totalHours
  return `${circumference * fastingPercentage} ${circumference}`
})

const fastingOffset = computed(() => {
  return 0 // Start from top
})

const progressArcLength = computed(() => {
  const progress = fastingStore.fastingProgress / 100
  const fastingHours = 16
  const totalHours = 24
  const fastingPercentage = fastingHours / totalHours
  const progressLength = circumference * fastingPercentage * progress
  return `${progressLength} ${circumference}`
})

const progressOffset = computed(() => {
  return 0 // Start from top
})

const timeDisplay = computed(() => {
  if (!fastingStore.isFasting) return '00:00'
  
  const remaining = fastingStore.fastingTimeRemaining
  if (remaining > 0) {
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} remaining`
  } else {
    const elapsed = Math.abs(remaining)
    const hours = Math.floor(elapsed / (1000 * 60 * 60))
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} overtime`
  }
})

onMounted(async () => {
  await fastingStore.loadFastingData()
})

onUnmounted(() => {
  fastingStore.stopTimer()
})

const startQuickFast = async (hours) => {
  try {
    await fastingStore.startFast(hours)
    Notify.create({
      type: 'positive',
      message: `Started ${hours}h fast!`,
      position: 'top',
      timeout: 2000
    })
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Failed to start fast',
      position: 'top'
    })
  }
}
</script>

<style scoped>
.fasting-timer-modern {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.active-fast {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-svg {
  transform: rotate(0deg);
}

.center-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.fast-type {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
  margin-bottom: 4px;
}

.time-remaining {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.no-fast {
  text-align: center;
}

.start-message {
  font-size: 16px;
  color: #6c757d;
  margin-bottom: 24px;
  font-weight: 500;
}

.quick-start-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.preset-btn {
  border-radius: 8px;
  font-weight: 600;
  min-width: 50px;
}
</style>