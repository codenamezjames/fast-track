<template>
  <div class="calories-chart">
    <svg :width="chartWidth" :height="chartHeight" viewBox="0 0 320 120" class="chart-svg">
      <!-- Grid lines -->
      <g class="grid-lines">
        <line
          v-for="i in 5"
          :key="i"
          :x1="0"
          :y1="i * 20"
          :x2="320"
          :y2="i * 20"
          stroke="#f1f3f4"
          stroke-width="1"
        />
      </g>

      <!-- Chart area gradient -->
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color: #4f7cff; stop-opacity: 0.3" />
          <stop offset="100%" style="stop-color: #4f7cff; stop-opacity: 0.1" />
        </linearGradient>
      </defs>

      <!-- Chart area fill -->
      <path :d="areaPath" fill="url(#chartGradient)" stroke="none" />

      <!-- Chart line -->
      <path
        :d="linePath"
        fill="none"
        stroke="#4f7cff"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Data points -->
      <circle
        v-for="(point, index) in chartPoints"
        :key="index"
        :cx="point.x"
        :cy="point.y"
        r="4"
        fill="#4f7cff"
        stroke="white"
        stroke-width="2"
      />
    </svg>

    <!-- Day labels -->
    <div class="day-labels">
      <div
        v-for="(day, index) in dayLabels"
        :key="index"
        class="day-label"
        :class="{ active: index === todayIndex }"
      >
        {{ day }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useCaloriesStore } from '../stores/calories.js'

const props = defineProps({
  viewMode: {
    type: String,
    default: 'weekly',
    validator: (value) => ['daily', 'weekly'].includes(value),
  },
})

const caloriesStore = useCaloriesStore()

const chartWidth = 320
const chartHeight = 120
const chartPadding = 20

// Labels and data based on view mode
const dayLabels = computed(() => {
  if (props.viewMode === 'daily') {
    // Show last 24 hours in 4-hour intervals with better formatting
    return ['12AM', '4AM', '8AM', '12PM', '4PM', '8PM']
  } else {
    // Weekly view - show last 7 days
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    return days
  }
})

const todayIndex = computed(() => {
  if (props.viewMode === 'daily') {
    // For daily view, highlight current time period
    const now = new Date()
    const hours = now.getHours()
    return Math.floor(hours / 4) // 0-5 for the 6 time periods
  } else {
    // Weekly view
    const today = new Date().getDay()
    return today === 0 ? 6 : today - 1 // Convert Sunday (0) to 6, Mon-Sat to 0-5
  }
})

const chartData = computed(() => {
  if (props.viewMode === 'daily') {
    return dailyData.value
  } else {
    return weeklyData.value
  }
})

const dailyData = computed(() => {
  const data = []
  const today = new Date()
  const todayMeals = caloriesStore.mealsByDate(today)

  // Group meals by 4-hour periods
  for (let i = 0; i < 6; i++) {
    const startHour = i * 4
    const endHour = (i + 1) * 4

    const periodCalories = todayMeals
      .filter((meal) => {
        const mealHour = new Date(meal.meal_time).getHours()
        return mealHour >= startHour && mealHour < endHour
      })
      .reduce((total, meal) => total + meal.calories, 0)

    data.push(periodCalories)
  }

  return data
})

const weeklyData = computed(() => {
  const data = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const calories = caloriesStore.caloriesByDate(date)
    data.push(calories)
  }

  return data
})

const chartPoints = computed(() => {
  const dataPoints = chartData.value
  const maxCalories = Math.max(...dataPoints, props.viewMode === 'daily' ? 1000 : 2500) // Different scales
  const minCalories = 0
  const range = maxCalories - minCalories
  const pointCount = dataPoints.length

  return dataPoints.map((calories, index) => {
    const x = (index * (chartWidth - chartPadding * 2)) / (pointCount - 1) + chartPadding
    const y =
      chartHeight -
      ((calories - minCalories) / range) * (chartHeight - chartPadding * 2) -
      chartPadding
    return { x, y, calories }
  })
})

const linePath = computed(() => {
  if (chartPoints.value.length === 0) return ''

  let path = `M ${chartPoints.value[0].x} ${chartPoints.value[0].y}`

  for (let i = 1; i < chartPoints.value.length; i++) {
    const prevPoint = chartPoints.value[i - 1]
    const currentPoint = chartPoints.value[i]

    // Create smooth curves using quadratic bezier curves
    const controlX = (prevPoint.x + currentPoint.x) / 2
    path += ` Q ${controlX} ${prevPoint.y} ${controlX} ${(prevPoint.y + currentPoint.y) / 2}`
    path += ` Q ${controlX} ${currentPoint.y} ${currentPoint.x} ${currentPoint.y}`
  }

  return path
})

const areaPath = computed(() => {
  if (chartPoints.value.length === 0) return ''

  let path = linePath.value
  // Close the path at the bottom
  const lastPoint = chartPoints.value[chartPoints.value.length - 1]
  const firstPoint = chartPoints.value[0]
  path += ` L ${lastPoint.x} ${chartHeight - chartPadding}`
  path += ` L ${firstPoint.x} ${chartHeight - chartPadding}`
  path += ' Z'

  return path
})

onMounted(() => {
  caloriesStore.loadMeals()
})
</script>

<style scoped>
.calories-chart {
  width: 100%;
  max-width: 320px;
}

.chart-svg {
  width: 100%;
  height: auto;
  margin-bottom: 12px;
}

.day-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
}

.day-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  text-align: center;
  min-width: 30px;
  flex: 1;
}

.day-label.active {
  color: #4f7cff;
  font-weight: 600;
}

.grid-lines {
  opacity: 0.5;
}
</style>
