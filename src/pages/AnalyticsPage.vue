<template>
  <q-page class="analytics-page flex flex-center">
    <div class="analytics-container">
      <!-- Page Header -->
      <div class="page-header q-mb-lg">
        <div class="header-content">
          <h1 class="page-title">Analytics Dashboard</h1>
          <p class="page-subtitle">Track your calorie and fasting trends</p>
        </div>

        <!-- Date Range Filter -->
        <div class="flex flex-center">
          <div class="date-filter q-mt-md">
            <q-btn-toggle
              v-model="selectedTimeRange"
              no-caps
              rounded
              unelevated
              toggle-color="primary"
              color="grey-3"
              text-color="grey-7"
              :options="timeRangeOptions"
              class="time-range-selector"
              @update:model-value="updateTimeRange"
            />
          </div>
        </div>
      </div>

      <!-- Quick Stats Overview -->
      <div class="quick-stats q-mb-lg">
        <div class="row q-gutter-md justify-center">
          <div class="col-12 col-sm-6 col-md-3">
            <StatsOverviewCard
              icon="local_fire_department"
              color="primary"
              :value="totalCaloriesToday"
              label="Today's Calories"
              :show-trend="true"
              :trend-value="caloriesTrend"
              trend-suffix="%"
              trend-label="vs yesterday"
              trend-type="primary"
              :trend-direction="caloriesTrendType"
            />
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <StatsOverviewCard
              icon="timer"
              color="secondary"
              :value="currentStreakDisplay"
              label="Current Streak"
              :show-trend="true"
              :trend-value="fastingSuccessRate"
              trend-suffix="%"
              trend-label="success rate"
              trend-type="positive"
            />
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <StatsOverviewCard
              icon="trending_up"
              color="positive"
              :value="averageCaloriesDisplay"
              label="Avg Daily Calories"
              :show-trend="true"
              :trend-value="`Last ${selectedTimeRange === 'week' ? '7 days' : selectedTimeRange === 'month' ? '30 days' : '6 months'}`"
              trend-label=""
            />
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <StatsOverviewCard
              icon="schedule"
              color="orange"
              :value="totalFastingHoursDisplay"
              label="Total Fasting Hours"
              :show-trend="true"
              :trend-value="`${averageFastingDisplay} avg`"
              trend-label=""
            />
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <!-- Main Charts Row -->
        <div class="row q-gutter-md q-mb-lg">
          <!-- Calorie Trends Chart -->
          <div class="col-12 col-lg-4">
            <q-card flat bordered class="chart-card">
              <q-card-section class="chart-card-section">
                <CaloriesTrendsChart :height="280" />
              </q-card-section>
            </q-card>
          </div>

          <!-- Fasting Analytics Chart -->
          <div class="col-12 col-lg-4">
            <q-card flat bordered class="chart-card">
              <q-card-section class="chart-card-section">
                <FastingStreaksChart :height="280" />
              </q-card-section>
            </q-card>
          </div>

          <!-- Weight Trends Chart -->
          <div class="col-12 col-lg-4">
            <q-card flat bordered class="chart-card">
              <q-card-section class="chart-card-section">
                <WeightTrendsChart :height="280" :weight-unit="weightUnit" />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Side by Side Charts on Desktop -->
        <div class="row q-gutter-md q-mb-lg">
          <!-- Weekly Overview -->
          <div class="col-12 col-md-6">
            <WeeklyOverviewCard :weekly-data="weeklyOverview" />
          </div>

          <!-- Goals Progress -->
          <div class="col-12 col-md-6">
            <GoalsProgressCard :goals="goalsData" />
          </div>
        </div>

        <!-- Export Options -->
        <div class="export-section q-mb-lg">
          <ExportActionsCard
            :exporting-calories="exportingCalories"
            :exporting-fasting="exportingFasting"
            @export-calories="exportCaloriesData"
            @export-fasting="exportFastingData"
            @share-report="shareReport"
            @print-report="printReport"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import CaloriesTrendsChart from '../components/CaloriesTrendsChart.vue'
