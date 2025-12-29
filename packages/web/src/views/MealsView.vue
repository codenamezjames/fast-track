<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-vue-next'
import MainLayout from '@/components/layout/MainLayout.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import MealCard from '@/components/meals/MealCard.vue'
import AddMealModal from '@/components/meals/AddMealModal.vue'
import { useMealsStore } from '@/stores/mealsStore'
import type { MealType, FoodItem } from '@/types'

const mealsStore = useMealsStore()

const showAddModal = ref(false)
const selectedDate = ref(new Date())

const dateString = computed(() => {
  return selectedDate.value.toISOString().split('T')[0]
})

const isToday = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return dateString.value === today
})

const displayDate = computed(() => {
  if (isToday.value) return 'Today'

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateString.value === yesterday.toISOString().split('T')[0]) return 'Yesterday'

  return selectedDate.value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
})

const todayMeals = computed(() => {
  return mealsStore.meals.filter((meal) => {
    const mealDate = new Date(meal.date).toISOString().split('T')[0]
    return mealDate === dateString.value
  })
})

const calorieGoal = 2000 // TODO: Get from settings
const caloriePercentage = computed(() => {
  if (!mealsStore.dailySummary) return 0
  return Math.round((mealsStore.dailySummary.totalCalories / calorieGoal) * 100)
})

const proteinGoal = 150
const carbsGoal = 250
const fatGoal = 65

const proteinPercentage = computed(() => {
  if (!mealsStore.dailySummary) return 0
  return Math.min(Math.round((mealsStore.dailySummary.totalProtein / proteinGoal) * 100), 100)
})

const carbsPercentage = computed(() => {
  if (!mealsStore.dailySummary) return 0
  return Math.min(Math.round((mealsStore.dailySummary.totalCarbs / carbsGoal) * 100), 100)
})

const fatPercentage = computed(() => {
  if (!mealsStore.dailySummary) return 0
  return Math.min(Math.round((mealsStore.dailySummary.totalFat / fatGoal) * 100), 100)
})

async function loadData() {
  try {
    await Promise.all([
      mealsStore.fetchMeals(dateString.value, dateString.value),
      mealsStore.fetchDailySummary(dateString.value),
    ])
  } catch (error) {
    console.error('Failed to load meal data:', error)
  }
}

async function handleAddMeal(data: { type: MealType; foods: FoodItem[]; totalCalories: number }) {
  try {
    await mealsStore.createMeal({
      date: selectedDate.value,
      type: data.type,
      foods: data.foods,
      totalCalories: data.totalCalories,
    })
    await loadData()
    showAddModal.value = false
  } catch (error) {
    console.error('Failed to create meal:', error)
  }
}

async function handleDeleteMeal(id: number) {
  if (!confirm('Are you sure you want to delete this meal?')) return

  try {
    await mealsStore.deleteMeal(id)
    await loadData()
  } catch (error) {
    console.error('Failed to delete meal:', error)
  }
}

function handlePreviousDay() {
  const newDate = new Date(selectedDate.value)
  newDate.setDate(newDate.getDate() - 1)
  selectedDate.value = newDate
  loadData()
}

function handleNextDay() {
  const newDate = new Date(selectedDate.value)
  newDate.setDate(newDate.getDate() + 1)
  selectedDate.value = newDate
  loadData()
}

