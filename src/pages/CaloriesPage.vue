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

    <!-- Meal Dialog (for adding past meals) -->
    <MealDialog 
      v-model="showPastMealDialog" 
      @saved="onMealSaved"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Notify } from 'quasar'
import { useCaloriesStore } from '../stores/calories.js'
import CaloriesChart from '../components/CaloriesChart.vue'
import MealsHistory from '../components/MealsHistory.vue'
import DialogHeader from '../components/DialogHeader.vue'
import MealDialog from '../components/MealDialog.vue'

const caloriesStore = useCaloriesStore()
const customAmount = ref('')
const caloriePool = ref(0)
const poolNotes = ref('')
const showCustomDialog = ref(false)
const showPastMealDialog = ref(false)
const chartViewMode = ref('daily')

onMounted(async () => {
  await caloriesStore.loadMeals()
})



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

const onMealSaved = () => {
  // Meal was saved successfully, no additional action needed
  // The MealDialog component handles the notifications
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