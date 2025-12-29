<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStreaksStore } from '@/stores/streaksStore'
import { useMealsStore } from '@/stores/mealsStore'
import { useAuthStore } from '@/stores/authStore'
import MainLayout from '@/components/layout/MainLayout.vue'
import Card from '@/components/ui/Card.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { Flame, Utensils, Dumbbell, Timer } from 'lucide-vue-next'

const router = useRouter()
const streaksStore = useStreaksStore()
const mealsStore = useMealsStore()
const authStore = useAuthStore()

const loading = ref(true)

const userName = computed(() => {
  const email = authStore.user?.email || ''
  return email.split('@')[0] || 'User'
})
const currentStreak = computed(() => streaksStore.streak?.currentStreak || 0)
const todayCalories = computed(() => mealsStore.dailySummary?.totalCalories || 0)
const calorieGoal = 2000
const protein = computed(() => mealsStore.dailySummary?.totalProtein || 0)
const fat = computed(() => mealsStore.dailySummary?.totalFat || 0)
const carbs = computed(() => mealsStore.dailySummary?.totalCarbs || 0)

const caloriePercentage = computed(() => Math.round((todayCalories.value / calorieGoal) * 100))
const proteinPercentage = computed(() => Math.min(Math.round((protein.value / 150) * 100), 100))
const fatPercentage = computed(() => Math.min(Math.round((fat.value / 65) * 100), 100))
const carbsPercentage = computed(() => Math.min(Math.round((carbs.value / 250) * 100), 100))

// Mock data for now - would come from stores
const workoutMinutes = 0
const fastingMinutes = 0

