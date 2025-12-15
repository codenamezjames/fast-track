<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="edit-dialog">
      <q-card-section class="dialog-header">
        <div class="dialog-title">Edit Weight</div>
        <q-btn flat round dense icon="close" @click="close" />
      </q-card-section>

      <q-card-section class="dialog-body">
        <!-- Weight Input -->
        <div class="input-group">
          <label class="input-label">Weight</label>
          <div class="weight-input-row">
            <input
              v-model.number="form.weight"
              type="number"
              inputmode="decimal"
              step="0.1"
              class="num-input"
              placeholder="0"
            />
            <div class="unit-toggle">
              <button
                class="unit-btn"
                :class="{ active: form.unit === 'lbs' }"
                @click="form.unit = 'lbs'"
              >
                lbs
              </button>
              <button
                class="unit-btn"
                :class="{ active: form.unit === 'kg' }"
                @click="form.unit = 'kg'"
              >
                kg
              </button>
            </div>
          </div>
        </div>

        <!-- Date Input -->
        <div class="input-group">
          <label class="input-label">Date</label>
          <q-input v-model="form.date" type="date" filled dense class="date-input" />
        </div>
      </q-card-section>

      <q-card-actions class="dialog-actions">
        <q-btn flat label="Delete" color="negative" :loading="isDeleting" @click="confirmDelete" />
        <q-space />
        <q-btn flat label="Cancel" @click="close" />
        <q-btn
          unelevated
          label="Save"
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
  entry: {
    type: Object,
    default: null,
  },
  defaultUnit: {
    type: String,
    default: 'lbs',
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

const form = ref({
  weight: 0,
  unit: 'lbs',
  date: '',
})

const isValid = computed(() => {
  return form.value.weight > 0 && form.value.date
})

// Watch for entry changes to populate form
watch(
  () => props.entry,
  (entry) => {
    if (entry) {
      // Weight stored in kg, convert for display
      const weightKg = entry.weight
      if (props.defaultUnit === 'lbs') {
        form.value.weight = parseFloat((weightKg * 2.20462).toFixed(1))
        form.value.unit = 'lbs'
      } else {
        form.value.weight = parseFloat(weightKg.toFixed(1))
        form.value.unit = 'kg'
      }
      // Format date
      form.value.date = formatDateInput(new Date(entry.date))
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

watch(
  () => props.defaultUnit,
  (unit) => {
    form.value.unit = unit
  },
)

function formatDateInput(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function resetForm() {
  form.value = {
    weight: 0,
    unit: props.defaultUnit,
    date: formatDateInput(new Date()),
  }
}

function close() {
  isOpen.value = false
}

async function save() {
  if (!isValid.value) return

  isSaving.value = true
  try {
    // Convert to kg for storage
    let weightKg = form.value.weight
    if (form.value.unit === 'lbs') {
      weightKg = form.value.weight / 2.20462
    }

    // Create date at noon local time to avoid timezone shifting issues
    // Date-only strings interpreted as UTC midnight, which shifts to previous day in negative timezones
    const data = {
      id: props.entry.id,
      weight: parseFloat(weightKg.toFixed(2)),
      date: new Date(form.value.date + 'T12:00:00').toISOString(),
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
    message: 'Delete this weight entry?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    emit('delete', props.entry.id)
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

.weight-input-row {
  display: flex;
  gap: 12px;
  align-items: center;
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

.unit-toggle {
  display: flex;
  gap: 4px;
}

.unit-btn {
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.body--light .unit-btn {
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.5);
}

.body--dark .unit-btn {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.5);
}

.unit-btn.active {
  background: var(--q-primary);
  color: white;
}

.date-input :deep(.q-field__control) {
  border-radius: 12px;
}

.dialog-actions {
  padding: 8px 16px 16px;
}
</style>
