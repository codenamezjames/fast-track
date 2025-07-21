<template>
  <q-page class="dashboard-page">
    <div class="dashboard-container">
      <!-- Add Calories Section -->
      <div class="dashboard-section">
        <h2 class="section-title">Add Calories</h2>
        <div class="quick-add-calories">
          <div class="calorie-buttons">
            <q-btn
              v-for="amount in [25, 50, 100]"
              :key="amount"
              :label="`+${amount}`"
              class="calorie-btn"
              unelevated
              @click="addToPool(amount)"
            />
            <q-btn
              icon="add_circle"
              class="custom-btn"
              unelevated
              @click="showCustomDialog = true"
            />
          </div>
          
          <!-- Calorie Pool Display -->
          <transition name="slide-down">
            <div v-if="caloriePool > 0" class="calorie-pool">
              <div class="pool-header">
                <div class="pool-icon">
                  <q-icon name="restaurant" size="20px" />
                </div>
                <div class="pool-display">
                  <div class="pool-amount">{{ formatNumber(caloriePool) }}</div>
                  <div class="pool-label">kcal ready to add</div>
                </div>
                <q-btn
                  flat
                  round
                  icon="close"
                  size="sm"
                  @click="clearPool"
                  class="clear-btn"
                />
              </div>
              
              <div class="pool-actions">
                <q-btn
                  label="Add Meal"
                  class="add-meal-btn"
                  unelevated
                  @click="addMealFromPool"
                  :loading="caloriesStore.isLoading"
                  icon="check"
                />
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Calories Section -->
      <div class="dashboard-section">
        <div class="calories-header">
          <h2 class="section-title">Calories</h2>
          <q-btn-toggle
            v-model="chartViewMode"
            toggle-color="primary"
            :options="[
              { label: 'Daily', value: 'daily' },
              { label: 'Weekly', value: 'weekly' }
            ]"
            class="view-toggle"
            unelevated
            dense
          />
        </div>
        <div class="calories-content">
          <CaloriesChart :view-mode="chartViewMode" />
          <div class="daily-total">
            <div class="total-number">{{ formatNumber(displayTotal) }}</div>
            <div class="total-label">{{ chartViewMode === 'daily' ? 'today' : 'this week' }}</div>
          </div>
        </div>
      </div>

      <!-- Meals History Section -->
      <div class="dashboard-section">
        <MealsHistory />
      </div>
    </div>

    <!-- Custom Calorie Dialog -->
    <q-dialog v-model="showCustomDialog" persistent>
      <q-card class="custom-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">Add Custom Calories</div>
          <q-btn flat round dense icon="close" @click="closeCustomDialog" />
        </q-card-section>

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
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Notify } from 'quasar'
import { useCaloriesStore } from '../stores/calories.js'
import CaloriesChart from '../components/CaloriesChart.vue'
import MealsHistory from '../components/MealsHistory.vue'

const caloriesStore = useCaloriesStore()
const customAmount = ref('')
const caloriePool = ref(0)
const showCustomDialog = ref(false)
const chartViewMode = ref('weekly')

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
    await caloriesStore.addMeal(caloriePool.value)
    
    Notify.create({
      type: 'positive',
      message: `Meal logged: ${formatNumber(caloriePool.value)} calories`,
      position: 'top',
      timeout: 2000
    })
    
    // Clear the pool after successful addition
    caloriePool.value = 0
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
  Notify.create({
    type: 'info',
    message: 'Meal cleared',
    position: 'top',
    timeout: 1000,
    color: 'grey-6'
  })
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
.dashboard-page {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 24px 20px;
}

.dashboard-container {
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.dashboard-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.calories-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.view-toggle {
  border-radius: 8px;
  overflow: hidden;
}

.view-toggle :deep(.q-btn) {
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 0;
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #e9ecef;
}

.view-toggle :deep(.q-btn--active) {
  background: #4f7cff;
  color: white;
  border-color: #4f7cff;
}

.quick-add-calories {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.calorie-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.calorie-btn {
  background: linear-gradient(135deg, #4f7cff 0%, #3a5fd1 100%);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  height: 48px;
  flex: 1;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(79, 124, 255, 0.2);
}

.calorie-btn:hover {
  background: linear-gradient(135deg, #3a5fd1 0%, #2948b3 100%);
  box-shadow: 0 4px 12px rgba(79, 124, 255, 0.3);
  transform: translateY(-1px);
}

.calorie-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(79, 124, 255, 0.2);
}

.custom-btn {
  background: linear-gradient(135deg, #6c757d 0%, #5a626b 100%);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  height: 48px;
  width: 48px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(108, 117, 125, 0.2);
}

.custom-btn:hover {
  background: linear-gradient(135deg, #5a626b 0%, #495057 100%);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
  transform: translateY(-1px);
}

/* Slide down animation for pool */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.calorie-pool {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  border: 2px solid #4f7cff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(79, 124, 255, 0.1);
}

.pool-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.pool-icon {
  color: #4f7cff;
  background: rgba(79, 124, 255, 0.1);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pool-display {
  flex: 1;
}

.pool-amount {
  font-size: 28px;
  font-weight: 700;
  color: #4f7cff;
  line-height: 1;
  margin-bottom: 2px;
}

.pool-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.pool-actions {
  display: flex;
  justify-content: center;
  width: 100%;
}

.add-meal-btn {
  background: linear-gradient(135deg, #4f7cff 0%, #3a5fd1 100%);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  padding: 12px 24px;
  font-size: 15px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(79, 124, 255, 0.2);
  min-width: 120px;
}

.add-meal-btn:hover {
  background: linear-gradient(135deg, #3a5fd1 0%, #2948b3 100%);
  box-shadow: 0 4px 12px rgba(79, 124, 255, 0.3);
  transform: translateY(-1px);
}

.clear-btn {
  color: #6c757d;
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;
}

.clear-btn:hover {
  color: #495057;
  background: rgba(108, 117, 125, 0.1);
}

.calories-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.daily-total {
  text-align: center;
}

.total-number {
  font-size: 48px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.total-label {
  font-size: 18px;
  color: #6c757d;
  font-weight: 500;
}

/* Dialog Styles */
.custom-dialog {
  min-width: 320px;
  max-width: 400px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px 24px;
}

.dialog-content {
  padding: 0 24px 16px 24px;
}

.custom-input-large {
  margin-bottom: 24px;
}

.calorie-input :deep(.q-field__control) {
  border-radius: 12px;
  height: 56px;
  font-size: 18px;
}

.calorie-input :deep(.q-field__native) {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  color: #2c3e50;
}

.input-suffix {
  font-size: 16px;
  color: #6c757d;
  font-weight: 500;
}

.dialog-presets {
  text-align: center;
}

.preset-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 12px;
  font-weight: 500;
}

.preset-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.preset-btn {
  border-radius: 8px;
  font-weight: 600;
  min-width: 60px;
}

.dialog-actions {
  padding: 16px 24px 20px 24px;
}
</style> 