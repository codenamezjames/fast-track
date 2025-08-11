<template>
  <div class="performance-monitor">
    <!-- Performance Stats Card -->
    <q-card v-if="showStats" flat bordered class="performance-card">
      <q-card-section>
        <div class="text-h6 q-mb-md">Performance Monitor</div>

        <!-- Memory Usage -->
        <div class="row q-gutter-md">
          <div class="col-12 col-sm-6">
            <q-card flat bordered class="stat-card">
              <q-card-section class="text-center">
                <q-icon name="memory" size="24px" color="primary" />
                <div class="text-h6 text-primary">{{ memoryUsage }}%</div>
                <div class="text-caption">Memory Usage</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6">
            <q-card flat bordered class="stat-card">
              <q-card-section class="text-center">
                <q-icon name="speed" size="24px" color="secondary" />
                <div class="text-h6 text-secondary">{{ fps }} FPS</div>
                <div class="text-caption">Frame Rate</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="q-mt-md">
          <div class="text-subtitle2 q-mb-sm">Performance Metrics</div>
          <q-list dense>
            <q-item v-for="metric in performanceMetrics" :key="metric.name">
              <q-item-section>
                <q-item-label>{{ metric.name }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label
                  :class="metric.status === 'warning' ? 'text-warning' : 'text-positive'"
                >
                  {{ metric.value }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Long Tasks -->
        <div v-if="longTasks.length > 0" class="q-mt-md">
          <div class="text-subtitle2 q-mb-sm">Long Tasks Detected</div>
          <q-list dense>
            <q-item v-for="task in longTasks" :key="task.id">
              <q-item-section>
                <q-item-label>{{ task.name }}</q-item-label>
                <q-item-label caption>{{ task.duration }}ms</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip
                  :color="task.duration > 100 ? 'negative' : 'warning'"
                  text-color="white"
                  size="sm"
                >
                  {{ task.duration > 100 ? 'Critical' : 'Warning' }}
                </q-chip>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Clear" @click="clearMetrics" />
        <q-btn color="primary" label="Export" @click="exportMetrics" />
      </q-card-actions>
    </q-card>

    <!-- Floating Performance Indicator -->
    <q-fab-actions
      v-if="showFloating"
      v-model="fab"
      color="primary"
      icon="speed"
      direction="up"
      class="performance-fab"
    >
      <q-fab-action
        color="primary"
        icon="memory"
        @click="toggleStats"
        :label="showStats ? 'Hide Stats' : 'Show Stats'"
      />
      <q-fab-action color="secondary" icon="refresh" @click="refreshMetrics" label="Refresh" />
    </q-fab-actions>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { performanceMonitor } from '../../utils/performance.js'

// Props
const props = defineProps({
  showStats: {
    type: Boolean,
    default: false,
  },
  showFloating: {
    type: Boolean,
    default: true,
  },
  autoRefresh: {
    type: Boolean,
    default: true,
  },
  refreshInterval: {
    type: Number,
    default: 5000,
  },
})

// Emits
const emit = defineEmits(['metrics-updated', 'long-task-detected'])

// Refs
const fab = ref(false)
const memoryInfo = ref(null)
const fps = ref(60)
const longTasks = ref([])
const performanceMetrics = ref([])
let intervalId = null
let fpsCounter = 0
let lastFpsTime = Date.now()

// Computed
const memoryUsage = computed(() => {
  if (!memoryInfo.value) return 0
  return Math.round((memoryInfo.value.used / memoryInfo.value.limit) * 100)
})

// Methods
const updateMetrics = () => {
  // Update memory info
  memoryInfo.value = performanceMonitor.getMemoryInfo()

  // Update FPS
  const now = Date.now()
  fpsCounter++
  if (now - lastFpsTime >= 1000) {
    fps.value = fpsCounter
    fpsCounter = 0
    lastFpsTime = now
  }

  // Update performance metrics
  const metrics = performanceMonitor.getMetrics()
  performanceMetrics.value = Object.entries(metrics).map(([name, metric]) => ({
    name,
    value: `${Math.round(metric.duration || 0)}ms`,
    status: (metric.duration || 0) > 100 ? 'warning' : 'good',
  }))

  emit('metrics-updated', {
    memory: memoryInfo.value,
    fps: fps.value,
    metrics: performanceMetrics.value,
  })
}

const clearMetrics = () => {
  performanceMonitor.metrics.clear()
  longTasks.value = []
  performanceMetrics.value = []
}

const refreshMetrics = () => {
  updateMetrics()
}

const toggleStats = () => {
  emit('update:showStats', !props.showStats)
}

const exportMetrics = () => {
  const data = {
    timestamp: new Date().toISOString(),
    memory: memoryInfo.value,
    fps: fps.value,
    metrics: performanceMetrics.value,
    longTasks: longTasks.value,
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-metrics-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const handleLongTask = (task) => {
  longTasks.value.push({
    id: Date.now(),
    name: task.name || 'Unknown Task',
    duration: Math.round(task.duration),
    timestamp: new Date().toISOString(),
  })

  // Keep only last 10 long tasks
  if (longTasks.value.length > 10) {
    longTasks.value = longTasks.value.slice(-10)
  }

  emit('long-task-detected', task)
}

// Lifecycle
onMounted(() => {
  // Start monitoring long tasks
  performanceMonitor.monitorLongTasks(handleLongTask)

  // Start auto-refresh if enabled
  if (props.autoRefresh) {
    intervalId = setInterval(updateMetrics, props.refreshInterval)
  }

  // Initial metrics update
  updateMetrics()
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
  performanceMonitor.cleanup()
})

// Expose methods
defineExpose({
  updateMetrics,
  clearMetrics,
  exportMetrics,
})
</script>

<style scoped>
.performance-monitor {
  position: relative;
}

.performance-card {
  max-width: 400px;
}

.stat-card {
  border-radius: 8px;
}

.performance-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .performance-card {
    max-width: 100%;
  }

  .performance-fab {
    bottom: 10px;
    right: 10px;
  }
}
</style>
