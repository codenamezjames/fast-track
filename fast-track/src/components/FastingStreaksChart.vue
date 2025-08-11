<template>
  <div class="fasting-streaks-chart">
    <!-- Header with chart type selector -->
    <div class="chart-header q-mb-md">
      <div class="text-h6 q-mb-sm">Fasting Analytics</div>
      <q-btn-toggle
        v-model="selectedChart"
        no-caps
        rounded
        unelevated
        toggle-color="secondary"
        color="grey-3"
        text-color="grey-7"
        :options="chartOptions"
        class="chart-selector"
        @update:model-value="updateChartData"
      />
    </div>

    <!-- Chart container -->
    <div class="chart-container" :class="{ loading: isLoading }">
      <div v-if="isLoading" class="chart-loading">
        <q-spinner-dots size="40px" color="secondary" />
        <div class="text-body2 q-mt-sm text-grey-6">Loading chart data...</div>
      </div>

      <div v-else-if="!hasData" class="chart-no-data">
        <q-icon name="timer" size="48px" color="grey-4" />
        <div class="text-body2 q-mt-sm text-grey-6">No fasting data available</div>
        <div class="text-caption text-grey-5">Start a fast to see analytics</div>
      </div>

      <div v-else class="chart-wrapper">
        <!-- Streak Chart -->
        <div v-if="selectedChart === 'streak'" class="streak-chart">
          <div class="streak-display">
            <div class="current-streak">
              <div class="streak-number">{{ currentStreak }}</div>
              <div class="streak-label">Day{{ currentStreak !== 1 ? 's' : '' }} Streak</div>
            </div>
            <div class="streak-history">
              <div class="streak-grid">
                <div
                  v-for="(day, index) in streakHistory"
                  :key="index"
                  :class="[
                    'streak-day',
                    { completed: day.completed, missed: !day.completed && day.attempted },
                  ]"
                  :title="day.tooltip"
                >
                  <q-icon
                    :name="
                      day.completed
                        ? 'check_circle'
                        : day.attempted
                          ? 'cancel'
                          : 'radio_button_unchecked'
                    "
                    :size="day.completed ? '20px' : '16px'"
                  />
                </div>
              </div>
              <div class="streak-legend q-mt-sm">
                <div class="legend-item">
                  <q-icon name="check_circle" size="16px" color="positive" />
                  <span class="text-caption q-ml-xs">Completed</span>
                </div>
                <div class="legend-item">
                  <q-icon name="cancel" size="16px" color="negative" />
                  <span class="text-caption q-ml-xs">Missed</span>
                </div>
                <div class="legend-item">
                  <q-icon name="radio_button_unchecked" size="16px" color="grey" />
                  <span class="text-caption q-ml-xs">No Fast</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Hours Chart -->
        <div v-else-if="selectedChart === 'hours'">
          <Bar :data="hoursChartData" :options="barChartOptions" :height="chartHeight" />
        </div>

        <!-- Success Rate Chart -->
        <div v-else-if="selectedChart === 'success'">
          <Doughnut
            :data="successChartData"
            :options="doughnutChartOptions"
            :height="chartHeight"
          />
        </div>
      </div>
    </div>

    <!-- Stats summary -->
    <div v-if="hasData && !isLoading" class="chart-stats q-mt-md">
      <div class="row q-gutter-md">
        <div class="col">
          <q-card flat bordered class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h6 text-secondary">{{ totalFastingHours.toFixed(1) }}</div>
              <div class="text-caption text-grey-6">Total Hours</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col">
          <q-card flat bordered class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h6 text-positive">{{ averageFastingDuration }}</div>
              <div class="text-caption text-grey-6">Avg Duration</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col">
          <q-card flat bordered class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h6 text-orange">{{ successRate }}%</div>
              <div class="text-caption text-grey-6">Success Rate</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useFastingStore } from '../stores/fasting.js'
import { useThemeStore } from '../stores/theme.js'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

// Props
const props = defineProps({
  height: {
    type: Number,
    default: 200,
  },
})

// Stores
const fastingStore = useFastingStore()
const themeStore = useThemeStore()

// Reactive data
const selectedChart = ref('streak')
const isLoading = ref(false)

const chartOptions = [
  { label: 'Streak', value: 'streak' },
  { label: 'Hours', value: 'hours' },
  { label: 'Success', value: 'success' },
]

// Computed properties
const chartHeight = computed(() => props.height)

const hasData = computed(() => {
  return fastingStore.completedSessions.length > 0
})

const currentStreak = computed(() => fastingStore.fastingStreak)

const totalFastingHours = computed(() => fastingStore.totalFastingHours)