import FastingStreaksChart from '../components/FastingStreaksChart.vue'
import WeightTrendsChart from '../components/WeightTrendsChart.vue'
import StatsOverviewCard from '../components/StatsOverviewCard.vue'
import WeeklyOverviewCard from '../components/WeeklyOverviewCard.vue'
import GoalsProgressCard from '../components/GoalsProgressCard.vue'
import ExportActionsCard from '../components/ExportActionsCard.vue'
import { useCaloriesStore } from '../stores/calories.js'
import { useFastingStore } from '../stores/fasting.js'
import { useWeightStore } from '../stores/weight.js'

// Composables
const $q = useQuasar()

// Stores
const caloriesStore = useCaloriesStore()
const fastingStore = useFastingStore()
const weightStore = useWeightStore()

// Reactive data
const selectedTimeRange = ref('week')
const exportingCalories = ref(false)
const exportingFasting = ref(false)
const weightUnit = ref('lbs') // or 'kg' based on user preference

// Constants for goals (could be moved to settings store)
const dailyCalorieGoal = 2000
const weeklyFastingGoal = 5
const monthlyStreakGoal = 20

const timeRangeOptions = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: '6 Months', value: 'sixmonths' },
]

// Computed properties
const totalCaloriesToday = computed(() => caloriesStore.todaysCalories)

const todaysCalories = computed(() => caloriesStore.todaysCalories)

const currentStreak = computed(() => fastingStore.fastingStreak)

const currentStreakDisplay = computed(() => {
  const streak = currentStreak.value
  return streak > 0 ? `${streak} day${streak !== 1 ? 's' : ''}` : 'None'
})

const fastingSuccessRate = computed(() => fastingStore.fastingSuccessRate(30))

const averageCaloriesDisplay = computed(() => {
  const days =
    selectedTimeRange.value === 'week' ? 7 : selectedTimeRange.value === 'month' ? 30 : 180
  return caloriesStore.averageDailyCalories(days)
})

const totalFastingHoursDisplay = computed(() => {
  const hours = fastingStore.totalFastingHours
  return hours ? `${Math.round(hours)}h` : '0h'
})

const averageFastingDisplay = computed(() => {
  const avg = fastingStore.averageFastingDuration
  return avg > 0 ? `${avg}h` : '0h'
})

// Calculate calorie trend vs yesterday
const caloriesTrend = computed(() => {
  const today = caloriesStore.caloriesByDate(new Date())
  const yesterday = caloriesStore.caloriesByDate(new Date(Date.now() - 24 * 60 * 60 * 1000))

  if (yesterday === 0) return 0

  return Math.round(((today - yesterday) / yesterday) * 100)
})

const caloriesTrendType = computed(() => {
  const trend = caloriesTrend.value
  if (trend > 0) return 'positive'
  if (trend < 0) return 'negative'
  return 'neutral'
})

// Weekly overview data
const weeklyOverview = computed(() => {
  const data = []
  const now = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const calories = caloriesStore.caloriesByDate(date)
    const fastingData = fastingStore
      .fastingSessionsByDate(1)
      .find((item) => item.date === date.toISOString().split('T')[0])

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      calories: calories,
      fastingHours: fastingData?.hours || 0,
      calorieProgress: Math.min(calories / dailyCalorieGoal, 1),
    })
  }

  return data
})

const weeklyFastingDays = computed(() => {
  const weekData = fastingStore.fastingSessionsByDate(7)
  return weekData.filter((day) => day.completed).length
})