function handleToday() {
  selectedDate.value = new Date()
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <MainLayout>
    <div class="meals-view">
      <!-- Header -->
      <div class="meals-view__header">
        <h1 class="meals-view__title">Meals</h1>
        <Button variant="meals" @click="showAddModal = true">
          <Plus :size="18" />
          Add Meal
        </Button>
      </div>

      <!-- Date Navigation -->
      <Card padding="md" class="meals-view__date-nav">
        <div class="date-nav">
          <button class="date-nav__button" @click="handlePreviousDay" aria-label="Previous day">
            <ChevronLeft :size="20" />
          </button>

          <div class="date-nav__current">
            <Calendar :size="18" />
            <span class="date-nav__date">{{ displayDate }}</span>
          </div>

          <button
            class="date-nav__button"
            :disabled="isToday"
            @click="handleNextDay"
            aria-label="Next day"
          >
            <ChevronRight :size="20" />
          </button>
        </div>

        <Button v-if="!isToday" variant="ghost" size="sm" @click="handleToday">Today</Button>
      </Card>

      <!-- Loading State -->
      <div v-if="mealsStore.loading" class="meals-view__loading">
        <LoadingSpinner size="lg" />
      </div>

      <template v-else>
        <!-- Daily Summary -->
        <Card padding="lg">
          <h2 class="section-title">Daily Summary</h2>

          <div class="summary">
            <!-- Calories -->
            <div class="summary__item">
              <div class="summary__header">
                <span class="summary__label">Calories</span>
                <span class="summary__value">{{ mealsStore.dailySummary?.totalCalories || 0 }} / {{ calorieGoal }}</span>
              </div>
              <div class="summary__bar">
                <div
                  class="summary__progress summary__progress--calories"
                  :style="{ width: `${caloriePercentage}%` }"
                ></div>
              </div>
            </div>

            <!-- Protein -->
            <div class="summary__item">
              <div class="summary__header">
                <span class="summary__label">Protein</span>
                <span class="summary__value">{{ mealsStore.dailySummary?.totalProtein || 0 }} / {{ proteinGoal }}g</span>
              </div>
              <div class="summary__bar">
                <div
                  class="summary__progress summary__progress--protein"
                  :style="{ width: `${proteinPercentage}%` }"
                ></div>
              </div>
            </div>

            <!-- Carbs -->
            <div class="summary__item">
              <div class="summary__header">
                <span class="summary__label">Carbs</span>
                <span class="summary__value">{{ mealsStore.dailySummary?.totalCarbs || 0 }} / {{ carbsGoal }}g</span>
              </div>
              <div class="summary__bar">
                <div
                  class="summary__progress summary__progress--carbs"
                  :style="{ width: `${carbsPercentage}%` }"
                ></div>
              </div>
            </div>

            <!-- Fat -->
            <div class="summary__item">
              <div class="summary__header">
                <span class="summary__label">Fat</span>
                <span class="summary__value">{{ mealsStore.dailySummary?.totalFat || 0 }} / {{ fatGoal }}g</span>
              </div>
              <div class="summary__bar">
                <div
                  class="summary__progress summary__progress--fat"
                  :style="{ width: `${fatPercentage}%` }"
                ></div>
              </div>
            </div>
          </div>
        </Card>

        <!-- Meals List -->
        <div class="meals-view__meals">
          <h2 class="section-title">{{ isToday ? "Today's Meals" : 'Meals' }} ({{ todayMeals.length }})</h2>

          <div v-if="todayMeals.length === 0" class="meals-view__empty">
            <EmptyState
              title="No meals logged"
              description="Add your first meal to start tracking your nutrition"
            >
              <Button variant="meals" @click="showAddModal = true">
                <Plus :size="18" />
                Add Meal
              </Button>
            </EmptyState>
          </div>

          <div v-else class="meals-view__list">
            <MealCard
              v-for="meal in todayMeals"
              :key="meal.id"
              :meal="meal"
              @delete="handleDeleteMeal"
            />
          </div>
        </div>
      </template>

      <!-- Add Meal Modal -->
      <AddMealModal :open="showAddModal" @close="showAddModal = false" @save="handleAddMeal" />
    </div>
  </MainLayout>
</template>

<style scoped>
.meals-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.meals-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.meals-view__title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.meals-view__date-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.date-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.date-nav__button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: var(--color-surface-variant);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.date-nav__button:hover:not(:disabled) {
  background: var(--color-meals);
  color: #0d0d0d;
  border-color: var(--color-meals);
}

.date-nav__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.date-nav__button:active:not(:disabled) {
  transform: scale(0.95);
}

.date-nav__current {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-primary);
}

.date-nav__date {
  font-size: 1rem;
  font-weight: 600;
}

.meals-view__loading {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 1.5rem 0;
}

.summary {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.summary__item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary__label {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.summary__value {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.summary__bar {
  height: 8px;
  background: var(--color-surface-variant);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.summary__progress {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.summary__progress--calories {
  background: var(--color-meals);
}

.summary__progress--protein {
  background: var(--color-secondary);
}

.summary__progress--carbs {
  background: var(--color-activity);
}

.summary__progress--fat {
  background: var(--color-workouts);
}

.meals-view__meals {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.meals-view__list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.meals-view__empty {
  padding: 2rem 0;
}
</style>
