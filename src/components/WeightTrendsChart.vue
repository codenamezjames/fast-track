<template>
  <div class="weight-trends-chart">
    <!-- Header with time period selector -->
    <div class="chart-header q-mb-md">
      <div class="text-h6 q-mb-sm">Weight Trends</div>
      <q-btn-toggle
        v-model="selectedPeriod"
        no-caps
        rounded
        unelevated
        toggle-color="positive"
        color="grey-3"
        text-color="grey-7"
        :options="periodOptions"
        class="period-selector"
        @update:model-value="updateChartData"
      />
    </div>

    <!-- Chart container -->
    <div class="chart-container" :class="{ loading: isLoading }">
      <div v-if="isLoading" class="chart-loading">
        <q-spinner-dots size="40px" color="positive" />
        <div class="text-body2 q-mt-sm text-grey-6">Loading chart data...</div>
      </div>

      <div v-else-if="!hasData" class="chart-no-data">
        <q-icon name="monitor_weight" size="48px" color="grey-4" />
        <div class="text-body2 q-mt-sm text-grey-6">No weight data available</div>
        <div class="text-caption text-grey-5">Start tracking your weight to see trends</div>
      </div>

      <div v-else class="chart-wrapper">
        <Line :data="chartData" :options="chartOptions" :height="chartHeight" />
      </div>
    </div>

    <!-- Stats summary -->
    <div v-if="hasData && !isLoading" class="chart-stats q-mt-md">
      <div class="row q-gutter-md">
        <div class="col">
          <q-card flat bordered class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h6 text-positive">{{ currentWeight }}{{ weightUnit }}</div>
              <div class="text-caption text-grey-6">Current</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col">
          <q-card flat bordered class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h6" :class="trendColorClass">{{ weightChangeDisplay }}</div>
              <div class="text-caption text-grey-6">Change</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col">
          <q-card flat bordered class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h6 text-orange">{{ averageWeightDisplay }}{{ weightUnit }}</div>
              <div class="text-caption text-grey-6">Average</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { useWeightStore } from '../stores/weight.js'
import { useThemeStore } from '../stores/theme.js'
import { getWeightForDisplay } from '../utils/weightConversions.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

// Props
const props = defineProps({
  height: {
    type: Number,
    default: 200,
  },
  showStats: {
    type: Boolean,
    default: true,
  },
  weightUnit: {
    type: String,
    default: 'lbs',
    validator: (value) => ['lbs', 'kg'].includes(value),
  },
})

// Stores
const weightStore = useWeightStore()
const themeStore = useThemeStore()

// Reactive data
const selectedPeriod = ref('month')
const isLoading = ref(false)

const periodOptions = [
  { label: '30D', value: 'month' },
  { label: '4W', value: 'weeks' },
  { label: '6M', value: 'sixmonths' },
]

// Computed properties
const chartHeight = computed(() => props.height)

const rawChartData = computed(() => {
  switch (selectedPeriod.value) {
    case 'month':
      return weightStore.dailyWeightData(30)
    case 'weeks':
      return weightStore.weeklyWeightData(4)
    case 'sixmonths':
      return weightStore.monthlyWeightData(6)
    default:
      return []
  }
})

const hasData = computed(() => {
  return rawChartData.value.length > 0
})

const chartData = computed(() => {
  if (!hasData.value) return { labels: [], datasets: [] }

  const data = rawChartData.value
  const isDarkMode = themeStore.isDark

  return {
    labels: data.map((item) => item.label),
    datasets: [
      {
        label: `Weight (${props.weightUnit})`,
        data: data.map((item) => getWeightForDisplay(item.weight, props.weightUnit)),
        borderColor: isDarkMode ? '#81C784' : '#4CAF50',
        backgroundColor: isDarkMode ? 'rgba(129, 199, 132, 0.1)' : 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: isDarkMode ? '#81C784' : '#4CAF50',
        pointBorderColor: isDarkMode ? '#81C784' : '#4CAF50',
        pointHoverBackgroundColor: isDarkMode ? '#81C784' : '#4CAF50',
        pointHoverBorderColor: isDarkMode ? '#FFFFFF' : '#FFFFFF',
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 3,
      },
    ],
  }
})

