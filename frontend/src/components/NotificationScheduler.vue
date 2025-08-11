<template>
  <q-card class="notification-scheduler">
    <q-card-section>
      <div class="text-h6 q-mb-md">Custom Notification Scheduler</div>

      <!-- Base Event -->
      <div class="text-subtitle2 q-mb-sm">Event Details</div>
      <q-input v-model="eventTitle" outlined label="Event Title" class="q-mb-md" />

      <q-input
        v-model="eventDateTime"
        outlined
        type="datetime-local"
        label="Event Date & Time"
        class="q-mb-md"
      />

      <!-- Reminders -->
      <div class="text-subtitle2 q-mb-sm">Reminders</div>
      <div class="reminders-list">
        <q-card
          v-for="(reminder, index) in reminders"
          :key="index"
          flat
          bordered
          class="reminder-item q-mb-sm"
        >
          <q-card-section class="q-pa-sm">
            <div class="row items-center q-gutter-sm">
              <q-input
                v-model.number="reminder.offsetValue"
                type="number"
                min="1"
                outlined
                dense
                style="width: 80px"
              />

              <q-select
                v-model="reminder.offsetUnit"
                :options="timeUnits"
                outlined
                dense
                style="width: 120px"
              />

              <span class="text-caption">before event</span>

              <q-space />

              <q-btn
                flat
                round
                icon="delete"
                size="sm"
                @click="removeReminder(index)"
                color="negative"
              />
            </div>

            <q-input
              v-model="reminder.message"
              outlined
              dense
              label="Custom message (optional)"
              class="q-mt-sm"
            />
          </q-card-section>
        </q-card>

        <q-btn flat icon="add" label="Add Reminder" @click="addReminder" class="q-mb-md" />
      </div>

      <!-- Scheduled Time Preview -->
      <div class="text-subtitle2 q-mb-sm">Scheduled Notifications</div>
      <q-list bordered class="scheduled-list">
        <q-item
          v-for="(scheduledTime, index) in scheduledTimes"
          :key="index"
          class="scheduled-item"
        >
          <q-item-section>
            <q-item-label>{{ scheduledTime.title }}</q-item-label>
            <q-item-label caption>
              {{ scheduledTime.time.toLocaleString() }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-chip :color="scheduledTime.isPast ? 'grey' : 'primary'" text-color="white" size="sm">
              {{ scheduledTime.relativeTime }}
            </q-chip>
          </q-item-section>
        </q-item>

        <q-item v-if="scheduledTimes.length === 0">
          <q-item-section>
            <q-item-label caption>No reminders scheduled</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Cancel" @click="$emit('cancel')" />
      <q-btn
        color="primary"
        label="Schedule Notifications"
        @click="scheduleNotifications"
        :disable="!canSchedule"
        :loading="isScheduling"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useNotificationsStore } from '../stores/notifications.js'

const emit = defineEmits(['cancel', 'scheduled'])

const notificationsStore = useNotificationsStore()

// Event details
const eventTitle = ref('')
const eventDateTime = ref('')

// Reminders
const reminders = ref([{ offsetValue: 5, offsetUnit: 'minutes', message: '' }])

const timeUnits = [
  { label: 'Minutes', value: 'minutes' },
  { label: 'Hours', value: 'hours' },
  { label: 'Days', value: 'days' },
]

const isScheduling = ref(false)

// Computed
const canSchedule = computed(() => {
  return (
    eventTitle.value.trim() &&
    eventDateTime.value &&
    reminders.value.length > 0 &&
    reminders.value.every((r) => r.offsetValue > 0)
  )
})

const scheduledTimes = computed(() => {
  if (!eventDateTime.value) return []

  const eventTime = new Date(eventDateTime.value)
  const now = new Date()

  return reminders.value
    .map((reminder, index) => {
      const multiplier = {
        minutes: 60 * 1000,
        hours: 60 * 60 * 1000,
        days: 24 * 60 * 60 * 1000,
      }[reminder.offsetUnit]

      const reminderTime = new Date(eventTime.getTime() - reminder.offsetValue * multiplier)
      const isPast = reminderTime < now

      return {
        title: reminder.message || `${eventTitle.value} reminder`,
        time: reminderTime,
        isPast,
        relativeTime: `${reminder.offsetValue} ${reminder.offsetUnit} before`,
        index,
      }
    })
    .sort((a, b) => a.time - b.time)
})

// Methods
const addReminder = () => {
  reminders.value.push({
    offsetValue: 1,
    offsetUnit: 'hours',
    message: '',
  })
}

const removeReminder = (index) => {
  reminders.value.splice(index, 1)
}

const scheduleNotifications = async () => {
  if (!canSchedule.value) return

  isScheduling.value = true

  try {
    const eventTime = new Date(eventDateTime.value)
    let scheduledCount = 0

    for (const scheduledTime of scheduledTimes.value) {
      if (!scheduledTime.isPast) {
        const notificationId = `custom-${Date.now()}-${scheduledTime.index}`

        await notificationsStore.scheduleCustomNotification(
          notificationId,
          scheduledTime.title,
          scheduledTime.title,
          scheduledTime.time,
          {
            actions: [
              { action: 'view', title: 'View Event' },
              { action: 'dismiss', title: 'Dismiss' },
            ],
          },
        )

        scheduledCount++
      }
    }

    emit('scheduled', {
      eventTitle: eventTitle.value,
      eventTime,
      scheduledCount,
      totalReminders: reminders.value.length,
    })

    // Reset form
    eventTitle.value = ''
    eventDateTime.value = ''
    reminders.value = [{ offsetValue: 5, offsetUnit: 'minutes', message: '' }]
  } catch (error) {
    console.error('Failed to schedule notifications:', error)
    throw error
  } finally {
    isScheduling.value = false
  }
}

// Set default event time to 1 hour from now
const setDefaultEventTime = () => {
  const now = new Date()
  now.setHours(now.getHours() + 1)
  now.setMinutes(0, 0, 0) // Round to nearest hour

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  eventDateTime.value = `${year}-${month}-${day}T${hours}:${minutes}`
}

// Initialize with default time
setDefaultEventTime()
</script>

<style scoped>
.notification-scheduler {
  max-width: 500px;
  margin: 0 auto;
}

.reminders-list {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
}

.scheduled-list {
  max-height: 200px;
  overflow-y: auto;
}

.scheduled-item {
  border-bottom: 1px solid #f0f0f0;
}

.scheduled-item:last-child {
  border-bottom: none;
}
</style>
