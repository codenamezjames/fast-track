<template>
  <q-page class="dashboard-page fit">
    <div class="dashboard-container">
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
                  <q-item-label caption>{{ notificationsStore.notificationSummary }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle 
                    v-model="notificationsEnabled" 
                    @update:model-value="toggleNotifications"
                    :loading="notificationsStore.isLoading"
                  />
                </q-item-section>
              </q-item>

              <!-- Notification Details (when enabled) -->
              <template v-if="notificationsEnabled && notificationsStore.isEnabled">
                <q-separator />
                
                                 <q-item>
                   <q-item-section>
                     <q-item-label>Notification Details</q-item-label>
                     <q-item-label caption>Configure your notification preferences</q-item-label>
                   </q-item-section>
                   <q-item-section side>
                     <q-btn 
                       flat 
                       icon="tune" 
                       @click="showNotificationSettings = true"
                       size="sm"
                     />
                   </q-item-section>
                 </q-item>

                                 <q-separator />

                <q-item>
                  <q-item-section>
                    <q-item-label>Notification Status</q-item-label>
                    <q-item-label caption>
                      {{ getNotificationStatusText() }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-chip 
                      :color="getNotificationStatusColor()" 
                      text-color="white" 
                      size="sm"
                    >
                      {{ getNotificationStatusLabel() }}
                    </q-chip>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item>
                  <q-item-section>
                    <q-item-label>Test Notification</q-item-label>
                    <q-item-label caption>Send a test notification</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn 
                      flat 
                      icon="send" 
                      @click="sendTestNotification"
                      size="sm"
                      :loading="sendingTest"
                      :disable="!isNotificationSupported"
                    />
                  </q-item-section>
                </q-item>
              </template>

              <q-separator />

                             <q-item>
                 <q-item-section>
                   <q-item-label>Theme</q-item-label>
                   <q-item-label caption>{{ themeStore.themeLabel }}</q-item-label>
                 </q-item-section>
                 <q-item-section side>
                   <q-btn
                     flat
                     round
                     :icon="themeStore.themeIcon"
                     @click="showThemeDialog = true"
                     size="sm"
                     :loading="themeStore.isLoading"
                   />
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

   

    <!-- Notification Settings Dialog -->
    <q-dialog v-model="showNotificationSettings" position="bottom">
      <q-card style="width: 100%; max-width: 400px">
        <q-card-section>
          <div class="text-h6 q-mb-md">Notification Settings</div>
          
          <!-- Fasting Notifications -->
          <div class="text-subtitle2 q-mb-sm">Fasting Notifications</div>
          <q-list bordered class="rounded-borders q-mb-md">
            <q-item>
              <q-item-section>
                <q-item-label>Enable Fasting Notifications</q-item-label>
                <q-item-label caption>Get reminders for fasting sessions</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle 
                  v-model="notificationsStore.preferences.fasting.enabled"
                  @update:model-value="updateNotificationPreferences"
                />
              </q-item-section>
            </q-item>

            <template v-if="notificationsStore.preferences.fasting.enabled">
              <q-separator />
              
              <q-item>
                <q-item-section>
                  <q-item-label>Start Reminders</q-item-label>
                  <q-item-label caption>Notify before fast begins</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle 
                    v-model="notificationsStore.preferences.fasting.startReminder"
                    @update:model-value="updateNotificationPreferences"
                  />
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item>
                <q-item-section>
                  <q-item-label>Progress Updates</q-item-label>
                  <q-item-label caption>Get progress notifications during fast</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle 
                    v-model="notificationsStore.preferences.fasting.progressUpdates"
                    @update:model-value="updateNotificationPreferences"
                  />
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item>
                <q-item-section>
                  <q-item-label>End Reminders</q-item-label>
                  <q-item-label caption>Notify when fast is complete</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle 
                    v-model="notificationsStore.preferences.fasting.endReminder"
                    @update:model-value="updateNotificationPreferences"
                  />
                </q-item-section>
              </q-item>
            </template>
          </q-list>

          <!-- Meal Notifications -->
          <div class="text-subtitle2 q-mb-sm">Meal Reminder Notifications</div>
          <q-list bordered class="rounded-borders q-mb-md">
            <q-item>
              <q-item-section>
                <q-item-label>Enable Meal Reminders</q-item-label>
                <q-item-label caption>Get reminders to log your meals</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle 
                  v-model="notificationsStore.preferences.meals.enabled"
                  @update:model-value="updateNotificationPreferences"
                />
              </q-item-section>
            </q-item>

            <template v-if="notificationsStore.preferences.meals.enabled">
              <q-separator />
              
              <q-item>
                <q-item-section>
                  <q-item-label>Reminder Times</q-item-label>
                  <q-item-label caption>When to remind you to log meals</q-item-label>
                  <div class="q-mt-sm">
                    <q-chip
                      v-for="time in notificationsStore.preferences.meals.reminderTimes"
                      :key="time"
                      removable
                      @remove="removeReminderTime(time)"
                      color="primary"
                      text-color="white"
                      size="sm"
                      class="q-mr-xs q-mb-xs"
                    >
                      {{ time }}
                    </q-chip>
                    <q-btn
                      flat
                      icon="add"
                      size="sm"
                      @click="showAddReminderTime = true"
                      class="q-ml-xs"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </template>
          </q-list>

          <!-- General Settings -->
          <div class="text-subtitle2 q-mb-sm">General Settings</div>
          <q-list bordered class="rounded-borders q-mb-md">
            <q-item>
              <q-item-section>
                <q-item-label>Sound</q-item-label>
                <q-item-label caption>Play sound with notifications</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle 
                  v-model="notificationsStore.preferences.general.sound"
                  @update:model-value="updateNotificationPreferences"
                />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item>
              <q-item-section>
                <q-item-label>Vibration</q-item-label>
                <q-item-label caption>Vibrate device for notifications</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle 
                  v-model="notificationsStore.preferences.general.vibration"
                  @update:model-value="updateNotificationPreferences"
                />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item>
              <q-item-section>
                <q-item-label>Quiet Hours</q-item-label>
                <q-item-label caption>Disable notifications during these hours</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle 
                  v-model="notificationsStore.preferences.general.quietHours.enabled"
                  @update:model-value="updateNotificationPreferences"
                />
              </q-item-section>
            </q-item>

            <template v-if="notificationsStore.preferences.general.quietHours.enabled">
              <q-separator />
              
              <q-item>
                <q-item-section>
                  <q-item-label>Quiet Hours Times</q-item-label>
                  <div class="row q-gutter-sm q-mt-xs">
                    <div @click.stop="showQuietStartPicker" class="cursor-pointer">
                      <q-input
                        v-model="notificationsStore.preferences.general.quietHours.startTime"
                        outlined
                        dense
                        label="Start"
                        style="width: 120px"
                        readonly
                        @update:model-value="updateNotificationPreferences"
                      >
                        <template v-slot:append>
                          <q-icon name="access_time" class="cursor-pointer" size="xs">
                            <q-popup-proxy ref="quietStartProxy" cover transition-show="scale" transition-hide="scale">
                              <q-time v-model="notificationsStore.preferences.general.quietHours.startTime" format24h @update:model-value="updateNotificationPreferences">
                                <div class="row items-center justify-end">
                                  <q-btn v-close-popup label="Close" color="primary" flat />
                                </div>
                              </q-time>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div @click.stop="showQuietEndPicker" class="cursor-pointer">
                      <q-input
                        v-model="notificationsStore.preferences.general.quietHours.endTime"
                        outlined
                        dense
                        label="End"
                        style="width: 120px"
                        readonly
                        @update:model-value="updateNotificationPreferences"
                      >
                        <template v-slot:append>
                          <q-icon name="access_time" class="cursor-pointer" size="xs">
                            <q-popup-proxy ref="quietEndProxy" cover transition-show="scale" transition-hide="scale">
                              <q-time v-model="notificationsStore.preferences.general.quietHours.endTime" format24h @update:model-value="updateNotificationPreferences">
                                <div class="row items-center justify-end">
                                  <q-btn v-close-popup label="Close" color="primary" flat />
                                </div>
                              </q-time>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                  </div>
                </q-item-section>
              </q-item>
            </template>
          </q-list>

          <!-- Active Notifications -->
          <div class="text-subtitle2 q-mb-sm">Scheduled Notifications</div>
          <q-list bordered class="rounded-borders">
            <q-item v-if="notificationsStore.scheduledNotifications.length === 0">
              <q-item-section>
                <q-item-label caption>No notifications scheduled</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item 
              v-for="notification in notificationsStore.scheduledNotifications" 
              :key="notification.id"
            >
              <q-item-section>
                <q-item-label>{{ notification.title }}</q-item-label>
                <q-item-label caption>
                  {{ new Date(notification.scheduledTime).toLocaleString() }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  icon="close"
                  size="sm"
                  @click="cancelNotification(notification.id)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" @click="showNotificationSettings = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

        <!-- Add Reminder Time Dialog -->
    <q-dialog v-model="showAddReminderTime">
      <q-card style="min-width: 250px">
        <q-card-section>
          <div class="text-h6">Add Reminder Time</div>
          <div @click.stop="showReminderTimePicker" class="cursor-pointer q-mt-md">
            <q-input
              v-model="newReminderTime"
              outlined
              label="Time"
              readonly
            >
              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy ref="reminderTimeProxy" cover transition-show="scale" transition-hide="scale">
                    <q-time v-model="newReminderTime" format24h>
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelAddReminderTime" />
          <q-btn 
            color="primary" 
            label="Add" 
            @click="addReminderTime"
            :disable="!newReminderTime"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>



     <!-- Theme Selection Dialog -->
     <q-dialog v-model="showThemeDialog">
       <q-card style="min-width: 300px">
         <q-card-section>
           <div class="text-h6 q-mb-md">Choose Theme</div>
           
           <q-list>
             <q-item
               v-for="theme in themeStore.availableThemes"
               :key="theme.value"
               clickable
               @click="selectTheme(theme.value)"
               :class="themeStore.mode === theme.value ? 'bg-blue-1' : ''"
             >
               <q-item-section avatar>
                 <q-icon :name="theme.icon" :color="themeStore.mode === theme.value ? 'primary' : 'grey-6'" />
               </q-item-section>
               <q-item-section>
                 <q-item-label>{{ theme.label }}</q-item-label>
                 <q-item-label caption v-if="theme.value === 'auto'">
                   Currently: {{ themeStore.systemPrefersDark ? 'Dark' : 'Light' }}
                 </q-item-label>
               </q-item-section>
               <q-item-section side v-if="themeStore.mode === theme.value">
                 <q-icon name="check" color="primary" />
               </q-item-section>
             </q-item>
           </q-list>
         </q-card-section>

         <q-card-actions align="right">
           <q-btn flat label="Close" @click="showThemeDialog = false" />
         </q-card-actions>
       </q-card>
     </q-dialog>
     </div>
   </q-page>
 </template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/auth.js'
import { useCaloriesStore } from '../stores/calories.js'
import { useFastingStore } from '../stores/fasting.js'
import { useNotificationsStore } from '../stores/notifications.js'
import { useThemeStore } from '../stores/theme.js'
import { db } from '../services/offline.js'


const $q = useQuasar()
const authStore = useAuthStore()
const caloriesStore = useCaloriesStore()
const fastingStore = useFastingStore()
const notificationsStore = useNotificationsStore()
const themeStore = useThemeStore()

const notificationsEnabled = ref(false)
const defaultFastDuration = ref('16h')
const showDataSummary = ref(false)
const showClearDataDialog = ref(false)

const showNotificationSettings = ref(false)
const sendingTest = ref(false)
const showAddReminderTime = ref(false)
const newReminderTime = ref('')
const showThemeDialog = ref(false)
const reminderTimeProxy = ref(null)
const quietStartProxy = ref(null)
const quietEndProxy = ref(null)

const fastDurationOptions = ['12h', '16h', '18h', '20h', '24h']

// Safe window object access
const isNotificationSupported = computed(() => {
  return typeof window !== 'undefined' && 'Notification' in window
})

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
  await notificationsStore.init()
  notificationsEnabled.value = notificationsStore.isEnabled
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

const toggleNotifications = async (enabled) => {
  try {
    await notificationsStore.toggleNotifications(enabled)
    notificationsEnabled.value = notificationsStore.isEnabled
    
    if (enabled && notificationsStore.isEnabled) {
      $q.notify({
        type: 'positive',
        message: 'Notifications enabled successfully',
        position: 'top'
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to enable notifications: ' + error.message,
      position: 'top'
    })
    notificationsEnabled.value = false
  }
}

const sendTestNotification = async () => {
  sendingTest.value = true
  try {
    // Check if notifications are supported
    if (!isNotificationSupported.value) {
      throw new Error('Notifications are not supported in this browser')
    }

    // Check current permission
    let permission = isNotificationSupported.value ? Notification.permission : 'default'
    
    // Request permission if not granted
    if (permission === 'default' && isNotificationSupported.value) {
      permission = await Notification.requestPermission()
    }
    
    if (permission === 'denied') {
      throw new Error('Notification permission was denied. Please enable notifications in your browser settings.')
    }
    
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted')
    }

    // Enable notifications in store if not already enabled
    if (!notificationsStore.isEnabled) {
      await notificationsStore.toggleNotifications(true)
    }

    // Send test notification
    await notificationsStore.sendTestNotification()
    
    $q.notify({
      type: 'positive',
      message: 'Test notification sent! Check your system notifications.',
      position: 'top',
      timeout: 3000
    })
  } catch (error) {
    console.error('Test notification error:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to send test notification: ' + error.message,
      position: 'top',
      timeout: 5000
    })
  } finally {
    sendingTest.value = false
  }
}

const updateNotificationPreferences = () => {
  notificationsStore.savePreferences()
  
  if (notificationsStore.isEnabled) {
    notificationsStore.rescheduleNotifications()
  }
}

const removeReminderTime = (time) => {
  notificationsStore.removeMealReminderTime(time)
}

const addReminderTime = () => {
  if (newReminderTime.value) {
    notificationsStore.addMealReminderTime(newReminderTime.value)
    cancelAddReminderTime()
  }
}

const cancelAddReminderTime = () => {
  showAddReminderTime.value = false
  newReminderTime.value = ''
}

const cancelNotification = (id) => {
  notificationsStore.cancelScheduledNotification(id)
  
  $q.notify({
    type: 'info',
    message: 'Notification cancelled',
    position: 'top',
    timeout: 1500
  })
}



const selectTheme = (themeMode) => {
  themeStore.setMode(themeMode)
  showThemeDialog.value = false
  
  $q.notify({
    type: 'positive',
    message: `Theme changed to ${themeStore.themeLabel}`,
    position: 'top',
    timeout: 2000
  })
}

const showReminderTimePicker = () => {
  if (reminderTimeProxy.value) {
    reminderTimeProxy.value.show()
  }
}

const showQuietStartPicker = () => {
  if (quietStartProxy.value) {
    quietStartProxy.value.show()
  }
}

const showQuietEndPicker = () => {
  if (quietEndProxy.value) {
    quietEndProxy.value.show()
  }
}

const getNotificationStatusText = () => {
  if (!isNotificationSupported.value) {
    return 'Notifications not supported in this browser'
  }
  
  const permission = isNotificationSupported.value ? Notification.permission : 'default'
  switch (permission) {
    case 'granted':
      return notificationsStore.isEnabled 
        ? 'Notifications are enabled and working' 
        : 'Permission granted, but notifications disabled in app'
    case 'denied':
      return 'Permission denied - enable in browser settings'
    case 'default':
      return 'Click test button to request permission'
    default:
      return 'Unknown notification status'
  }
}

const getNotificationStatusLabel = () => {
  if (!isNotificationSupported.value) return 'Not Supported'
  
  const permission = isNotificationSupported.value ? Notification.permission : 'default'
  switch (permission) {
    case 'granted':
      return notificationsStore.isEnabled ? 'Enabled' : 'Permission OK'
    case 'denied':
      return 'Denied'
    case 'default':
      return 'Not Requested'
    default:
      return 'Unknown'
  }
}

const getNotificationStatusColor = () => {
  if (!isNotificationSupported.value) return 'grey'
  
  const permission = isNotificationSupported.value ? Notification.permission : 'default'
  switch (permission) {
    case 'granted':
      return notificationsStore.isEnabled ? 'positive' : 'warning'
    case 'denied':
      return 'negative'
    case 'default':
      return 'info'
    default:
      return 'grey'
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
    
    // Clear notifications
    notificationsStore.clearAllNotifications()
    
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

<style scoped>
.dashboard-page {
  padding: 16px;
}

.dashboard-container {
  max-width: 400px;
  margin: 0 auto;
}
</style> 