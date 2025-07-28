<template>
  <div class="calories-trends-chart">
    <!-- Header with time period selector -->
    <div class="chart-header q-mb-md">
      <div class="text-h6 q-mb-sm">Calorie Trends</div>
      <q-btn-toggle
        v-model="selectedPeriod"
        no-caps
        rounded
        unelevated
        toggle-color="primary"
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
        <q-spinner-dots size="40px" color="primary" />
        <div class="text-body2 q-mt-sm text-grey-6">Loading chart data...</div>
      </div>

      <div v-else-if="!hasData" class="chart-no-data">
        <q-icon name="insights" size="48px" color="grey-4" />
        <div class="text-body2 q-mt-sm text-grey-6">No data available for this period</div>
        <div class="text-caption text-grey-5">Start logging meals to see trends</div>
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
              <div class="text-h6 text-primary">{{ averageCalories }}</div>
              <div class="text-caption text-grey-6">Avg Daily</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col">
          <q-card flat bordered class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h6 text-positive">{{ maxCalories }}</div>
              <div class="text-caption text-grey-6">Highest</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col">
          <q-card flat bordered class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h6 text-orange">{{ minCalories }}</div>
              <div class="text-caption text-grey-6">Lowest</div>
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
import { useCaloriesStore } from '../stores/calories.js'
import { useThemeStore } from '../stores/theme.js'

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
})

// Stores
const caloriesStore = useCaloriesStore()
const themeStore = useThemeStore()

// Reactive data
const selectedPeriod = ref('week')
const isLoading = ref(false)

const periodOptions = [
  { label: '7D', value: 'week' },
  { label: '4W', value: 'month' },
  { label: '6M', value: 'sixmonths' },
]

// Computed properties
const chartHeight = computed(() => props.height)

const rawChartData = computed(() => {
  switch (selectedPeriod.value) {
    case 'week':
      return caloriesStore.dailyCaloriesData(7)
    case 'month':
      return caloriesStore.dailyCaloriesData(28)
    case 'sixmonths':
      return caloriesStore.monthlyCaloriesData(6)
    default:
      return []
  }
})

const hasData = computed(() => {
  return rawChartData.value.length > 0 && rawChartData.value.some((item) => item.calories > 0)
})

const chartData = computed(() => {
  if (!hasData.value) return { labels: [], datasets: [] }

  const data = rawChartData.value
  const isDarkMode = themeStore.isDark

  return {
    labels: data.map((item) => item.label),
    datasets: [
      {
        label: 'Calories',
        data: data.map((item) => item.calories),
        borderColor: isDarkMode ? '#82B1FF' : '#1976D2',
        backgroundColor: isDarkMode ? 'rgba(130, 177, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: isDarkMode ? '#82B1FF' : '#1976D2',
        pointBorderColor: isDarkMode ? '#82B1FF' : '#1976D2',
        pointHoverBackgroundColor: isDarkMode ? '#82B1FF' : '#1976D2',
        pointHoverBorderColor: isDarkMode ? '#FFFFFF' : '#FFFFFF',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
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
        borderColor: isDarkMode ? '#82B1FF' : '#1976D2',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function (context) {
            return context[0].label
          },
          label: function (context) {
            return `${context.parsed.y} calories`
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
        beginAtZero: true,
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
            return value + ' cal'
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
const averageCalories = computed(() => {
  if (!hasData.value) return 0
  const total = rawChartData.value.reduce((sum, item) => sum + item.calories, 0)
  const count = rawChartData.value.filter((item) => item.calories > 0).length || 1
  return Math.round(total / count)
})

const maxCalories = computed(() => {
  if (!hasData.value) return 0
  return Math.max(...rawChartData.value.map((item) => item.calories))
})

const minCalories = computed(() => {
  if (!hasData.value) return 0
  const nonZeroCalories = rawChartData.value
    .map((item) => item.calories)
    .filter((calories) => calories > 0)

  return nonZeroCalories.length > 0 ? Math.min(...nonZeroCalories) : 0
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
  await caloriesStore.loadMeals()
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
.calories-trends-chart {
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
