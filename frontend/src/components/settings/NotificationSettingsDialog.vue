<template>
  <BaseDialog
    v-model="isVisible"
    title="Notification Settings"
    :confirm-label="'Save'"
    :show-confirm-button="false"
    :show-cancel-button="false"
    position="bottom"
    max-width="400px"
  >
    <!-- Fasting Notifications -->
    <div class="text-subtitle2 q-mb-sm">Fasting Notifications</div>
    <q-list bordered class="rounded-borders q-mb-md">
      <q-item>
        <q-item-section>
          <q-item-label>Enable Fasting Notifications</q-item-label>
          <q-item-label caption>Get reminders for fasting sessions</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="preferences.fasting.enabled" @update:model-value="updatePreferences" />
        </q-item-section>
      </q-item>

      <template v-if="preferences.fasting.enabled">
        <q-separator />

        <q-item>
          <q-item-section>
            <q-item-label>Start Reminders</q-item-label>
            <q-item-label caption>Notify before fast begins</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="preferences.fasting.startReminder"
              @update:model-value="updatePreferences"
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
              v-model="preferences.fasting.progressUpdates"
              @update:model-value="updatePreferences"
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
              v-model="preferences.fasting.endReminder"
              @update:model-value="updatePreferences"
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
          <q-toggle v-model="preferences.meals.enabled" @update:model-value="updatePreferences" />
        </q-item-section>
      </q-item>

      <template v-if="preferences.meals.enabled">
        <q-separator />

        <q-item>
          <q-item-section>
            <q-item-label>Reminder Times</q-item-label>
            <q-item-label caption>When to remind you to log meals</q-item-label>
            <div class="q-mt-sm">
              <q-chip
                v-for="time in preferences.meals.reminderTimes"
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
          <q-toggle v-model="preferences.general.sound" @update:model-value="updatePreferences" />
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
            v-model="preferences.general.vibration"
            @update:model-value="updatePreferences"
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
            v-model="preferences.general.quietHours.enabled"
            @update:model-value="updatePreferences"
          />
        </q-item-section>
      </q-item>

      <template v-if="preferences.general.quietHours.enabled">
        <q-separator />

        <q-item>
          <q-item-section>
            <q-item-label>Quiet Hours Times</q-item-label>
            <div class="row q-gutter-sm q-mt-xs">
              <div @click.stop="showQuietStartPicker" class="cursor-pointer">
                <q-input
                  v-model="preferences.general.quietHours.startTime"
                  outlined
                  dense
                  label="Start"
                  style="width: 120px"
                  readonly
                  @update:model-value="updatePreferences"
                >
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer" size="xs">
                      <q-popup-proxy
                        ref="quietStartProxy"
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-time
                          v-model="preferences.general.quietHours.startTime"
                          format24h
                          @update:model-value="updatePreferences"
                        >
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
                  v-model="preferences.general.quietHours.endTime"
                  outlined
                  dense
                  label="End"
                  style="width: 120px"
                  readonly
                  @update:model-value="updatePreferences"
                >
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer" size="xs">
                      <q-popup-proxy
                        ref="quietEndProxy"
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-time
                          v-model="preferences.general.quietHours.endTime"
                          format24h
                          @update:model-value="updatePreferences"
                        >
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

    <!-- Add Reminder Time Dialog -->
    <q-dialog v-model="showAddReminderTime" persistent>
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Add Reminder Time</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="newReminderTime"
            outlined
            label="Time (HH:MM)"
            mask="##:##"
            placeholder="09:00"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showAddReminderTime = false" />
          <q-btn
            color="primary"
            label="Add"
            @click="addReminderTime"
            :disable="!newReminderTime || !isValidTime(newReminderTime)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </BaseDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useNotificationsStore } from '../../stores/notifications.js'
import { useErrorHandling } from '../../composables/useErrorHandling.js'
import { ERROR_MESSAGES } from '../../utils/constants.js'
import BaseDialog from '../base/BaseDialog.vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['update:modelValue', 'settings-updated'])

// Stores and composables
const notificationsStore = useNotificationsStore()
const { executeWithErrorHandling } = useErrorHandling()

// Reactive refs
const showAddReminderTime = ref(false)
const newReminderTime = ref('')
const quietStartProxy = ref(null)
const quietEndProxy = ref(null)

// Computed
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const preferences = computed(() => notificationsStore.preferences)

// Methods
const updatePreferences = async () => {
  return executeWithErrorHandling(async () => {
    await notificationsStore.updatePreferences(preferences.value)
    emit('settings-updated')
  }, ERROR_MESSAGES.UPDATE_FAILED)
}

const removeReminderTime = async (time) => {
  const updatedTimes = preferences.value.meals.reminderTimes.filter((t) => t !== time)
  preferences.value.meals.reminderTimes = updatedTimes
  await updatePreferences()
}

const addReminderTime = async () => {
  if (!newReminderTime.value || !isValidTime(newReminderTime.value)) return

  if (!preferences.value.meals.reminderTimes.includes(newReminderTime.value)) {
    preferences.value.meals.reminderTimes.push(newReminderTime.value)
    await updatePreferences()
  }

  newReminderTime.value = ''
  showAddReminderTime.value = false
}

const isValidTime = (time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
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

// Watch for dialog opening to reset form
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      newReminderTime.value = ''
    }
  },
)
</script>

<style scoped>
/* Notification settings dialog specific styles */
</style>
