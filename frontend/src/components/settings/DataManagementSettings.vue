<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 q-mb-md">Data</div>

      <q-list>
        <q-item clickable @click="showDataSummary = true">
          <q-item-section avatar>
            <q-icon name="assessment" />
          </q-item-section>
          <q-item-section>
            <q-item-label>View Data Summary</q-item-label>
            <q-item-label caption>See your tracking statistics</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable @click="exportData">
          <q-item-section avatar>
            <q-icon name="download" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Export Data</q-item-label>
            <q-item-label caption>Download your data as CSV</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable @click="showClearDataDialog = true">
          <q-item-section avatar>
            <q-icon name="delete_forever" color="negative" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-negative">Clear All Data</q-item-label>
            <q-item-label caption>Permanently delete all your data</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <!-- Data Summary Dialog -->
    <BaseDialog
      v-model="showDataSummary"
      title="Data Summary"
      :show-confirm-button="false"
      :show-cancel-button="false"
    >
      <div class="q-gutter-md">
        <div><strong>Total Meals:</strong> {{ caloriesStore.meals.length }}</div>
        <div><strong>Total Fasting Sessions:</strong> {{ fastingStore.sessions.length }}</div>
        <div><strong>Average Daily Calories:</strong> {{ averageDailyCalories }}</div>
        <div><strong>Longest Fast:</strong> {{ longestFast }}h</div>
        <div v-if="weightStore.entries.length > 0">
          <strong>Weight Entries:</strong> {{ weightStore.entries.length }}
        </div>
      </div>
    </BaseDialog>

    <!-- Clear Data Confirmation -->
    <BaseDialog
      v-model="showClearDataDialog"
      title="Clear All Data"
      confirm-label="Clear All Data"
      confirm-color="negative"
      @confirm="clearAllData"
    >
      <div class="text-body2 q-mt-md">
        This will permanently delete all your meals, fasting sessions, and settings. This action
        cannot be undone.
      </div>
    </BaseDialog>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
// import { useQuasar } from 'quasar'
import { useCaloriesStore } from '../../stores/calories.js'
import { useFastingStore } from '../../stores/fasting.js'
import { useWeightStore } from '../../stores/weight.js'
import { useNotificationsStore } from '../../stores/notifications.js'
import { useThemeStore } from '../../stores/theme.js'
import { useErrorHandling } from '../../composables/useErrorHandling.js'
import { useDataExport } from '../../composables/useDataExport.js'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../utils/constants.js'
import BaseDialog from '../base/BaseDialog.vue'

// Reactive refs
const showDataSummary = ref(false)
const showClearDataDialog = ref(false)

// Composables
// const $q = useQuasar()
const caloriesStore = useCaloriesStore()
const fastingStore = useFastingStore()
const weightStore = useWeightStore()
const notificationsStore = useNotificationsStore()
const themeStore = useThemeStore()
const { executeWithErrorHandling } = useErrorHandling()
const { exportAllData } = useDataExport()

// Computed
const averageDailyCalories = computed(() => {
  if (caloriesStore.meals.length === 0) return '0'

  const totalCalories = caloriesStore.meals.reduce((sum, meal) => sum + meal.calories, 0)
  const days = Math.max(
    1,
    Math.ceil(
      (Date.now() - new Date(caloriesStore.meals[0].meal_time).getTime()) / (1000 * 60 * 60 * 24),
    ),
  )

  return Math.round(totalCalories / days)
})

const longestFast = computed(() => {
  if (fastingStore.sessions.length === 0) return '0'

  const completedSessions = fastingStore.sessions.filter(
    (session) => session.status === 'completed',
  )
  if (completedSessions.length === 0) return '0'

  const longest = completedSessions.reduce((max, session) => {
    const duration = session.actual_duration || 0
    return duration > max ? duration : max
  }, 0)

  return longest
})

// Methods
const exportData = async () => {
  return executeWithErrorHandling(
    async () => {
      const allData = {
        meals: caloriesStore.meals,
        fastingSessions: fastingStore.sessions,
        weightEntries: weightStore.entries,
        settings: {
          notifications: notificationsStore.preferences,
          theme: themeStore.theme,
        },
      }

      await exportAllData(allData)
    },
    ERROR_MESSAGES.SAVE_FAILED,
    SUCCESS_MESSAGES.DATA_EXPORTED,
  )
}

const clearAllData = async () => {
  return executeWithErrorHandling(
    async () => {
      // Clear all stores
      await caloriesStore.clearAllData()
      await fastingStore.clearAllData()
      await weightStore.clearAllData()

      showClearDataDialog.value = false
    },
    ERROR_MESSAGES.DELETE_FAILED,
    SUCCESS_MESSAGES.DATA_CLEARED,
  )
}
</script>

<style scoped>
/* Data management settings specific styles */
</style>