// Goals data for GoalsProgressCard
const goalsData = computed(() => [
  {
    id: 'calories',
    title: 'Daily Calorie Target',
    current: todaysCalories.value,
    target: dailyCalorieGoal,
    progress: Math.min(todaysCalories.value / dailyCalorieGoal, 1),
    color: 'primary',
    period: 'daily',
  },
  {
    id: 'fasting',
    title: 'Weekly Fasting Goal',
    current: weeklyFastingDays.value,
    target: weeklyFastingGoal,
    progress: Math.min(weeklyFastingDays.value / weeklyFastingGoal, 1),
    color: 'secondary',
    period: 'weekly',
  },
  {
    id: 'streak',
    title: 'Monthly Streak Goal',
    current: currentStreak.value,
    target: monthlyStreakGoal,
    progress: Math.min(currentStreak.value / monthlyStreakGoal, 1),
    color: 'positive',
    period: 'monthly',
  },
])

// Methods
const updateTimeRange = () => {
  // Charts will reactively update based on selectedTimeRange
}

const exportCaloriesData = async () => {
  exportingCalories.value = true

  try {
    const meals = caloriesStore.meals
    const csvContent = generateCSV(meals, ['meal_time', 'calories', 'notes'])

    downloadCSV(csvContent, 'calories-data.csv')

    $q.notify({
      type: 'positive',
      message: 'Calories data exported successfully',
      position: 'top',
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to export calories data',
      position: 'top',
    })
  } finally {
    exportingCalories.value = false
  }
}

const exportFastingData = async () => {
  exportingFasting.value = true

  try {
    const sessions = fastingStore.sessions
    const csvContent = generateCSV(sessions, [
      'start_time',
      'end_time',
      'planned_duration',
      'actual_duration',
      'status',
    ])

    downloadCSV(csvContent, 'fasting-data.csv')

    $q.notify({
      type: 'positive',
      message: 'Fasting data exported successfully',
      position: 'top',
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to export fasting data',
      position: 'top',
    })
  } finally {
    exportingFasting.value = false
  }
}

const generateCSV = (data, columns) => {
  const headers = columns.join(',')
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = item[col]
        // Handle dates and escape commas
        if (value && typeof value === 'string' && value.includes(',')) {
          return `"${value}"`
        }
        return value || ''
      })
      .join(','),
  )

  return [headers, ...rows].join('\n')
}

const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

const shareReport = async () => {
  const reportData = {
    totalCalories: totalCaloriesToday.value,
    currentStreak: currentStreak.value,
    avgCalories: averageCaloriesDisplay.value,
    totalFastingHours: totalFastingHoursDisplay.value,
    successRate: fastingSuccessRate.value,
  }

  const shareText = `FastTrack Health Report:
🔥 Today's Calories: ${reportData.totalCalories}
⚡ Current Streak: ${currentStreakDisplay.value}
📊 Average Daily: ${reportData.avgCalories} calories
⏱️ Total Fasting: ${reportData.totalFastingHours}
✅ Success Rate: ${reportData.successRate}%`

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'FastTrack Health Report',
        text: shareText,
      })
    } catch {
      // User cancelled or error occurred
    }
  } else {
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(shareText)
    $q.notify({
      type: 'positive',
      message: 'Report copied to clipboard',
      position: 'top',
    })
  }
}

const printReport = () => {
  window.print()
}

// Lifecycle
onMounted(async () => {
  // Load data for all stores
  await Promise.all([
    caloriesStore.loadMeals(),
    fastingStore.loadFastingData(),
    weightStore.loadWeightEntries(),
  ])
})
</script>

<style scoped>
.analytics-page {
  padding: 16px;
}

.analytics-container {
  width: 100%;
  max-width: 900px;
}

.page-header {
  text-align: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--q-primary);
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--q-text-color);
  margin: 0;
  opacity: 0.8;
}

.time-range-selector {
  width: 100%;
  max-width: 300px;
}

.chart-card {
  border-radius: 12px;
  overflow: hidden;
}

.chart-card-section {
  width: 100%;
}

.chart-card-section > * {
  width: 100%;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .analytics-page {
    padding: 12px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }
}

/* Print styles */
@media print {
  .export-section {
    display: none;
  }

  .chart-card {
    break-inside: avoid;
    margin-bottom: 24px;
  }

  .page-header {
    margin-bottom: 32px;
  }
}

/* Dark mode adjustments handled by individual components */
</style>
