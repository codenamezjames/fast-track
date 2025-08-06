<template>
  <q-page class="dashboard-page fit">
    <!-- Top Tab Navigation -->
    <div class="top-tabs-container">
      <q-tabs
        v-model="activeTab"
        dense
        active-color="primary"
        indicator-color="primary"
        align="justify"
        @update:model-value="handleTabChange"
      >
        <q-tab name="calories" label="Calories" icon="bolt" />
        <q-tab name="weight" label="Weight" icon="monitor_weight" />
      </q-tabs>
    </div>

    <div class="dashboard-container">
      <!-- Calories Tab Content -->
      <div v-if="activeTab === 'calories'">
        <!-- Add Calories Section -->
        <q-card class="dashboard-card q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Add Calories</div>

            <!-- Calorie Buttons -->
            <div class="row q-gutter-xs q-mb-md justify-between">
              <q-btn
                v-for="amount in [25, 50, 100]"
                :key="amount"
                :label="`+${amount}`"
                color="primary"
                unelevated
                @click="addToPool(amount)"
                class="col-auto"
              />
              <q-btn
                icon="add_circle"
                color="grey-6"
                unelevated
                @click="showCustomDialog = true"
                class="col-auto"
              >
                <q-tooltip>Custom amount</q-tooltip>
              </q-btn>
              <q-btn
                icon="history"
                color="secondary"
                unelevated
                @click="showPastMealDialog = true"
                class="col-auto"
              >
                <q-tooltip>Add past meal</q-tooltip>
              </q-btn>
            </div>

            <!-- Calorie Pool Display -->
            <q-card v-if="caloriePool > 0" flat bordered class="q-mb-md">
              <q-card-section class="q-py-md q-px-lg">
                <div class="row items-center justify-between q-mb-md">
                  <div class="row items-center q-gutter-md">
                    <q-icon name="bolt" color="primary" size="lg" />
                    <div class="text-h6 text-weight-bold">{{ formatNumber(caloriePool) }} kcal</div>
                  </div>
                  <!-- Optional Notes Input -->
                  <div class="q-my-sm">
                    <q-input
                      v-model="poolNotes"
                      outlined
                      placeholder="Add notes (optional)"
                      maxlength="100"
                      dense
                    >
                      <template v-slot:prepend>
                        <q-icon name="notes" color="grey-6" />
                      </template>
                    </q-input>
                  </div>
                  <div class="row q-gutter-md">
                    <q-btn
                      color="positive"
                      label="Add Meal"
                      @click="addMealFromPool"
                      :loading="caloriesStore.isLoading"
                      icon="check"
                      unelevated
                    />
                    <q-btn color="grey-6" label="Clear" @click="clearPool" flat icon="close" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-card-section>
        </q-card>

        <!-- Calories Section -->
        <q-card class="dashboard-card q-mb-md">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">Calories</div>
              <q-btn-toggle
                v-model="chartViewMode"
                toggle-color="primary"
                :options="[
                  { label: 'Daily', value: 'daily' },
                  { label: 'Weekly', value: 'weekly' },
                ]"
                unelevated
                dense
              />
            </div>

            <CaloriesChart :view-mode="chartViewMode" />

            <div class="text-center q-mt-md">
              <div class="text-h4 text-weight-bold">{{ formatNumber(displayTotal) }}</div>
              <div class="text-caption text-grey-6">
                {{ chartViewMode === 'daily' ? 'today' : 'this week' }}
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Meals History Section -->
        <q-card class="dashboard-card">
          <q-card-section>
            <MealsHistory />
          </q-card-section>
        </q-card>
      </div>

      <!-- Weight Tab Content -->
      <div v-if="activeTab === 'weight'">
        <!-- Weight Tracking Section -->
        <q-card class="dashboard-card q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Weight Tracking</div>
            
            <!-- Current Weight Display -->
            <div v-if="currentWeight" class="current-weight-display q-mb-md">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="row items-center justify-center q-gutter-md">
                    <q-icon name="monitor_weight" color="primary" size="lg" />
                    <div>
                      <div class="text-h4 text-weight-bold text-primary">{{ currentWeight.weight }} {{ weightUnit }}</div>
                      <div class="text-caption text-grey-6">{{ formatDate(currentWeight.date) }}</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Weight Entry Form -->
            <div class="weight-entry-section q-pa-md">
              <div class="text-subtitle2 q-mb-sm">Add New Weight Entry</div>
              
                          <!-- Weight Input -->
            <div class="row q-gutter-md q-mb-md">
              <div class="col">
                <q-input
                  v-model="weightForm.weight"
                  type="number"
                  step="0.1"
                  outlined
                  :placeholder="`Enter weight (${weightUnit})`"
                  dense
                  @keyup.enter="addWeightEntry"
                >
                  <template v-slot:append>
                    <span class="text-grey-6">{{ weightUnit }}</span>
                  </template>
                </q-input>
              </div>
              <div class="col-auto">
                <q-btn-toggle
                  v-model="weightUnit"
                  no-caps
                  rounded
                  unelevated
                  toggle-color="positive"
                  :options="unitOptions"
                  dense
                />
              </div>
            </div>

              <!-- Date and Time Selection -->
              <div class="row q-gutter-md q-mb-md">
                <div class="col">
                  <q-input
                    v-model="weightForm.date"
                    outlined
                    dense
                    placeholder="Date"
                    readonly
                    @click="showDatePicker = true"
                  >
                    <template v-slot:prepend>
                      <q-icon name="event" />
                    </template>
                  </q-input>
                </div>
                <div class="col">
                  <q-input
                    v-model="weightForm.time"
                    outlined
                    dense
                    placeholder="Time"
                    readonly
                    @click="showTimePicker = true"
                  >
                    <template v-slot:prepend>
                      <q-icon name="schedule" />
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- Quick Date Presets -->
              <div class="date-presets q-mb-md">
                <div class="text-caption text-grey-6 q-mb-xs">Quick select:</div>
                <q-btn-toggle
                  v-model="selectedDatePreset"
                  no-caps
                  rounded
                  unelevated
                  toggle-color="primary"
                  :options="datePresets"
                  dense
                  @update:model-value="handleDatePresetChange"
                />
              </div>

              <!-- Add Button -->
              <div class="row q-gutter-md">
                <div class="col">
                  <q-btn
                    color="positive"
                    label="Add Weight Entry"
                    icon="add"
                    unelevated
                    @click="addWeightEntry"
                    :disable="!isWeightFormValid"
                    :loading="isAddingWeight"
                    class="full-width"
                  />
                </div>
                <div class="col-auto">
                  <q-btn
                    color="grey-6"
                    label="Clear"
                    flat
                    @click="clearWeightForm"
                    icon="close"
                  />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Weight Chart Section -->
        <q-card class="dashboard-card q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Weight Trends</div>
            <WeightTrendsChart :height="200" :weight-unit="weightUnit" />
          </q-card-section>
        </q-card>

        <!-- Weight Stats Section -->
        <q-card class="dashboard-card" v-if="currentWeight">
          <q-card-section>
            <div class="text-h6 q-mb-md">Weight Statistics</div>
            <div class="row q-gutter-md">
              <div class="col">
                <q-card flat bordered class="stat-card">
                  <q-card-section class="text-center">
                    <div class="text-h6 text-positive">{{ currentWeight.weight }}{{ weightUnit }}</div>
                    <div class="text-caption text-grey-6">Current</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col">
                <q-card flat bordered class="stat-card">
                  <q-card-section class="text-center">
                    <div class="text-h6" :class="weightChangeColor">{{ weightChangeDisplay }}</div>
                    <div class="text-caption text-grey-6">30 Day Change</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col">
                <q-card flat bordered class="stat-card">
                  <q-card-section class="text-center">
                    <div class="text-h6 text-orange">{{ averageWeightDisplay }}{{ weightUnit }}</div>
                    <div class="text-caption text-grey-6">30 Day Average</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Custom Calorie Dialog -->
    <q-dialog v-model="showCustomDialog" persistent>
      <q-card>
        <DialogHeader title="Add Custom Calories" @close="closeCustomDialog" />

        <q-card-section class="dialog-content">
          <div class="custom-input-large">
            <q-input
              v-model="customAmount"
              type="number"
              outlined
              placeholder="Enter calories"
              autofocus
              @keyup.enter="addCustomFromDialog"
              class="calorie-input"
            >
              <template v-slot:append>
                <span class="input-suffix">kcal</span>
              </template>
            </q-input>
          </div>

          <!-- Quick presets in dialog -->
          <div class="dialog-presets">
            <div class="preset-label">Quick add:</div>
            <div class="preset-buttons">
              <q-btn
                v-for="amount in [200, 300, 500]"
                :key="amount"
                :label="`${amount}`"
                outline
                class="preset-btn"
                @click="customAmount = amount.toString()"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancel" @click="closeCustomDialog" />
          <q-btn
            label="Add to Meal"
            color="primary"
            unelevated
            @click="addCustomFromDialog"
            :disable="!customAmount || customAmount <= 0"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Meal Dialog (for adding past meals) -->
    <MealDialog v-model="showPastMealDialog" @saved="onMealSaved" />

    <!-- Weight Entry Dialog -->
    <WeightEntryDialog v-model="showWeightDialog" @saved="onWeightSaved" />

    <!-- Date Picker -->
    <q-dialog v-model="showDatePicker">
      <q-card>
        <q-card-section>
          <div class="text-h6">Select Date</div>
        </q-card-section>
        <q-card-section>
          <q-date v-model="weightForm.date" mask="YYYY/MM/DD" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showDatePicker = false" />
          <q-btn color="primary" label="OK" @click="showDatePicker = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Time Picker -->
    <q-dialog v-model="showTimePicker">
      <q-card>
        <q-card-section>
          <div class="text-h6">Select Time</div>
        </q-card-section>
        <q-card-section>
          <q-time v-model="weightForm.time" mask="HH:mm" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showTimePicker = false" />
          <q-btn color="primary" label="OK" @click="showTimePicker = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Notify } from 'quasar'
