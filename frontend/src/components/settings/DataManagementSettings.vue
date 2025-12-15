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

        <q-item clickable @click="showExportDialog = true">
          <q-item-section avatar>
            <q-icon name="download" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Export Data</q-item-label>
            <q-item-label caption>Download your data as CSV or JSON</q-item-label>
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

    <!-- Export Dialog -->
    <BaseDialog
      v-model="showExportDialog"
      title="Export Data"
      confirm-label="Export"
      @confirm="doExport"
    >
      <div class="q-gutter-md">
        <div class="text-subtitle2 q-mb-sm">What to export</div>
        <q-option-group v-model="exportType" :options="exportTypeOptions" color="primary" inline />

        <div class="text-subtitle2 q-mb-sm q-mt-md">Format</div>
        <q-option-group
          v-model="exportFormat"
          :options="exportFormatOptions"
          color="primary"
          inline
        />
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
const showExportDialog = ref(false)
const exportType = ref('all')
const exportFormat = ref('json')

// Export options
const exportTypeOptions = [
  { label: 'All', value: 'all' },
  { label: 'Meals', value: 'meals' },
  { label: 'Fasting', value: 'fasting' },
  { label: 'Weight', value: 'weight' },
]
const exportFormatOptions = [
  { label: 'JSON', value: 'json' },
  { label: 'CSV', value: 'csv' },
]

// Composables
// const $q = useQuasar()
const caloriesStore = useCaloriesStore()
const fastingStore = useFastingStore()
const weightStore = useWeightStore()
const notificationsStore = useNotificationsStore()
const themeStore = useThemeStore()
const { executeWithErrorHandling } = useErrorHandling()
const { exportAllData, exportMealsData, exportFastingData, exportWeightData, exportJSON } =
  useDataExport()

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
const doExport = async () => {
  showExportDialog.value = false

  return executeWithErrorHandling(
    async () => {
      if (exportFormat.value === 'json') {
        // JSON export
        let data = {}
        if (exportType.value === 'all') {
          data = {
            meals: caloriesStore.meals,
            fastingSessions: fastingStore.sessions,
            weightEntries: weightStore.entries,
            settings: {
              notifications: notificationsStore.preferences,
              theme: themeStore.theme,
            },
          }
          await exportAllData(data)
        } else if (exportType.value === 'meals') {
          exportJSON(caloriesStore.meals, 'fasttrack-meals.json')
        } else if (exportType.value === 'fasting') {
          exportJSON(fastingStore.sessions, 'fasttrack-fasting.json')
        } else if (exportType.value === 'weight') {
          exportJSON(weightStore.entries, 'fasttrack-weight.json')
        }
      } else {
        // CSV export
        if (exportType.value === 'all' || exportType.value === 'meals') {
          await exportMealsData(caloriesStore.meals)
        }
        if (exportType.value === 'all' || exportType.value === 'fasting') {
          await exportFastingData(fastingStore.sessions)
        }
        if (exportType.value === 'all' || exportType.value === 'weight') {
          await exportWeightData(weightStore.entries)
        }
      }
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