const averageFastingDuration = computed(() => {
  const avg = fastingStore.averageFastingDuration
  return avg > 0 ? `${avg}h` : '0h'
})

const successRate = computed(() => fastingStore.fastingSuccessRate(30))

// Streak history for the last 30 days
const streakHistory = computed(() => {
  const days = []
  const now = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateString = date.toDateString()

    const daySession = fastingStore.sessions.find(
      (session) => new Date(session.start_time).toDateString() === dateString,
    )

    days.push({
      date: date,
      completed: daySession?.status === 'completed',
      attempted: !!daySession,
      tooltip: `${date.toLocaleDateString()}: ${
        daySession?.status === 'completed' ? 'Completed' : daySession ? 'Attempted' : 'No Fast'
      }`,
    })
  }

  return days
})

// Hours chart data
const hoursChartData = computed(() => {
  if (!hasData.value) return { labels: [], datasets: [] }

  const data = fastingStore.fastingSessionsByDate(7)
  const isDarkMode = themeStore.isDark

  return {
    labels: data.map((item) => item.label),
    datasets: [
      {
        label: 'Fasting Hours',
        data: data.map((item) => item.hours),
        backgroundColor: isDarkMode ? 'rgba(156, 204, 101, 0.7)' : 'rgba(76, 175, 80, 0.7)',
        borderColor: isDarkMode ? '#9CCC65' : '#4CAF50',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  }
})

// Success rate chart data
const successChartData = computed(() => {
  if (!hasData.value) return { labels: [], datasets: [] }

  const rate = successRate.value
  const isDarkMode = themeStore.isDark

  return {
    labels: ['Completed', 'Failed'],
    datasets: [
      {
        data: [rate, 100 - rate],
        backgroundColor: [isDarkMode ? '#81C784' : '#4CAF50', isDarkMode ? '#E57373' : '#F44336'],
        borderColor: [isDarkMode ? '#66BB6A' : '#388E3C', isDarkMode ? '#EF5350' : '#D32F2F'],
        borderWidth: 2,
      },
    ],
  }
})

// Chart options
const barChartOptions = computed(() => {
  const isDarkMode = themeStore.isDark
  const textColor = isDarkMode ? '#FFFFFF' : '#000000'
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: isDarkMode ? '#9CCC65' : '#4CAF50',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return `${context.parsed.y} hours fasted`
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
          font: { size: 12 },
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
          font: { size: 12 },
          callback: function (value) {
            return value + 'h'
          },
        },
      },
    },
  }
})

const doughnutChartOptions = computed(() => {
  const isDarkMode = themeStore.isDark
  const textColor = isDarkMode ? '#FFFFFF' : '#000000'

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          font: { size: 12 },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: textColor,
        bodyColor: textColor,
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.parsed}%`
          },
        },
      },
    },
    cutout: '60%',
  }
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
  await fastingStore.loadFastingData()
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
.fasting-streaks-chart {
  width: 100%;
}

.chart-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.chart-selector {
  width: 100%;
  max-width: 240px;
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

/* Streak Chart Styles */
.streak-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.current-streak {
  text-align: center;
  margin-bottom: 24px;
}

.streak-number {
  font-size: 3rem;
  font-weight: bold;
  color: var(--q-secondary);
  line-height: 1;
}

.streak-label {
  font-size: 1rem;
  color: var(--q-text-color);
  margin-top: 4px;
}

.streak-history {
  text-align: center;
}

.streak-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4px;
  max-width: 280px;
  margin: 0 auto;
}

.streak-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: var(--q-background);
  border: 1px solid rgba(0, 0, 0, 0.12);
  transition: all 0.2s ease;
}

.streak-day.completed {
  background: rgba(76, 175, 80, 0.1);
  border-color: #4caf50;
  color: #4caf50;
}

.streak-day.missed {
  background: rgba(244, 67, 54, 0.1);
  border-color: #f44336;
  color: #f44336;
}

.streak-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
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

  .chart-selector {
    max-width: 220px;
  }

  .chart-container {
    min-height: 200px;
  }

  .chart-wrapper {
    padding: 12px;
    height: 200px;
  }

  .streak-number {
    font-size: 2.5rem;
  }

  .streak-grid {
    grid-template-columns: repeat(8, 1fr);
    max-width: 200px;
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

body.body--dark .streak-day {
  border-color: rgba(255, 255, 255, 0.12);
  background: var(--q-dark-page);
}

body.body--dark .streak-day.completed {
  background: rgba(129, 199, 132, 0.15);
  border-color: #81c784;
  color: #81c784;
}

body.body--dark .streak-day.missed {
  background: rgba(229, 115, 115, 0.15);
  border-color: #e57373;
  color: #e57373;
}
</style>
