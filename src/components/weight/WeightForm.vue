<template>
  <div class="weight-form">
    <!-- Weight Input -->
    <div class="weight-input-section q-mb-md">
      <div class="weight-input-large">
        <q-input
          v-model="formData.weight"
          type="number"
          step="0.1"
          outlined
          :placeholder="`Enter weight (${weightUnit})`"
          autofocus
          @keyup.enter="$emit('submit')"
          class="weight-input"
          :rules="weightRules"
        >
          <template v-slot:append>
            <span class="input-suffix">{{ weightUnit }}</span>
          </template>
        </q-input>
      </div>
    </div>

    <!-- Date and Time Selection -->
    <div class="q-mb-md">
      <div class="text-subtitle2 q-mb-sm">Date & Time</div>

      <!-- Date Presets -->
      <div class="date-presets q-mb-sm">
        <q-btn-toggle
          v-model="selectedDatePreset"
          no-caps
          rounded
          unelevated
          toggle-color="primary"
          color="grey-3"
          text-color="grey-7"
          :options="datePresets"
          class="preset-toggle"
          @update:model-value="handleDatePresetChange"
        />
      </div>

      <!-- Custom Date/Time -->
      <div class="custom-datetime">
        <div @click.stop="showDatePicker" class="cursor-pointer">
          <q-input
            v-model="formData.date"
            outlined
            label="Date"
            class="q-mb-sm"
            readonly
            :rules="dateRules"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  ref="dateProxy"
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="formData.date">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div @click.stop="showTimePicker" class="cursor-pointer">
          <q-input v-model="formData.time" outlined label="Time" readonly :rules="timeRules">
            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy
                  ref="timeProxy"
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-time v-model="formData.time" format24h>
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
    </div>

    <!-- Unit Toggle -->
    <div class="q-mb-md">
      <div class="text-subtitle2 q-mb-sm">Weight Unit</div>
      <q-btn-toggle
        v-model="weightUnit"
        no-caps
        rounded
        unelevated
        toggle-color="positive"
        color="grey-3"
        text-color="grey-7"
        :options="unitOptions"
        class="unit-toggle"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { APP_CONSTANTS } from '../../utils/constants.js'

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      weight: '',
      date: '',
      time: '',
      unit: 'lbs',
    }),
  },
  autofocus: {
    type: Boolean,
    default: true,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['update:modelValue', 'submit'])

// Reactive refs
const formData = ref({ ...props.modelValue })
const dateProxy = ref(null)
const timeProxy = ref(null)
const weightUnit = ref(props.modelValue.unit || 'lbs')
const selectedDatePreset = ref('')

// Date presets
const datePresets = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'thisWeek' },
]

const unitOptions = [
  { label: 'lbs', value: 'lbs' },
  { label: 'kg', value: 'kg' },
]

// Validation rules
const weightRules = [
  (val) => !!val || 'Weight is required',
  (val) => val > 0 || 'Weight must be greater than 0',
  (val) =>
    val <= APP_CONSTANTS.MAX_WEIGHT ||
    `Weight cannot exceed ${APP_CONSTANTS.MAX_WEIGHT} ${weightUnit.value}`,
]

const dateRules = [(val) => !!val || 'Date is required']

const timeRules = [(val) => !!val || 'Time is required']

// Computed
const isValid = computed(() => {
  return (
    formData.value.weight && formData.value.weight > 0 && formData.value.date && formData.value.time
  )
})

// Methods
const setDefaultDateTime = () => {
  const now = new Date()
  // Format for Quasar date picker (YYYY/MM/DD)
  formData.value.date =
    now.getFullYear() +
    '/' +
    String(now.getMonth() + 1).padStart(2, '0') +
    '/' +
    String(now.getDate()).padStart(2, '0')

  // Format for Quasar time picker (HH:mm)
  formData.value.time =
    String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}

const formatDateForInput = (dateStr) => {
  const date = new Date(dateStr)
  return (
    date.getFullYear() +
    '/' +
    String(date.getMonth() + 1).padStart(2, '0') +
    '/' +
    String(date.getDate()).padStart(2, '0')
  )
}

const formatTimeForInput = (dateStr) => {
  const date = new Date(dateStr)
  return date.toTimeString().slice(0, 5)
}

const handleDatePresetChange = (preset) => {
  const now = new Date()

  switch (preset) {
    case 'today':
      formData.value.date =
        now.getFullYear() +
        '/' +
        String(now.getMonth() + 1).padStart(2, '0') +
        '/' +
        String(now.getDate()).padStart(2, '0')
      break
    case 'yesterday': {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      formData.value.date =
        yesterday.getFullYear() +
        '/' +
        String(yesterday.getMonth() + 1).padStart(2, '0') +
        '/' +
        String(yesterday.getDate()).padStart(2, '0')
      break
    }
    case 'thisWeek': {
      // Set to start of current week (Monday)
      const dayOfWeek = now.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const monday = new Date(now.getTime() - daysToMonday * 24 * 60 * 60 * 1000)
      formData.value.date =
        monday.getFullYear() +
        '/' +
        String(monday.getMonth() + 1).padStart(2, '0') +
        '/' +
        String(monday.getDate()).padStart(2, '0')
      break
    }
  }
}

const loadWeightData = () => {
  if (props.isEditMode && props.modelValue) {
    formData.value.weight = props.modelValue.weight?.toString() || ''
    formData.value.date = formatDateForInput(props.modelValue.date)
    formData.value.time = formatTimeForInput(props.modelValue.date)
    formData.value.unit = props.modelValue.unit || 'lbs'
    weightUnit.value = formData.value.unit
  } else {
    // Clear form and set defaults for new entry
    formData.value.weight = ''
    setDefaultDateTime()
    formData.value.unit = 'lbs'
    weightUnit.value = 'lbs'
  }
}

const showDatePicker = () => {
  if (dateProxy.value) {
    dateProxy.value.show()
  }
}

const showTimePicker = () => {
  if (timeProxy.value) {
    timeProxy.value.show()
  }
}

// Watch for changes and emit updates
watch(
  formData,
  (newValue) => {
    emit('update:modelValue', { ...newValue, unit: weightUnit.value })
  },
  { deep: true },
)

watch(weightUnit, (newUnit) => {
  emit('update:modelValue', { ...formData.value, unit: newUnit })
})

// Watch for prop changes
watch(
  () => props.modelValue,
  (newValue) => {
    formData.value = { ...newValue }
    weightUnit.value = newValue.unit || 'lbs'
  },
  { deep: true },
)

// Initialize form data
loadWeightData()

// Expose methods for parent component
defineExpose({
  isValid,
  loadWeightData,
  setDefaultDateTime,
})
</script>

<style scoped>
.weight-form {
  width: 100%;
}

.weight-input-large {
  font-size: 1.2em;
}

.weight-input {
  font-size: 1.2em;
}

.weight-input :deep(.q-field__native) {
  font-size: 1.4em;
  text-align: center;
  font-weight: 600;
}

.input-suffix {
  font-weight: 600;
  color: var(--q-positive);
}

.preset-toggle {
  width: 100%;
}

.unit-toggle {
  width: 100%;
}

.date-presets {
  margin-bottom: 12px;
}

.custom-datetime {
  margin-top: 8px;
}
</style>
