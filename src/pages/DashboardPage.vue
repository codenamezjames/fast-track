<template>
  <q-page class="dashboard-page fit">
    <div class="dashboard-container">
      <!-- Add Calories Section -->
      <q-card class="dashboard-card">
        <q-card-section>
          <div class="text-h6 q-mb-md">Add Calories</div>
          <div class="row q-gutter-sm">
            <q-btn
              v-for="amount in [25, 50, 100]"
              :key="amount"
              :label="`+${amount}`"
              color="primary"
              unelevated
              @click="addQuickCalories(amount)"
              :loading="caloriesStore.isLoading"
              class="col-auto"
            />
            <q-input
              v-model="customCalories"
              outlined
              placeholder="Custom amount"
              type="number"
              @keyup.enter="addCustomCalories"
              class="col"
              dense
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Intermittent Fasting Section -->
      <q-card class="dashboard-card">
        <q-card-section>
          <div class="text-h6 q-mb-md">Intermittent Fasting</div>
          <FastingTimer />
        </q-card-section>
      </q-card>

      <!-- Calories Section -->
      <q-card class="dashboard-card">
        <q-card-section>
          <div class="text-h6 q-mb-md">Calories</div>
          <div class="calories-content">
            <CaloriesChart />
            <div class="daily-total">
              <div class="total-number">{{ formatNumber(caloriesStore.todaysCalories) }}</div>
              <div class="total-label">kcal</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Settings and Logout -->
    <q-page-sticky position="top-right" :offset="[20, 20]">
      <div class="top-actions">
        <q-btn 
          flat
          round 
          icon="settings" 
          @click="$router.push('/settings')"
          size="sm"
          class="action-btn"
        />
        <q-btn 
          flat
          round 
          icon="logout" 
          @click="logout"
          size="sm"
          class="action-btn"
        />
      </div>
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useAuthStore } from '../stores/auth.js'
import { useCaloriesStore } from '../stores/calories.js'
import FastingTimer from '../components/FastingTimer.vue'
import CaloriesChart from '../components/CaloriesChart.vue'

const router = useRouter()
const authStore = useAuthStore()
const caloriesStore = useCaloriesStore()

const customCalories = ref('')

onMounted(async () => {
  await caloriesStore.loadMeals()
})

const addQuickCalories = async (amount) => {
  try {
    await caloriesStore.addMeal(amount)
    
    Notify.create({
      type: 'positive',
      message: `Added ${amount} calories`,
      position: 'top',
      timeout: 2000
    })
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Failed to add calories',
      position: 'top'
    })
  }
}

const addCustomCalories = async () => {
  const amount = parseInt(customCalories.value)
  if (!amount || amount <= 0) return
  
  try {
    await caloriesStore.addMeal(amount)
    customCalories.value = ''
    
    Notify.create({
      type: 'positive',
      message: `Added ${amount} calories`,
      position: 'top',
      timeout: 2000
    })
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Failed to add calories',
      position: 'top'
    })
  }
}

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.dashboard-page {
  padding: 16px;
}

.dashboard-container {
  max-width: 400px;
  margin: 0 auto;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 20px 0;
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
}

.calorie-btn {
  background: #4f7cff;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  min-width: 60px;
  height: 48px;
  flex: 1;
}

.calorie-btn:hover {
  background: #3a5fd1;
}

.custom-input {
  flex: 1;
  min-width: 80px;
}

.custom-input :deep(.q-field__control) {
  border-radius: 12px;
  border: 2px solid #e9ecef;
  height: 48px;
}

.custom-input :deep(.q-field__native) {
  font-size: 16px;
  text-align: center;
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

.top-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #6c757d;
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  color: #495057;
}
</style> 