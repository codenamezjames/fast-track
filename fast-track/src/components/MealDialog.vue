<template>
  <BaseDialog
    v-model="showDialog"
    :title="dialogTitle"
    :is-loading="isLoading"
    :is-valid="isFormValid"
    :confirm-label="isEditMode ? 'Update Meal' : 'Add Meal'"
    @confirm="saveMeal"
    @close="closeDialog"
  >
    <MealForm
      v-model="formData"
      :autofocus="!isEditMode"
      :is-edit-mode="isEditMode"
      @submit="saveMeal"
    />
  </BaseDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCaloriesStore } from '../stores/calories.js'
import { useErrorHandling } from '../composables/useErrorHandling.js'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js'
import BaseDialog from './base/BaseDialog.vue'
import MealForm from './meals/MealForm.vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  meal: {
    type: Object,
    default: null,
  },
})

// Emits
const emit = defineEmits(['update:modelValue', 'saved'])

// Store and composables
const caloriesStore = useCaloriesStore()
const { handleSuccess, executeWithErrorHandling } = useErrorHandling()

// Reactive refs
const formData = ref({
  calories: '',
  date: '',
  time: '',
  notes: '',
})
const isLoading = ref(false)

// Computed
const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditMode = computed(() => !!props.meal)

const dialogTitle = computed(() => (isEditMode.value ? 'Edit Meal' : 'Add Past Meal'))

const isFormValid = computed(() => {
  return (
    formData.value.calories &&
    formData.value.calories > 0 &&
    formData.value.date &&
    formData.value.time
  )
})

// Methods
const loadMealData = () => {
  if (isEditMode.value && props.meal) {
    formData.value = {
      calories: props.meal.calories?.toString() || '',
      date: formatDateForInput(props.meal.meal_time),
      time: formatTimeForInput(props.meal.meal_time),
      notes: props.meal.notes || '',
    }
  } else {
    // Clear form and set defaults for new meal
    formData.value = {
      calories: '',
      date: '',
      time: '',
      notes: '',
    }
    setDefaultDateTime()
  }
}

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

const closeDialog = () => {
  showDialog.value = false
}

const saveMeal = async () => {
  if (!isFormValid.value) return

  const amount = parseInt(formData.value.calories)
  const notes = formData.value.notes.trim()

  return executeWithErrorHandling(async () => {
    // Convert Quasar date format (YYYY/MM/DD) to ISO format (YYYY-MM-DD)
    const isoDate = formData.value.date.replace(/\//g, '-')
    const dateTimeString = `${isoDate}T${formData.value.time}:00`
    const mealDateTime = new Date(dateTimeString)

    // Validate the date is valid
    if (isNaN(mealDateTime.getTime())) {
      throw new Error(
        `Invalid date or time selected. Date: ${formData.value.date}, Time: ${formData.value.time}`,
      )
    }

    if (isEditMode.value) {
      // Update existing meal
      await caloriesStore.updateMeal(props.meal.id, amount, notes, mealDateTime.toISOString())
      handleSuccess(SUCCESS_MESSAGES.MEAL_UPDATED)
    } else {
      // Add new past meal
      await caloriesStore.addMeal(amount, notes, mealDateTime.toISOString())
      handleSuccess(`Past meal logged: ${formatNumber(amount)} calories`)
    }

    emit('saved')
    closeDialog()
  }, ERROR_MESSAGES.SAVE_FAILED)
}

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}

// Watch for dialog opening to load data
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      loadMealData()
    }
  },
)
</script>

<!-- Styles are now handled by BaseDialog and MealForm components -->
