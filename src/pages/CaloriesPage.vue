<template>
  <q-page class="dashboard-page fit">
    <div class="dashboard-container">
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
              icon="schedule"
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
                  <q-btn 
                    color="grey-6" 
                    label="Clear" 
                    @click="clearPool"
                    flat
                    icon="close"
                  />
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
                { label: 'Weekly', value: 'weekly' }
              ]"
              unelevated
              dense
            />
          </div>
          
          <CaloriesChart :view-mode="chartViewMode" />
          
          <div class="text-center q-mt-md">
            <div class="text-h4 text-weight-bold">{{ formatNumber(displayTotal) }}</div>
            <div class="text-caption text-grey-6">{{ chartViewMode === 'daily' ? 'today' : 'this week' }}</div>
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

    <!-- Past Meal Dialog -->
    <q-dialog v-model="showPastMealDialog" persistent>
      <q-card>
        <DialogHeader title="Add Past Meal" @close="closePastMealDialog" />

        <q-card-section class="dialog-content">
          <div class="custom-input-large q-mb-md">
            <q-input
              v-model="pastMealAmount"
              type="number"
              outlined
              placeholder="Enter calories"
              autofocus
              class="calorie-input"
            >
              <template v-slot:append>
                <span class="input-suffix">kcal</span>
              </template>
            </q-input>
          </div>

          <div class="q-mb-md">
            <div @click.stop="showDatePicker" class="cursor-pointer">
              <q-input
                v-model="pastMealDate"
                outlined
                label="Date"
                class="q-mb-sm"
                readonly
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="dateProxy" cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="pastMealDate">
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
              <q-input
                v-model="pastMealTime"
                outlined
                label="Time"
                readonly
              >
                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy ref="timeProxy" cover transition-show="scale" transition-hide="scale">
                      <q-time v-model="pastMealTime" format24h>
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

          <div class="q-mb-md">
            <q-input
              v-model="pastMealNotes"
              outlined
              placeholder="Notes (optional)"
              maxlength="100"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancel" @click="closePastMealDialog" />
          <q-btn 
            label="Add Meal" 
            color="primary" 
            unelevated
            @click="addPastMeal"
            :disable="!pastMealAmount || pastMealAmount <= 0 || !pastMealDate || !pastMealTime"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Notify } from 'quasar'
import { useCaloriesStore } from '../stores/calories.js'
import CaloriesChart from '../components/CaloriesChart.vue'
import MealsHistory from '../components/MealsHistory.vue'
import DialogHeader from '../components/DialogHeader.vue'

const caloriesStore = useCaloriesStore()
const customAmount = ref('')
const caloriePool = ref(0)
const poolNotes = ref('')
const showCustomDialog = ref(false)
const showPastMealDialog = ref(false)
const pastMealAmount = ref('')
const pastMealDate = ref('')
const pastMealTime = ref('')
const pastMealNotes = ref('')
const chartViewMode = ref('daily')
const dateProxy = ref(null)
const timeProxy = ref(null)

onMounted(async () => {
  await caloriesStore.loadMeals()
  
  // Set default date and time for past meal dialog to current date/time
  setDefaultDateTime()
})

const setDefaultDateTime = () => {
  const now = new Date()
  // Format for Quasar date picker (YYYY/MM/DD)
  pastMealDate.value = now.getFullYear() + '/' + 
    String(now.getMonth() + 1).padStart(2, '0') + '/' + 
    String(now.getDate()).padStart(2, '0')
  
  // Format for Quasar time picker (HH:mm)
  pastMealTime.value = String(now.getHours()).padStart(2, '0') + ':' + 
    String(now.getMinutes()).padStart(2, '0')
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
      color: 'blue-5'
    })
    
    closeCustomDialog()
  }
}

const closeCustomDialog = () => {
  showCustomDialog.value = false
  customAmount.value = ''
}

const closePastMealDialog = () => {
  showPastMealDialog.value = false
  pastMealAmount.value = ''
  pastMealNotes.value = ''
  // Reset to current date/time for next use
  setDefaultDateTime()
}

const addMealFromPool = async () => {
  if (caloriePool.value <= 0) return
  
  try {
    await caloriesStore.addMeal(caloriePool.value, poolNotes.value)
    
    Notify.create({
      type: 'positive',
      message: `Meal logged: ${formatNumber(caloriePool.value)} calories`,
      position: 'top',
      timeout: 2000
    })
    
    // Clear the pool after successful addition
    caloriePool.value = 0
    poolNotes.value = ''
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Failed to add meal',
      position: 'top'
    })
  }
}

const clearPool = () => {
  caloriePool.value = 0
  poolNotes.value = ''
}

const addPastMeal = async () => {
  const amount = parseInt(pastMealAmount.value)
  if (!amount || amount <= 0 || !pastMealDate.value || !pastMealTime.value) return
  
  try {
    // Combine date and time into a Date object
    const dateTimeString = `${pastMealDate.value}T${pastMealTime.value}`
    const mealDateTime = new Date(dateTimeString)
    
    await caloriesStore.addMeal(amount, pastMealNotes.value, mealDateTime.toISOString())
    
    Notify.create({
      type: 'positive',
      message: `Past meal logged: ${formatNumber(amount)} calories`,
      position: 'top',
      timeout: 2000
    })
    
    closePastMealDialog()
  } catch (error) {
    console.error('Error adding past meal:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to add past meal',
      position: 'top'
    })
  }
}

const displayTotal = computed(() => {
  if (chartViewMode.value === 'daily') {
    return caloriesStore.todaysCalories
  } else {
    return caloriesStore.weeklyCalories
  }
})

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}
</script>

<style scoped>
/* Minimal CSS - using Quasar components and utility classes */
.dashboard-page {
  padding: 16px;
}

.dashboard-container {
  max-width: 400px;
  margin: 0 auto;
}
</style> 