import { useCaloriesStore } from '../stores/calories.js'
import { useWeightStore } from '../stores/weight.js'
import CaloriesChart from '../components/CaloriesChart.vue'
import MealsHistory from '../components/MealsHistory.vue'
import WeightTrendsChart from '../components/WeightTrendsChart.vue'
import DialogHeader from '../components/DialogHeader.vue'
import MealDialog from '../components/MealDialog.vue'
import WeightEntryDialog from '../components/WeightEntryDialog.vue'

const router = useRouter()
const route = useRoute()
const caloriesStore = useCaloriesStore()
const weightStore = useWeightStore()

// Tab management
const activeTab = ref('calories')

// Watch for route changes to sync tab with URL
watch(
  () => route.path,
  (newPath) => {
    if (newPath.includes('/weight')) {
      activeTab.value = 'weight'
    } else {
      activeTab.value = 'calories'
    }
  },
  { immediate: true }
)

// Calories related refs
const customAmount = ref('')
const caloriePool = ref(0)
const poolNotes = ref('')
const showCustomDialog = ref(false)
const showPastMealDialog = ref(false)
const chartViewMode = ref('daily')

// Weight related refs
const showWeightDialog = ref(false)
const weightUnit = ref('lbs')
const showDatePicker = ref(false)
const showTimePicker = ref(false)
const isAddingWeight = ref(false)
const selectedDatePreset = ref('')

