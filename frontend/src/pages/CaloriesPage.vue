<template>
  <q-page class="dashboard-page fit q-pa-md">
    <div class="q-mx-auto q-gutter-y-md" style="max-width: 560px">
      <!-- Calories Tab Content -->
      <div v-if="activeTab === 'calories'" class="q-gutter-y-md">
        <q-card flat bordered class="q-pa-md glass-card">
          <div class="row justify-center q-mb-md ring-glow">
            <q-circular-progress
              show-value
              :value="progressPercent"
              size="160px"
              :thickness="0.18"
              color="primary"
              track-color="grey-4"
            >
              <div class="column items-center">
                <div class="text-h3 text-weight-bold">{{ formatNumber(todaysCalories) }}</div>
                <div class="text-caption">kcal</div>
              </div>
            </q-circular-progress>
          </div>

          <div class="row justify-around q-mb-xs q-gutter-xs">
            <q-btn v-for="amt in [100,250,500]" :key="amt" :label="`+${amt}`" color="primary" class="btn-chip" @click="incrementBy(amt)" dense />
          </div>

          <div class="row items-center q-gutter-sm q-mb-md">
            <q-input v-model="entryDisplay" outlined readonly class="col display-input" dense input-class="text-h6 text-center" />
            <q-btn label="Add" color="primary" unelevated class="btn-primary-lg" @click="confirmAdd" :disable="!entryAmount" :loading="caloriesStore.isLoading" dense />
          </div>

          <div class="q-gutter-y-sm q-mt-none">
            <div class="row q-col-gutter-xs">
              <div class="col-4" v-for="n in [1,2,3]" :key="`r1-${n}`">
                <q-btn class="full-width btn-key" color="grey-7" text-color="white" unelevated @click="appendDigit(n)" dense>{{ n }}</q-btn>
              </div>
            </div>
            <div class="row q-col-gutter-xs">
              <div class="col-4" v-for="n in [4,5,6]" :key="`r2-${n}`">
                <q-btn class="full-width btn-key" color="grey-7" text-color="white" unelevated @click="appendDigit(n)" dense>{{ n }}</q-btn>
              </div>
            </div>
            <div class="row q-col-gutter-xs">
              <div class="col-4" v-for="n in [7,8,9]" :key="`r3-${n}`">
                <q-btn class="full-width btn-key" color="grey-7" text-color="white" unelevated @click="appendDigit(n)" dense>{{ n }}</q-btn>
              </div>
            </div>
            <div class="row q-col-gutter-xs">
              <div class="col-4">
                <q-btn class="full-width btn-key" color="grey-6" flat label="Clear" @click="clearEntry" dense />
              </div>
              <div class="col-4">
                <q-btn class="full-width btn-key" color="grey-7" text-color="white" unelevated @click="appendDigit(0)" dense>0</q-btn>
              </div>
              <div class="col-4">
                <q-btn class="full-width btn-key" color="grey-6" flat label="-" @click="backspace" dense />
              </div>
            </div>
          </div>
        </q-card>
      </div>

      <!-- Weight Tab Content -->
      <div v-if="activeTab === 'weight'" class="q-gutter-y-md">
        <!-- Weight Tracking Section -->
        <q-card class="dashboard-card" flat bordered>
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
        <q-card class="dashboard-card q-mb-md" flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">Weight Trends</div>
            <WeightTrendsChart :height="200" :weight-unit="weightUnit" />
          </q-card-section>
        </q-card>

        <!-- Weight Stats Section -->
        <q-card class="dashboard-card" flat bordered v-if="currentWeight">
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
import { useRoute } from 'vue-router'
import { Notify } from 'quasar'
import { useCaloriesStore } from '../stores/calories.js'
import { useWeightStore } from '../stores/weight.js'
import WeightTrendsChart from '../components/WeightTrendsChart.vue'
import DialogHeader from '../components/DialogHeader.vue'
import MealDialog from '../components/MealDialog.vue'
import WeightEntryDialog from '../components/WeightEntryDialog.vue'

const route = useRoute()
const caloriesStore = useCaloriesStore()
const weightStore = useWeightStore()

// Tab management
const activeTab = ref('calories')

// Track bottom-tab driven navigation to toggle local content
watch(
  () => route.path,
  (newPath) => {
    activeTab.value = newPath.includes('/weight') ? 'weight' : 'calories'
  },
  { immediate: true }
)

// Calories related refs
const customAmount = ref('')
const caloriePool = ref(0)
const showCustomDialog = ref(false)
const showPastMealDialog = ref(false)

// Numeric pad state
const entryAmount = ref(0)
const entryDisplay = computed(() => (entryAmount.value ? String(entryAmount.value) : '0'))

const todaysCalories = computed(() => caloriesStore.todaysCalories)
const dailyGoal = 2000
const progressPercent = computed(() => Math.min((todaysCalories.value / dailyGoal) * 100, 100))

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
  } catch {
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

// Removed top tab navigation


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

// Keypad helpers
const appendDigit = (digit) => {
  const next = Number(`${entryAmount.value || ''}${digit}`)
  if (!Number.isNaN(next) && next <= 10000) {
    entryAmount.value = next
  }
}

const clearEntry = () => {
  entryAmount.value = 0
}

const backspace = () => {
  const str = String(entryAmount.value)
  entryAmount.value = Number(str.slice(0, -1)) || 0
}

const incrementBy = (amt) => {
  entryAmount.value = Math.min((entryAmount.value || 0) + amt, 10000)
}

const confirmAdd = async () => {
  const amount = entryAmount.value
  if (!amount || amount <= 0) return
  try {
    await caloriesStore.addMeal(amount)
    entryAmount.value = 0
    Notify.create({ type: 'positive', message: `Added ${amount} calories`, position: 'top', timeout: 1500 })
  } catch {
    Notify.create({ type: 'negative', message: 'Failed to add calories', position: 'top' })
  }
}
</script>

<style scoped>
/* top-tabs removed */

.dashboard-page {
  padding: 0;
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
