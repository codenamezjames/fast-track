<template>
  <div class="meal-form">
    <!-- Calories Input -->
    <div class="custom-input-large q-mb-md">
      <q-input
        v-model="formData.calories"
        type="number"
        outlined
        placeholder="Enter calories"
        :autofocus="autofocus"
        class="calorie-input"
        :rules="calorieRules"
        @keyup.enter="$emit('submit')"
      >
        <template v-slot:append>
          <span class="input-suffix">kcal</span>
        </template>
      </q-input>
    </div>

    <!-- Date and Time Inputs -->
    <div class="q-mb-md">
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
              <q-popup-proxy ref="dateProxy" cover transition-show="scale" transition-hide="scale">
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

      <!-- Time Input -->
      <div @click.stop="showTimePicker" class="cursor-pointer">
        <q-input v-model="formData.time" outlined label="Time" readonly :rules="timeRules">
          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy ref="timeProxy" cover transition-show="scale" transition-hide="scale">
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

    <!-- Notes Input -->
    <div class="q-mb-md">
      <q-input
        v-model="formData.notes"
        outlined
        placeholder="Notes (optional)"
        maxlength="100"
        type="textarea"
        rows="2"
        counter
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
      calories: '',
      date: '',
      time: '',
      notes: '',
    }),
  },
  autofocus: {
    type: Boolean,
    default: false,
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

// Validation rules
const calorieRules = [
  (val) => !!val || 'Calories are required',
  (val) => val > 0 || 'Calories must be greater than 0',
  (val) =>
    val <= APP_CONSTANTS.MAX_CALORIES_PER_MEAL ||
    `Calories cannot exceed ${APP_CONSTANTS.MAX_CALORIES_PER_MEAL}`,
]

const dateRules = [(val) => !!val || 'Date is required']

const timeRules = [(val) => !!val || 'Time is required']

// Computed
const isValid = computed(() => {
  return (
    formData.value.calories &&
    formData.value.calories > 0 &&
    formData.value.date &&
    formData.value.time
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

const loadMealData = () => {
  if (props.isEditMode && props.modelValue) {
    formData.value.calories = props.modelValue.calories?.toString() || ''
    formData.value.date = formatDateForInput(props.modelValue.meal_time)
    formData.value.time = formatTimeForInput(props.modelValue.meal_time)
    formData.value.notes = props.modelValue.notes || ''
  } else {
    // Clear form and set defaults for new meal
    formData.value.calories = ''
    formData.value.notes = ''
    setDefaultDateTime()
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
    emit('update:modelValue', newValue)
  },
  { deep: true },
)

// Watch for prop changes
watch(
  () => props.modelValue,
  (newValue) => {
    formData.value = { ...newValue }
  },
  { deep: true },
)

// Initialize form data
loadMealData()

// Expose methods for parent component
defineExpose({
  isValid,
  loadMealData,
  setDefaultDateTime,
})
</script>

<style scoped>
.meal-form {
  width: 100%;
}

.custom-input-large {
  font-size: 1.2em;
}

.calorie-input {
  font-size: 1.2em;
}

.calorie-input :deep(.q-field__native) {
  font-size: 1.4em;
  text-align: center;
  font-weight: 600;
}

.input-suffix {
  font-weight: 600;
  color: var(--q-primary);
}
</style>
