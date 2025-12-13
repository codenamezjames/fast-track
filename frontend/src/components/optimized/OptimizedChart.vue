<template>
  <div class="chart-container" ref="chartContainer">
    <canvas ref="chartCanvas" :style="{ height: height + 'px' }"></canvas>

    <!-- Loading state using Quasar components -->
    <div v-if="isLoading" class="chart-loading">
      <q-spinner-dots size="24px" color="primary" />
      <div class="text-caption q-mt-sm">Loading chart...</div>
    </div>

    <!-- Error state using Quasar components -->
    <div v-if="error" class="chart-error">
      <q-icon name="error" size="24px" color="negative" />
      <div class="text-caption q-mt-sm">{{ error }}</div>
      <q-btn
        v-if="showRetry"
        label="Retry"
        size="sm"
        color="primary"
        outline
        @click="retry"
        class="q-mt-sm"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useChartDefaults } from '../../composables/useChartDefaults.js'
import { debounce } from '../../utils/performance.js'

// Register Chart.js components
Chart.register(...registerables)

// Props
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  type: {
    type: String,
    default: 'line',
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  height: {
    type: Number,
    default: 300,
  },
  responsive: {
    type: Boolean,
    default: true,
  },
  maintainAspectRatio: {
    type: Boolean,
    default: false,
  },
  // Performance options
  debounceMs: {
    type: Number,
    default: 300,
  },
  maxDataPoints: {
    type: Number,
    default: 100,
  },
  enableDecimation: {
    type: Boolean,
    default: true,
  },
  showRetry: {
    type: Boolean,
    default: true,
  },
})

// Emits
const emit = defineEmits(['chart-ready', 'chart-error', 'retry'])

// Refs
const chartContainer = ref(null)
const chartCanvas = ref(null)
const chartInstance = ref(null)
const isLoading = ref(false)
const error = ref(null)

// Composables
const { getChartDefaults } = useChartDefaults()

// Computed
const processedData = computed(() => {
  if (!props.data || props.data.length === 0) return []

  let data = [...props.data]

  // Apply data decimation if enabled and data is too large
  if (props.enableDecimation && data.length > props.maxDataPoints) {
    data = decimateData(data, props.maxDataPoints)
  }

  return data
})

const chartOptions = computed(() => {
  const defaults = getChartDefaults()

  return {
    ...defaults,
    responsive: props.responsive,
    maintainAspectRatio: props.maintainAspectRatio,
    animation: {
      duration: 300,
      easing: 'easeInOutQuart',
    },
    plugins: {
      ...defaults.plugins,
      decimation: props.enableDecimation
        ? {
            enabled: true,
            algorithm: 'min-max',
          }
        : false,
    },
    ...props.options,
  }
})

// Methods
const decimateData = (data, maxPoints) => {
  if (data.length <= maxPoints) return data

  const step = Math.ceil(data.length / maxPoints)
  const decimated = []

  for (let i = 0; i < data.length; i += step) {
    decimated.push(data[i])
  }

  // Always include the last point
  if (decimated[decimated.length - 1] !== data[data.length - 1]) {
    decimated.push(data[data.length - 1])
  }

  return decimated
}

const createChart = async () => {
  if (!chartCanvas.value) return

  try {
    isLoading.value = true
    error.value = null

    // Destroy existing chart
    if (chartInstance.value) {
      chartInstance.value.destroy()
    }

    // Wait for next tick to ensure canvas is ready
    await nextTick()

    const ctx = chartCanvas.value.getContext('2d')

    chartInstance.value = new Chart(ctx, {
      type: props.type,
      data: {
        labels: processedData.value.map((item) => item.label || item.date),
        datasets: [
          {
            label: 'Data',
            data: processedData.value.map((item) => item.value || item.calories || item.weight),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
          },
        ],
      },
      options: chartOptions.value,
    })

    emit('chart-ready', chartInstance.value)
  } catch (err) {
    error.value = err.message
    emit('chart-error', err)
  } finally {
    isLoading.value = false
  }
}

const updateChart = debounce(async () => {
  if (!chartInstance.value) return

  try {
    chartInstance.value.data.labels = processedData.value.map((item) => item.label || item.date)
    chartInstance.value.data.datasets[0].data = processedData.value.map(
      (item) => item.value || item.calories || item.weight,
    )
    chartInstance.value.update('none') // Use 'none' mode for better performance
  } catch (err) {
    error.value = err.message
    emit('chart-error', err)
  }
}, props.debounceMs)

const retry = () => {
  error.value = null
  createChart()
  emit('retry')
}

// Lifecycle
onMounted(() => {
  createChart()
})

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
})

// Watchers
watch(() => processedData.value, updateChart, { deep: true })
watch(() => props.options, updateChart, { deep: true })

// Expose methods for parent components
defineExpose({
  chart: chartInstance,
  update: updateChart,
  destroy: () => {
    if (chartInstance.value) {
      chartInstance.value.destroy()
    }
  },
  retry,
})
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  min-height: 200px;
}

.chart-loading,
.chart-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-error {
  color: #c10015;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .chart-container {
    min-height: 150px;
  }
}
</style>
