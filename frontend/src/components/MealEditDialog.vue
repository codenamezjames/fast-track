<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="edit-dialog">
      <q-card-section class="dialog-header">
        <div class="dialog-title">{{ isEditing ? 'Edit Entry' : 'Add Entry' }}</div>
        <q-btn flat round dense icon="close" @click="close" />
      </q-card-section>

      <q-card-section class="dialog-body">
        <!-- Calories Input -->
        <div class="input-group">
          <label class="input-label">Calories</label>
          <div class="calories-input">
            <input
              v-model.number="form.calories"
              type="number"
              inputmode="numeric"
              class="num-input"
              placeholder="0"
              min="1"
              max="9999"
            />
            <span class="unit-label">kcal</span>
          </div>
        </div>

        <!-- Date & Time Input -->
        <div class="input-group">
          <label class="input-label">Date & Time</label>
          <q-input
            v-model="form.dateTime"
            type="datetime-local"
            filled
            dense
            class="datetime-input"
          />
        </div>

        <!-- Notes Input -->
        <div class="input-group">
          <label class="input-label">Notes (optional)</label>
          <q-input
            v-model="form.notes"
            type="textarea"
            filled
            dense
            rows="2"
            placeholder="What did you eat?"
            class="notes-input"
          />
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
        <q-btn v-if="isEditing" flat label="Log Again" color="primary" @click="duplicate" />
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
  meal: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'save', 'delete', 'duplicate'])

const $q = useQuasar()

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const isEditing = computed(() => !!props.meal)
const isSaving = ref(false)
const isDeleting = ref(false)

const form = ref({
  calories: 0,
  dateTime: '',
  notes: '',
})

const isValid = computed(() => {
  return form.value.calories > 0 && form.value.calories <= 9999
})

// Watch for meal changes to populate form
watch(
  () => props.meal,
  (meal) => {
    if (meal) {
      form.value.calories = meal.calories || 0
      form.value.notes = meal.notes || ''
      // Convert ISO date to datetime-local format
      const date = new Date(meal.meal_time || meal.date)
      form.value.dateTime = formatDateTimeLocal(date)
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

watch(
  () => props.modelValue,
  (open) => {
    if (open && !props.meal) {
      resetForm()
    }
  },
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

function resetForm() {
  form.value = {
    calories: 0,
    dateTime: formatDateTimeLocal(new Date()),
    notes: '',
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
      calories: form.value.calories,
      dateTime: form.value.dateTime ? new Date(form.value.dateTime).toISOString() : null,
      notes: form.value.notes,
    }

    if (isEditing.value) {
      data.id = props.meal.id
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
    title: 'Delete Entry',
    message: `Delete this ${form.value.calories} kcal entry?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    emit('delete', props.meal.id)
    close()
  })
}

function duplicate() {
  // Emit duplicate with current calories and notes, but current time
  emit('duplicate', {
    calories: form.value.calories,
    notes: form.value.notes,
  })
  close()
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

.calories-input {
  display: flex;
  align-items: center;
  gap: 12px;
}

.num-input {
  flex: 1;
  padding: 14px 16px;
  border: none;
  border-radius: 12px;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
}

.body--light .num-input {
  background: rgba(0, 0, 0, 0.04);
  color: var(--q-primary);
}

.body--dark .num-input {
  background: rgba(255, 255, 255, 0.08);
  color: var(--q-primary);
}

.num-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--q-primary);
}

.num-input::placeholder {
  color: rgba(0, 0, 0, 0.2);
}

.body--dark .num-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.unit-label {
  font-size: 16px;
  font-weight: 500;
  opacity: 0.5;
}

.datetime-input :deep(.q-field__control) {
  border-radius: 12px;
}

.notes-input :deep(.q-field__control) {
  border-radius: 12px;
}

.dialog-actions {
  padding: 8px 16px 16px;
}
</style>
