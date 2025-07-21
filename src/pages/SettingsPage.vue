<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <!-- User Profile Card -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Profile</div>
            
            <div class="row q-gutter-md items-center">
              <q-icon name="account_circle" size="64px" color="primary" />
              
              <div class="col">
                <div class="text-subtitle1">{{ authStore.userName || 'User' }}</div>
                <div class="text-body2 text-grey-6">{{ authStore.userEmail || 'No email' }}</div>
                <div class="text-caption text-grey-5">
                  Using offline mode
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- App Settings -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">App Settings</div>
            
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label>Notifications</q-item-label>
                  <q-item-label caption>Enable app notifications</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="notificationsEnabled" />
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item>
                <q-item-section>
                  <q-item-label>Default Fast Duration</q-item-label>
                  <q-item-label caption>Your preferred fasting length</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-select
                    v-model="defaultFastDuration"
                    :options="fastDurationOptions"
                    dense
                    borderless
                    style="min-width: 80px"
                  />
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item>
                <q-item-section>
                  <q-item-label>Quick Calorie Buttons</q-item-label>
                  <q-item-label caption>Customize your favorite amounts</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn 
                    flat 
                    icon="edit" 
                    @click="showCustomizeDialog = true"
                    size="sm"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Data Management -->
      <div class="col-12">
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
        </q-card>
      </div>

      <!-- About -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">About FastTrack</div>
            
            <div class="text-body2 text-grey-7">
              Version 1.0.0<br>
              A simple calorie tracker with intermittent fasting features.<br>
              Built with Vue 3 and Quasar Framework.
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Data Summary Dialog -->
    <q-dialog v-model="showDataSummary">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Data Summary</div>
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-md">
            <div>
              <strong>Total Meals:</strong> {{ caloriesStore.meals.length }}
            </div>
            <div>
              <strong>Total Fasting Sessions:</strong> {{ fastingStore.sessions.length }}
            </div>
            <div>
              <strong>Average Daily Calories:</strong> {{ averageDailyCalories }}
            </div>
            <div>
              <strong>Longest Fast:</strong> {{ longestFast }}h
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" @click="showDataSummary = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Clear Data Confirmation -->
    <q-dialog v-model="showClearDataDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Clear All Data</div>
          <div class="text-body2 q-mt-md">
            This will permanently delete all your meals, fasting sessions, and settings. 
            This action cannot be undone.
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showClearDataDialog = false" />
          <q-btn 
            color="negative" 
            label="Clear All Data" 
            @click="clearAllData"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Customize Quick Buttons Dialog -->
    <q-dialog v-model="showCustomizeDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Customize Quick Buttons</div>
          <div class="text-body2 q-mt-md text-grey-6">
            Coming soon! You'll be able to customize your favorite calorie amounts.
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" @click="showCustomizeDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/auth.js'
import { useCaloriesStore } from '../stores/calories.js'
import { useFastingStore } from '../stores/fasting.js'
import { db } from '../services/offline.js'

const $q = useQuasar()
const authStore = useAuthStore()
const caloriesStore = useCaloriesStore()
const fastingStore = useFastingStore()

const notificationsEnabled = ref(true)
const defaultFastDuration = ref('16h')
const showDataSummary = ref(false)
const showClearDataDialog = ref(false)
const showCustomizeDialog = ref(false)

const fastDurationOptions = ['12h', '16h', '18h', '20h', '24h']

const averageDailyCalories = computed(() => {
  if (caloriesStore.meals.length === 0) return 0
  
  const totalCalories = caloriesStore.meals.reduce((sum, meal) => sum + meal.calories, 0)
  const uniqueDays = new Set(caloriesStore.meals.map(meal => 
    new Date(meal.meal_time).toDateString()
  )).size
  
  return Math.round(totalCalories / Math.max(uniqueDays, 1))
})

const longestFast = computed(() => {
  if (fastingStore.sessions.length === 0) return 0
  
  const completedSessions = fastingStore.sessions.filter(session => 
    session.actual_duration && session.actual_duration > 0
  )
  
  if (completedSessions.length === 0) return 0
  
  return Math.max(...completedSessions.map(session => session.actual_duration)).toFixed(1)
})

onMounted(async () => {
  await caloriesStore.loadMeals()
  await fastingStore.loadFastingData()
})

const exportData = () => {
  try {
    const data = {
      meals: caloriesStore.meals,
      fastingSessions: fastingStore.sessions,
      exportDate: new Date().toISOString()
    }
    
    const csvContent = convertToCSV(data)
    downloadCSV(csvContent, 'fasttrack-data.csv')
    
    $q.notify({
      type: 'positive',
      message: 'Data exported successfully!',
      position: 'top'
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to export data',
      position: 'top'
    })
  }
}

const convertToCSV = (data) => {
  let csv = 'Type,Date,Value,Notes\n'
  
  // Add meals
  data.meals.forEach(meal => {
    csv += `Meal,${meal.meal_time},${meal.calories},"${meal.notes || ''}"\n`
  })
  
  // Add fasting sessions
  data.fastingSessions.forEach(session => {
    csv += `Fast,${session.start_time},${session.actual_duration || session.planned_duration},"${session.session_type}"\n`
  })
  
  return csv
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

const clearAllData = async () => {
  try {
    // Clear all data from IndexedDB
    await db.meals.clear()
    await db.fasting_sessions.clear()
    await db.fasting_schedules.clear()
    await db.weight_entries.clear()
    await db.sync_queue.clear()
    
    // Reset stores
    caloriesStore.meals = []
    caloriesStore.todaysMeals = []
    caloriesStore.todaysCalories = 0
    
    fastingStore.sessions = []
    fastingStore.schedules = []
    fastingStore.currentSession = null
    fastingStore.activeSchedule = null
    
    showClearDataDialog.value = false
    
    $q.notify({
      type: 'positive',
      message: 'All data cleared successfully',
      position: 'top'
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to clear data',
      position: 'top'
    })
  }
}
</script> 