// Weight form data
const weightForm = ref({
  weight: '',
  date: '',
  time: '',
})

// Date presets
const datePresets = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' }
]

const unitOptions = [
  { label: 'lbs', value: 'lbs' },
  { label: 'kg', value: 'kg' },
]

onMounted(async () => {
  await caloriesStore.loadMeals()
  await weightStore.loadWeightEntries()
  setDefaultDateTime()
})

// Calories methods
const addToPool = (amount) => {
  caloriePool.value += amount
}

const addCustomFromDialog = () => {
  const amount = parseInt(customAmount.value)
  if (amount && amount > 0) {
    caloriePool.value += amount

    // Add visual feedback
    Notify.create({
      type: 'info',
      message: `+${amount} added to meal`,
      position: 'top',
      timeout: 1000,
      color: 'blue-5',
    })

    closeCustomDialog()
  }
}

const closeCustomDialog = () => {
  showCustomDialog.value = false
  customAmount.value = ''
}

const addMealFromPool = async () => {
  if (caloriePool.value <= 0) return

  try {
    await caloriesStore.addMeal(caloriePool.value, poolNotes.value)

    Notify.create({
      type: 'positive',
      message: `Meal logged: ${formatNumber(caloriePool.value)} calories`,
      position: 'top',
      timeout: 2000,
    })

    // Clear the pool after successful addition
    caloriePool.value = 0
    poolNotes.value = ''
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Failed to add meal',
      position: 'top',
    })
  }
}

const clearPool = () => {
  caloriePool.value = 0
  poolNotes.value = ''
}

const onMealSaved = () => {
  // Meal was saved successfully, no additional action needed
  // The MealDialog component handles the notifications
}

