<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 q-mb-md">App Settings</div>

      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>Notifications</q-item-label>
            <q-item-label caption>{{ notificationSummary }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="notificationsEnabled"
              @update:model-value="toggleNotifications"
              :loading="isLoading"
            />
          </q-item-section>
        </q-item>

        <!-- Notification Details (when enabled) -->
        <template v-if="notificationsEnabled && isEnabled">
          <q-separator />

          <q-item>
            <q-item-section>
              <q-item-label>Notification Details</q-item-label>
              <q-item-label caption>Configure your notification preferences</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat icon="tune" @click="showSettings = true" size="sm" />
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
              <q-chip :color="getNotificationStatusColor()" text-color="white" size="sm">
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
      </q-list>
    </q-card-section>

    <!-- Notification Settings Dialog -->
    <NotificationSettingsDialog v-model="showSettings" @settings-updated="handleSettingsUpdated" />
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotificationsStore } from '../../stores/notifications.js'
import { useErrorHandling } from '../../composables/useErrorHandling.js'
import { ERROR_MESSAGES } from '../../utils/constants.js'
import NotificationSettingsDialog from './NotificationSettingsDialog.vue'

// Reactive refs
const showSettings = ref(false)
const sendingTest = ref(false)

// Stores and composables
const notificationsStore = useNotificationsStore()
const { executeWithErrorHandling } = useErrorHandling()

// Force refresh notification state when component mounts
onMounted(() => {
  // Refresh state in case the boot file hasn't run yet
  notificationsStore.refreshStateFromService()
})

// Computed
const notificationsEnabled = computed({
  get: () => notificationsStore.isEnabled,
  set: async (value) => {
    await notificationsStore.toggleNotifications(value)
  },
})

const isEnabled = computed(() => notificationsStore.isEnabled)
const isLoading = computed(() => notificationsStore.isLoading)
const notificationSummary = computed(() => notificationsStore.notificationSummary)
const isNotificationSupported = computed(() => notificationsStore.isSupported)

// Methods
const toggleNotifications = async (enabled) => {
  return executeWithErrorHandling(
    async () => {
      await notificationsStore.toggleNotifications(enabled)
    },
    ERROR_MESSAGES.UPDATE_FAILED,
    enabled ? 'Notifications enabled' : 'Notifications disabled',
  )
}

const getNotificationStatusText = () => {
  if (!notificationsStore.isSupported) {
    return 'Notifications not supported in this browser'
  }
  if (notificationsStore.permission === 'granted') {
    return 'Notifications are enabled and working'
  }
  if (notificationsStore.permission === 'denied') {
    return 'Notifications are blocked. Please enable them in your browser settings.'
  }
  return 'Notification permission not yet requested'
}

const getNotificationStatusColor = () => {
  if (!notificationsStore.isSupported) return 'grey'
  if (notificationsStore.permission === 'granted') return 'positive'
  if (notificationsStore.permission === 'denied') return 'negative'
  return 'warning'
}

const getNotificationStatusLabel = () => {
  if (!notificationsStore.isSupported) return 'Not Supported'
  if (notificationsStore.permission === 'granted') return 'Enabled'
  if (notificationsStore.permission === 'denied') return 'Blocked'
  return 'Pending'
}

const sendTestNotification = async () => {
  sendingTest.value = true

  try {
    await notificationsStore.sendTestNotification()
  } catch (error) {
    console.error('Error sending test notification:', error)
  } finally {
    sendingTest.value = false
  }
}

const handleSettingsUpdated = () => {
  // Settings were updated, no additional action needed
}
</script>

<style scoped>
/* Notification settings specific styles */
</style>
