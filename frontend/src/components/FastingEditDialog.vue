<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="edit-dialog">
      <q-card-section class="dialog-header">
        <div class="dialog-title">{{ isEditing ? 'Edit Fast' : 'Log Past Fast' }}</div>
        <q-btn flat round dense icon="close" @click="close" />
      </q-card-section>

      <q-card-section class="dialog-body">
        <!-- Duration Display -->
        <div class="duration-display" v-if="calculatedDuration > 0">
          <div class="duration-value">{{ formatDuration(calculatedDuration) }}</div>
          <div class="duration-label">Duration</div>
        </div>

        <!-- Start Time Input -->
        <div class="input-group">
          <label class="input-label">Started</label>
          <q-input v-model="form.startTime" type="datetime-local" filled dense class="time-input" />
        </div>

        <!-- End Time Input -->
        <div class="input-group">
          <label class="input-label">Ended</label>
          <q-input v-model="form.endTime" type="datetime-local" filled dense class="time-input" />
        </div>

        <!-- Planned Duration -->
        <div class="input-group">
          <label class="input-label">Planned Duration</label>
          <div class="preset-chips">
            <button
              v-for="preset in durationPresets"
              :key="preset.hours"
              class="preset-chip"
              :class="{ active: form.plannedDuration === preset.hours }"
              @click="form.plannedDuration = preset.hours"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="dialog-actions">
        <q-btn
          v-if="isEditing"
          flat
          label="Delete"
          color="negative"
          :loading="isDeleting"
          @click="confirmDelete"
        />
        <q-space />
        <q-btn flat label="Cancel" @click="close" />
        <q-btn
          unelevated
          :label="isEditing ? 'Save' : 'Add'"
          color="primary"
          :loading="isSaving"
          :disable="!isValid"
          @click="save"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  session: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'save', 'delete'])

const $q = useQuasar()

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const isSaving = ref(false)
const isDeleting = ref(false)

const isEditing = computed(() => !!props.session)

const durationPresets = [
  { hours: 12, label: '12h' },
  { hours: 16, label: '16h' },
  { hours: 18, label: '18h' },
  { hours: 20, label: '20h' },
  { hours: 24, label: '24h' },
]

const form = ref({
  startTime: '',
  endTime: '',
  plannedDuration: 16,
})

const calculatedDuration = computed(() => {
  if (!form.value.startTime || !form.value.endTime) return 0
  const start = new Date(form.value.startTime)
  const end = new Date(form.value.endTime)
  const diff = end.getTime() - start.getTime()
  return diff > 0 ? diff / (1000 * 60 * 60) : 0
})

const isValid = computed(() => {
  return form.value.startTime && form.value.endTime && calculatedDuration.value > 0
})

// Watch for session changes to populate form
watch(
  () => props.session,
  (session) => {
    if (session) {
      form.value.startTime = formatDateTimeLocal(new Date(session.start_time))
      form.value.endTime = session.end_time ? formatDateTimeLocal(new Date(session.end_time)) : ''
      form.value.plannedDuration = session.planned_duration || 16
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

function formatDateTimeLocal(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function formatDuration(hours) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m > 0) {
    return `${h}h ${m}m`
  }
  return `${h}h`
}

function resetForm() {
  const now = new Date()
  form.value = {
    startTime: formatDateTimeLocal(new Date(now.getTime() - 16 * 60 * 60 * 1000)),
    endTime: formatDateTimeLocal(now),
    plannedDuration: 16,
  }
}

function close() {
  isOpen.value = false
}

async function save() {
  if (!isValid.value) return

  isSaving.value = true
  try {
    const data = {
      start_time: new Date(form.value.startTime).toISOString(),
      end_time: new Date(form.value.endTime).toISOString(),
      planned_duration: form.value.plannedDuration,
      actual_duration: calculatedDuration.value,
      status: 'completed',
    }

    if (isEditing.value) {
      data.id = props.session.id
    }

    emit('save', data)
    close()
  } catch {
    $q.notify({
      message: 'Failed to save',
      color: 'negative',
      position: 'top',
    })
  } finally {
    isSaving.value = false
  }
}

function confirmDelete() {
  $q.dialog({
    title: 'Delete Fast',
    message: 'Delete this fasting session?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    emit('delete', props.session.id)
    close()
  })
}
</script>

<style scoped>
.edit-dialog {
  width: 100%;
  max-width: 360px;
  border-radius: 20px;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 8px;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
}

.dialog-body {
  padding: 8px 16px 16px;
}

.duration-display {
  text-align: center;
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 16px;
}

.body--light .duration-display {
  background: rgba(79, 124, 255, 0.08);
}

.body--dark .duration-display {
  background: rgba(79, 124, 255, 0.15);
}

.duration-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--q-primary);
}

.duration-label {
  font-size: 12px;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-group {
  margin-bottom: 16px;
}

.input-group:last-child {
  margin-bottom: 0;
}

.input-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.6;
  margin-bottom: 8px;
}

.time-input :deep(.q-field__control) {
  border-radius: 12px;
}

.preset-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.preset-chip {
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.body--light .preset-chip {
  background: rgba(0, 0, 0, 0.04);
  color: inherit;
}

.body--dark .preset-chip {
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
}

.preset-chip.active {
  background: var(--q-primary);
  color: white;
}

.preset-chip:active {
  transform: scale(0.95);
}

.dialog-actions {
  padding: 8px 16px 16px;
}
</style>
