<template>
  <BaseDialog
    v-model="isVisible"
    :title="isEditMode ? 'Edit Weight Entry' : 'Add Weight Entry'"
    :is-loading="isLoading"
    :is-valid="isFormValid"
    :confirm-label="isEditMode ? 'Update Entry' : 'Save Entry'"
    :confirm-color="'positive'"
    @confirm="saveWeightEntry"
    @close="closeDialog"
  >
    <WeightForm
      v-model="formData"
      :autofocus="true"
      :is-edit-mode="isEditMode"
      @submit="saveWeightEntry"
    />

    <!-- Custom actions for delete button -->
    <template #actions>
      <q-btn flat label="Cancel" @click="closeDialog" />
      <q-btn
        v-if="isEditMode"
        label="Delete"
        color="negative"
        flat
        @click="deleteEntry"
        :loading="isDeleting"
      />
      <q-btn
        :label="isEditMode ? 'Update' : 'Save'"
        color="positive"
        unelevated
        @click="saveWeightEntry"
        :disable="!isFormValid || isLoading"
        :loading="isLoading"
      />
    </template>
  </BaseDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useWeightStore } from '../stores/weight.js'
import { useErrorHandling } from '../composables/useErrorHandling.js'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js'
import BaseDialog from './base/BaseDialog.vue'
import WeightForm from './weight/WeightForm.vue'

// Props and emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  entry: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'saved', 'deleted'])

// Composables
const $q = useQuasar()
const weightStore = useWeightStore()
const { handleSuccess, executeWithErrorHandling } = useErrorHandling()

// Reactive data
const formData = ref({
  weight: '',
  date: '',
  time: '',
  unit: 'lbs',
})
const isLoading = ref(false)
const isDeleting = ref(false)

// Computed properties
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditMode = computed(() => !!props.entry)

const isFormValid = computed(() => {
  return (
    formData.value.weight &&
    parseFloat(formData.value.weight) > 0 &&
    formData.value.date &&
    formData.value.time
  )
})

// Methods
const loadEntryData = () => {
  if (isEditMode.value && props.entry) {
    // Load existing entry data
    const entryDateTime = new Date(props.entry.date)
    formData.value = {
      weight: props.entry.weight.toString(),
      date: entryDateTime.toISOString().split('T')[0].replace(/-/g, '/'),
      time: `${entryDateTime.getHours().toString().padStart(2, '0')}:${entryDateTime.getMinutes().toString().padStart(2, '0')}`,
      unit: props.entry.unit || 'lbs',
    }
  } else {
    // Set defaults for new entry
    const now = new Date()
    formData.value = {
      weight: '',
      date: now.toISOString().split('T')[0].replace(/-/g, '/'),
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      unit: 'lbs',
    }
  }
}

const saveWeightEntry = async () => {
  if (!isFormValid.value) return

  const weight = parseFloat(formData.value.weight)

  return executeWithErrorHandling(async () => {
    // Convert Quasar date format (YYYY/MM/DD) to ISO format (YYYY-MM-DD)
    const isoDate = formData.value.date.replace(/\//g, '-')
    const dateTimeString = `${isoDate}T${formData.value.time}:00`
    const entryDateTime = new Date(dateTimeString)

    // Validate the date is valid
    if (isNaN(entryDateTime.getTime())) {
      throw new Error(
        `Invalid date or time selected. Date: ${formData.value.date}, Time: ${formData.value.time}`,
      )
    }

    if (isEditMode.value) {
      // Update existing entry
      await weightStore.updateWeightEntry(props.entry.id, weight, entryDateTime.toISOString())
      handleSuccess(SUCCESS_MESSAGES.WEIGHT_UPDATED)
    } else {
      // Add new entry
      await weightStore.addWeightEntry(weight, entryDateTime.toISOString())
      handleSuccess(`Weight logged: ${weight} ${formData.value.unit}`)
    }

    emit('saved')
    closeDialog()
  }, ERROR_MESSAGES.SAVE_FAILED)
}

const deleteEntry = async () => {
  if (!isEditMode.value) return

  $q.dialog({
    title: 'Delete Weight Entry',
    message: 'Are you sure you want to delete this weight entry? This action cannot be undone.',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    isDeleting.value = true

    try {
      await weightStore.deleteWeightEntry(props.entry.id)
      handleSuccess(SUCCESS_MESSAGES.WEIGHT_DELETED)
      emit('deleted')
      closeDialog()
    } catch (error) {
      console.error('Error deleting weight entry:', error)
      $q.notify({
        type: 'negative',
        message: 'Failed to delete weight entry',
        position: 'top',
        timeout: 3000,
      })
    } finally {
      isDeleting.value = false
    }
  })
}

const closeDialog = () => {
  isVisible.value = false
  // Reset form after a delay to avoid flashing
  setTimeout(() => {
    formData.value = {
      weight: '',
      date: '',
      time: '',
      unit: 'lbs',
    }
  }, 300)
}

// Watch for dialog opening to load data
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      loadEntryData()
    }
  },
)
</script>

<!-- Styles are now handled by BaseDialog and WeightForm components -->