onMounted(async () => {
  try {
    await Promise.all([
      streaksStore.fetchStreak(),
      streaksStore.fetchTodayActivity(),
      mealsStore.fetchDailySummary(),
    ])
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <MainLayout>
    <div class="dashboard">
      <div v-if="loading" class="dashboard__loading">
        <LoadingSpinner size="lg" />
      </div>

      <template v-else>
        <!-- Header -->
        <div class="dashboard__header">
          <div>
            <div class="dashboard__greeting">Welcome Back</div>
            <h1 class="dashboard__user-name">{{ userName }}</h1>
          </div>
        </div>

        <!-- Today's Status -->
        <Card padding="lg">
          <h2 class="section-title">Today's Status</h2>

          <div class="status-grid">
            <!-- Circular Progress -->
            <div class="status-circle">
              <svg class="status-circle__svg" viewBox="0 0 160 160">
                <!-- Background circle -->
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="var(--color-surface-variant)"
                  stroke-width="12"
                />
                <!-- Progress circle -->
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="url(#gradient)"
                  stroke-width="12"
                  stroke-linecap="round"
                  :stroke-dasharray="`${(caloriePercentage * 439.6) / 100} 439.6`"
                  transform="rotate(-90 80 80)"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color: #c0ff00" />
                    <stop offset="100%" style="stop-color: #7fff00" />
                  </linearGradient>
                </defs>
              </svg>
              <div class="status-circle__content">
                <div class="status-circle__value">{{ todayCalories }}</div>
                <div class="status-circle__label">of {{ calorieGoal }}</div>
                <div class="status-circle__sublabel">Consumed</div>
              </div>
            </div>

            <!-- Macros -->
            <div class="macros">
              <div class="macro">
                <div class="macro__header">
                  <span class="macro__label">Protein</span>
                  <span class="macro__value">{{ protein }}/150 gr</span>
                </div>
                <div class="macro__bar">
                  <div
                    class="macro__progress macro__progress--protein"
                    :style="{ width: `${proteinPercentage}%` }"
                  ></div>
                </div>
              </div>

              <div class="macro">
                <div class="macro__header">
                  <span class="macro__label">Fat</span>
                  <span class="macro__value">{{ fat }}/65 gr</span>
                </div>
                <div class="macro__bar">
                  <div
                    class="macro__progress macro__progress--fat"
                    :style="{ width: `${fatPercentage}%` }"
                  ></div>
                </div>
              </div>

              <div class="macro">
                <div class="macro__header">
                  <span class="macro__label">Carbs</span>
                  <span class="macro__value">{{ carbs }}/250 gr</span>
                </div>
                <div class="macro__bar">
                  <div
                    class="macro__progress macro__progress--carbs"
                    :style="{ width: `${carbsPercentage}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <!-- Activity Grid -->
        <div class="activity-grid">
          <!-- Streak Card -->
          <Card class="activity-card activity-card--streak" padding="lg" clickable @click="() => {}">
            <div class="activity-card__icon">
              <Flame :size="24" />
            </div>
            <div class="activity-card__label">Streak</div>
            <div class="activity-card__value">{{ currentStreak }} <span class="activity-card__unit">Days</span></div>
          </Card>

          <!-- Meals Card -->
          <Card class="activity-card activity-card--meals" padding="lg" clickable @click="router.push('/meals')">
            <div class="activity-card__icon">
              <Utensils :size="24" />
            </div>
            <div class="activity-card__label">Meals</div>
            <div class="activity-card__value">{{ todayCalories }} <span class="activity-card__unit">kcal</span></div>
          </Card>

          <!-- Workouts Card -->
          <Card class="activity-card activity-card--workouts" padding="lg" clickable @click="router.push('/workouts')">
            <div class="activity-card__icon">
              <Dumbbell :size="24" />
            </div>
            <div class="activity-card__label">Workouts</div>
            <div class="activity-card__value">{{ workoutMinutes }} <span class="activity-card__unit">Minutes</span></div>
          </Card>

          <!-- Fasting Card -->
          <Card class="activity-card activity-card--fasting" padding="lg" clickable @click="router.push('/fasting')">
            <div class="activity-card__icon">
              <Timer :size="24" />
            </div>
            <div class="activity-card__label">Fasting</div>
            <div class="activity-card__value">{{ fastingMinutes }} <span class="activity-card__unit">Minutes</span></div>
          </Card>
        </div>
      </template>
    </div>
  </MainLayout>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.dashboard__loading {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
}

/* Header */
.dashboard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dashboard__greeting {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.dashboard__user-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  text-transform: capitalize;
}

/* Section Title */
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 1.5rem 0;
}

/* Status Grid */
.status-grid {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 2rem;
  align-items: center;
}

/* Circular Progress */
.status-circle {
  position: relative;
  width: 160px;
  height: 160px;
}

.status-circle__svg {
  width: 100%;
  height: 100%;
}

.status-circle__content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.status-circle__value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.status-circle__label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.2;
}

.status-circle__sublabel {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

/* Macros */
.macros {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.macro {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.macro__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.macro__label {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.macro__value {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.macro__bar {
  height: 8px;
  background: var(--color-surface-variant);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.macro__progress {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.macro__progress--protein {
  background: var(--color-secondary);
}

.macro__progress--fat {
  background: var(--color-meals);
}

.macro__progress--carbs {
  background: var(--color-activity);
}

/* Activity Grid */
.activity-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.activity-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.activity-card--streak {
  background: rgba(192, 255, 0, 0.05);
}

.activity-card--meals {
  background: rgba(255, 149, 0, 0.05);
}

.activity-card--workouts {
  background: rgba(255, 51, 102, 0.05);
}

.activity-card--fasting {
  background: rgba(204, 0, 255, 0.05);
}

.activity-card__icon {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-card--streak .activity-card__icon {
  background: rgba(192, 255, 0, 0.15);
  color: var(--color-primary);
}

.activity-card--meals .activity-card__icon {
  background: rgba(255, 149, 0, 0.15);
  color: var(--color-meals);
}

.activity-card--workouts .activity-card__icon {
  background: rgba(255, 51, 102, 0.15);
  color: var(--color-workouts);
}

.activity-card--fasting .activity-card__icon {
  background: rgba(204, 0, 255, 0.15);
  color: var(--color-fasting);
}

.activity-card__label {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.activity-card__value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

.activity-card__unit {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

/* Responsive */
@media (max-width: 640px) {
  .status-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .status-circle {
    margin: 0 auto;
  }

  .dashboard__user-name {
    font-size: 1.5rem;
  }
}

@media (min-width: 768px) {
  .dashboard {
    max-width: 700px;
  }
}
</style>
