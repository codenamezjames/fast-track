<template>
  <div class="base-chart">
    <!-- Loading State -->
    <div v-if="isLoading" :style="loadingStyles" class="chart-loading">
      <q-spinner-dots size="40px" color="primary" />
      <div class="text-caption q-mt-sm">{{ loadingText }}</div>
    </div>

    <!-- No Data State -->
    <div v-else-if="!hasData" :style="noDataStyles" class="chart-no-data">
      <q-icon name="insert_chart" size="48px" color="grey-4" />
      <div class="text-caption q-mt-sm text-grey-6">{{ noDataText }}</div>
    </div>

    <!-- Chart Container -->
    <div v-else :style="chartContainerStyles" class="chart-container">
      <canvas ref="chartCanvas" :height="height"></canvas>
    </div>

    <!-- Error State -->
    <div v-if="error" class="chart-error q-pa-md text-center">
      <q-icon name="error" size="32px" color="negative" />
      <div class="text-caption q-mt-sm text-negative">{{ error }}</div>
      <q-btn
        v-if="showRetry"
        label="Retry"
        size="sm"
        color="primary"
        outline
        @click="$emit('retry')"
        class="q-mt-sm"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useChartDefaults } from '../../composables/useChartDefaults.js'

// Props
const props = defineProps({
  // Chart data
  data: {
    type: Object,
    default: () => ({}),
  },

  // Chart options
  options: {
    type: Object,
    default: () => ({}),
  },

  // Chart type
  type: {
    type: String,
    default: 'line',
    validator: (value) => ['line', 'bar', 'doughnut', 'pie', 'radar', 'polarArea'].includes(value),
  },

  // Styling
  height: {
    type: Number,
    default: 200,
  },

  // States
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },

  // Text
  loadingText: {
    type: String,
    default: 'Loading chart...',
  },
  noDataText: {
    type: String,
    default: 'No data available',
  },

  // Actions
  showRetry: {
    type: Boolean,
    default: false,
  },

  // Responsive
  responsive: {
    type: Boolean,
    default: true,
  },

  // Auto resize
  autoResize: {
    type: Boolean,
    default: true,
  },
})

// Emits
const emit = defineEmits(['chart-ready', 'chart-error', 'retry'])

// Composables
const { getDefaultChartOptions, getChartContainerStyles, getLoadingStyles, getNoDataStyles } =
  useChartDefaults()

// Reactive refs
const chartCanvas = ref(null)
const chartInstance = ref(null)
const resizeObserver = ref(null)

// Computed
const hasData = computed(() => {
  if (!props.data || !props.data.datasets) return false
  return props.data.datasets.some(
    (dataset) =>
      dataset.data &&
      dataset.data.length > 0 &&
      dataset.data.some((value) => value !== null && value !== undefined),
  )
})

const chartContainerStyles = computed(() => getChartContainerStyles(props.height))

const loadingStyles = computed(() => getLoadingStyles())

const noDataStyles = computed(() => getNoDataStyles())

// Methods
const createChart = async () => {
  if (!chartCanvas.value) return

  try {
    // Dynamically import Chart.js to reduce bundle size
    const { Chart, registerables } = await import('chart.js/auto')
    Chart.register(...registerables)

    // Merge default options with custom options
    const mergedOptions = {
      ...getDefaultChartOptions(),
      ...props.options,
    }

    // Create chart instance
    chartInstance.value = new Chart(chartCanvas.value, {
      type: props.type,
      data: props.data,
      options: mergedOptions,
    })

    emit('chart-ready', chartInstance.value)
  } catch (error) {
    emit('chart-error', error)
  }
}

const updateChart = () => {
  if (!chartInstance.value) return

  try {
    chartInstance.value.data = props.data
    chartInstance.value.update('none') // Use 'none' for better performance
  } catch (error) {
    emit('chart-error', error)
  }
}

const destroyChart = () => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }
}

const setupResizeObserver = () => {
  if (!props.autoResize || !chartCanvas.value) return

  resizeObserver.value = new ResizeObserver(() => {
    if (chartInstance.value) {
      chartInstance.value.resize()
    }
  })

  resizeObserver.value.observe(chartCanvas.value)
}

const cleanupResizeObserver = () => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
    resizeObserver.value = null
  }
}

// Lifecycle
onMounted(async () => {
  await nextTick()
  if (hasData.value && !props.isLoading) {
    await createChart()
    setupResizeObserver()
  }
})

onUnmounted(() => {
  destroyChart()
  cleanupResizeObserver()
})

// Watchers
watch(
  () => props.data,
  () => {
    if (chartInstance.value) {
      updateChart()
    } else if (hasData.value && !props.isLoading) {
      createChart()
    }
  },
  { deep: true },
)

watch(
  () => props.options,
  () => {
    if (chartInstance.value) {
      chartInstance.value.options = {
        ...getDefaultChartOptions(),
        ...props.options,
      }
      chartInstance.value.update()
    }
  },
  { deep: true },
)

watch(
  () => props.isLoading,
  (newValue) => {
    if (!newValue && hasData.value && !chartInstance.value) {
      createChart()
    }
  },
)

watch(
  () => hasData.value,
  (newValue) => {
    if (newValue && !props.isLoading && !chartInstance.value) {
      createChart()
    }
  },
)

// Expose methods for parent component
defineExpose({
  chartInstance,
  createChart,
  updateChart,
  destroyChart,
})
</script>

<style scoped>
.base-chart {
  width: 100%;
  position: relative;
}

.chart-loading,
.chart-no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 220px;
  width: 100%;
}

.chart-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 220px;
  width: 100%;
}

.chart-container {
  position: relative;
  width: 100%;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .chart-loading,
  .chart-no-data,
  .chart-error {
    height: 180px;
  }
}
</style>