// Weight methods
const onWeightSaved = () => {
  // Weight was saved successfully
  Notify.create({
    type: 'positive',
    message: 'Weight entry saved successfully',
    position: 'top',
    timeout: 2000,
  })
}

const addWeightEntry = async () => {
  if (!isWeightFormValid.value) return

  const weight = parseFloat(weightForm.value.weight)
  if (!weight || weight <= 0) return

  isAddingWeight.value = true

  try {
    // Convert Quasar date format (YYYY/MM/DD) to ISO format (YYYY-MM-DD)
    const isoDate = weightForm.value.date.replace(/\//g, '-')
    const dateTimeString = `${isoDate}T${weightForm.value.time}:00`
    const entryDateTime = new Date(dateTimeString)

    // Validate the date is valid
    if (isNaN(entryDateTime.getTime())) {
      throw new Error('Invalid date or time selected')
    }

    await weightStore.addWeightEntry(weight, entryDateTime.toISOString(), weightUnit.value)

    Notify.create({
      type: 'positive',
      message: `Weight logged: ${weight} ${weightUnit.value}`,
      position: 'top',
      timeout: 2000,
    })

    clearWeightForm()
  } catch (error) {
    console.error('Error adding weight entry:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to add weight entry',
      position: 'top',
    })
  } finally {
    isAddingWeight.value = false
  }
}

const clearWeightForm = () => {
  weightForm.value.weight = ''
  weightForm.value.date = ''
  weightForm.value.time = ''
  selectedDatePreset.value = ''
  setDefaultDateTime()
}

const setDefaultDateTime = () => {
  const now = new Date()
  weightForm.value.date = now.toISOString().slice(0, 10).replace(/-/g, '/')
  weightForm.value.time = now.toTimeString().slice(0, 5)
}

const handleDatePresetChange = (preset) => {
  const now = new Date()
  
  switch (preset) {
    case 'today': {
      weightForm.value.date = now.toISOString().slice(0, 10).replace(/-/g, '/')
      break
    }
    case 'yesterday': {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      weightForm.value.date = yesterday.toISOString().slice(0, 10).replace(/-/g, '/')
      break
    }
    case 'thisWeek': {
      // Set to start of current week (Monday)
      const dayOfWeek = now.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const monday = new Date(now.getTime() - daysToMonday * 24 * 60 * 60 * 1000)
      weightForm.value.date = monday.toISOString().slice(0, 10).replace(/-/g, '/')
      break
    }
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const handleTabChange = (tab) => {
  if (tab === 'calories') {
    router.push('/app/logging/calories')
  } else if (tab === 'weight') {
    router.push('/app/logging/weight')
  }
}

// Computed properties
const displayTotal = computed(() => {
  if (chartViewMode.value === 'daily') {
    return caloriesStore.todaysCalories
  } else {
    return caloriesStore.weeklyCalories
  }
})

const currentWeight = computed(() => weightStore.latestWeightForDisplay(weightUnit.value))

const weightChange = computed(() => {
  return weightStore.weightChange(30) // 30 day change in kg
})

const weightChangeDisplay = computed(() => {
  return weightStore.weightChangeForDisplay(30, weightUnit.value)
})

const weightChangeColor = computed(() => {
  const change = weightChange.value
  if (change > 0) return 'text-orange'
  if (change < 0) return 'text-positive'
  return 'text-grey-7'
})

const averageWeightDisplay = computed(() => {
  return weightStore.averageWeightForDisplay(30, weightUnit.value)
})

const isWeightFormValid = computed(() => {
  return (
    weightForm.value.weight &&
    weightForm.value.weight > 0 &&
    weightForm.value.date &&
    weightForm.value.time
  )
})

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}
</script>

<style scoped>
.top-tabs-container {
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid var(--q-separator-color);
}

.dashboard-page {
  padding: 0;
}

.dashboard-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.dashboard-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.custom-input-large {
  margin-bottom: 20px;
}

.calorie-input {
  font-size: 18px;
}



.dialog-presets {
  margin-top: 16px;
}

.preset-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.preset-buttons {
  display: flex;
  gap: 8px;
}

.preset-btn {
  flex: 1;
}

.stat-card {
  border-radius: 8px;
}

.current-weight-display {
  margin-bottom: 20px;
}

.weight-entry-section {
  border-radius: 8px;
  background: var(--q-card-color);
}

.date-presets {
  margin-top: 12px;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .dashboard-container {
    padding: 16px;
  }
}
</style>
