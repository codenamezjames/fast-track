<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card>
      <DialogHeader :title="dialogTitle" @close="closeDialog" />

      <q-card-section class="dialog-content">
        <!-- Calories Input -->
        <div class="custom-input-large q-mb-md">
          <q-input
            v-model="mealAmount"
            type="number"
            outlined
            placeholder="Enter calories"
            :autofocus="!isEditMode"
            class="calorie-input"
          >
            <template v-slot:append>
              <span class="input-suffix">kcal</span>
            </template>
          </q-input>
        </div>

        <!-- Date Input -->
        <div class="q-mb-md">
          <div @click.stop="showDatePicker" class="cursor-pointer">
            <q-input
              v-model="mealDate"
              outlined
              label="Date"
              class="q-mb-sm"
              readonly
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="dateProxy" cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="mealDate">
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
            <q-input
              v-model="mealTime"
              outlined
              label="Time"
              readonly
            >
              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy ref="timeProxy" cover transition-show="scale" transition-hide="scale">
                    <q-time v-model="mealTime" format24h>
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
            v-model="mealNotes"
            outlined
            placeholder="Notes (optional)"
            maxlength="100"
            type="textarea"
            rows="2"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="dialog-actions">
        <q-btn flat label="Cancel" @click="closeDialog" />
        <q-btn 
          :label="isEditMode ? 'Update Meal' : 'Add Meal'" 
          color="primary" 
          unelevated
          @click="saveMeal"
          :disable="!mealAmount || mealAmount <= 0 || !mealDate || !mealTime"
          :loading="isLoading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Notify } from 'quasar'
import { useCaloriesStore } from '../stores/calories.js'
import DialogHeader from './DialogHeader.vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  meal: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'saved'])

// Store
const caloriesStore = useCaloriesStore()

// Reactive refs
const mealAmount = ref('')
const mealDate = ref('')
const mealTime = ref('')
const mealNotes = ref('')
const isLoading = ref(false)
const dateProxy = ref(null)
const timeProxy = ref(null)

// Computed
const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEditMode = computed(() => !!props.meal)

const dialogTitle = computed(() => 
  isEditMode.value ? 'Edit Meal' : 'Add Past Meal'
)

// Methods
const setDefaultDateTime = () => {
  const now = new Date()
  // Format for Quasar date picker (YYYY/MM/DD)
  mealDate.value = now.getFullYear() + '/' + 
    String(now.getMonth() + 1).padStart(2, '0') + '/' + 
    String(now.getDate()).padStart(2, '0')
  
  // Format for Quasar time picker (HH:mm)
  mealTime.value = String(now.getHours()).padStart(2, '0') + ':' + 
    String(now.getMinutes()).padStart(2, '0')
}

const formatDateForInput = (dateStr) => {
  const date = new Date(dateStr)
  return date.getFullYear() + '/' + 
    String(date.getMonth() + 1).padStart(2, '0') + '/' + 
    String(date.getDate()).padStart(2, '0')
}

const formatTimeForInput = (dateStr) => {
  const date = new Date(dateStr)
  return date.toTimeString().slice(0, 5)
}

const loadMealData = () => {
  if (isEditMode.value && props.meal) {
    mealAmount.value = props.meal.calories.toString()
    mealDate.value = formatDateForInput(props.meal.meal_time)
    mealTime.value = formatTimeForInput(props.meal.meal_time)
    mealNotes.value = props.meal.notes || ''
  } else {
    // Clear form and set defaults for new meal
    mealAmount.value = ''
    mealNotes.value = ''
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

const closeDialog = () => {
  showDialog.value = false
}

const saveMeal = async () => {
  const amount = parseInt(mealAmount.value)
  if (!amount || amount <= 0 || !mealDate.value || !mealTime.value) return
  
  isLoading.value = true
  
  try {
    // Convert Quasar date format (YYYY/MM/DD) to ISO format (YYYY-MM-DD)
    const isoDate = mealDate.value.replace(/\//g, '-')
    const dateTimeString = `${isoDate}T${mealTime.value}:00`
    const mealDateTime = new Date(dateTimeString)
    
    // Validate the date is valid
    if (isNaN(mealDateTime.getTime())) {
      throw new Error(`Invalid date or time selected. Date: ${mealDate.value}, Time: ${mealTime.value}`)
    }

    if (isEditMode.value) {
      // Update existing meal
      await caloriesStore.updateMeal(props.meal.id, amount, mealNotes.value, mealDateTime.toISOString())
      
      Notify.create({
        type: 'positive',
        message: 'Meal updated successfully',
        position: 'top',
        timeout: 2000
      })
    } else {
      // Add new past meal
      await caloriesStore.addMeal(amount, mealNotes.value, mealDateTime.toISOString())
      
      Notify.create({
        type: 'positive',
        message: `Past meal logged: ${formatNumber(amount)} calories`,
        position: 'top',
        timeout: 2000
      })
    }
    
    emit('saved')
    closeDialog()
  } catch (error) {
    console.error('Error saving meal:', error)
    Notify.create({
      type: 'negative',
      message: error.message || 'Failed to save meal',
      position: 'top',
      timeout: 3000
    })
  } finally {
    isLoading.value = false
  }
}

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}

// Watch for dialog opening to load data
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    loadMealData()
  }
})
</script>

<style scoped>
/* Minimal CSS - using Quasar components and utility classes */
.dialog-content {
  min-width: 350px;
}

.custom-input-large {
  font-size: 1.2em;
}

.calorie-input {
  font-size: 1.2em;
}

.input-suffix {
  color: #666;
  font-size: 0.9em;
}

.dialog-actions {
  padding: 16px 24px;
}
</style> 