const chartOptions = computed(() => {
  const isDarkMode = themeStore.isDark
  const textColor = isDarkMode ? '#FFFFFF' : '#000000'
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: isDarkMode ? '#81C784' : '#4CAF50',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function (context) {
            return context[0].label
          },
          label: function (context) {
            return `${context.parsed.y} ${props.weightUnit}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: gridColor,
          borderColor: gridColor,
        },
        ticks: {
          color: textColor,
          font: {
            size: 12,
          },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        grid: {
          color: gridColor,
          borderColor: gridColor,
        },
        ticks: {
          color: textColor,
          font: {
            size: 12,
          },
          callback: function (value) {
            return value + ' ' + props.weightUnit
          },
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  }
})

// Stats computed properties
const currentWeight = computed(() => {
  const latest = weightStore.latestWeightForDisplay(props.weightUnit)
  return latest ? latest.weight.toFixed(1) : '0'
})

const weightChange = computed(() => {
  const days = selectedPeriod.value === 'month' ? 30 : selectedPeriod.value === 'weeks' ? 28 : 180
  return weightStore.weightChange(days)
})

const weightChangeDisplay = computed(() => {
  const days = selectedPeriod.value === 'month' ? 30 : selectedPeriod.value === 'weeks' ? 28 : 180
  return weightStore.weightChangeForDisplay(days, props.weightUnit)
})

const trendColorClass = computed(() => {
  const change = weightChange.value
  if (change > 0) return 'text-orange'
  if (change < 0) return 'text-positive'
  return 'text-grey-7'
})

const averageWeightDisplay = computed(() => {
  const days = selectedPeriod.value === 'month' ? 30 : selectedPeriod.value === 'weeks' ? 28 : 180
  return weightStore.averageWeightForDisplay(days, props.weightUnit)
})

// Methods
const updateChartData = async () => {
  isLoading.value = true

  // Simulate loading for smooth UX
  await new Promise((resolve) => setTimeout(resolve, 300))

  isLoading.value = false
}

// Lifecycle
onMounted(async () => {
  // Load initial data
  await weightStore.loadWeightEntries()
})

// Watchers
watch(
  () => themeStore.isDark,
  () => {
    // Chart will reactively update due to computed properties
  },
)
</script>

<style scoped>
.weight-trends-chart {
  width: 100%;
}

.chart-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.period-selector {
  width: 100%;
  max-width: 200px;
}

.chart-container {
  position: relative;
  width: 100%;
  min-height: 220px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: var(--q-background);
}

.chart-container.loading {
  display: flex;
  align-items: center;
  justify-content: center;
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

.chart-wrapper {
  padding: 16px;
  height: 220px;
}

.chart-stats {
  width: 100%;
}

.stat-card {
  border-radius: 8px;
  min-height: 70px;
  display: flex;
  align-items: center;
}

.stat-card .q-card-section {
  padding: 12px;
}

/* Mobile optimizations */
@media (max-width: 480px) {
  .chart-header {
    align-items: center;
  }

  .period-selector {
    max-width: 180px;
  }

  .chart-container {
    min-height: 200px;
  }

  .chart-wrapper {
    padding: 12px;
    height: 200px;
  }

  .chart-stats .row {
    gap: 8px;
  }

  .stat-card .q-card-section {
    padding: 8px;
  }

  .stat-card .text-h6 {
    font-size: 1.1rem;
  }
}

/* Dark mode styles */
body.body--dark .chart-container {
  border-color: rgba(255, 255, 255, 0.12);
}

body.body--dark .stat-card {
  background: var(--q-dark-page);
  border-color: rgba(255, 255, 255, 0.12);
}
</style>
