<template>
  <div>
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Recent Meals</div>
      <q-btn
        flat
        round
        icon="refresh"
        size="sm"
        @click="refreshMeals"
        :loading="caloriesStore.isLoading"
        color="grey-6"
      />
    </div>

    <!-- Loading state -->
    <div
      v-if="caloriesStore.isLoading && (!displayMeals || displayMeals.length === 0)"
      class="text-center q-py-xl"
    >
      <q-spinner color="primary" size="24px" />
      <div class="text-caption text-grey-6 q-mt-sm">Loading meals...</div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!displayMeals || displayMeals.length === 0" class="text-center q-py-xl">
      <q-icon name="bolt" size="48px" color="grey-4" />
      <div class="text-subtitle1 text-grey-6 q-mt-md">No meals logged yet</div>
      <div class="text-caption text-grey-5">Start tracking your calories!</div>
    </div>

    <!-- Meals list -->
    <q-list v-else separator>
      <q-item v-for="meal in displayMeals" :key="meal.id" class="q-py-md">
        <q-item-section>
          <q-item-label class="text-weight-bold">
            {{ formatNumber(meal.calories) }} kcal
          </q-item-label>
          <q-item-label caption>
            {{ formatTime(meal.meal_time) }}
          </q-item-label>
          <q-item-label v-if="meal.notes" caption class="q-mt-xs">
            {{ meal.notes }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="row q-gutter-xs">
            <q-btn flat round icon="edit" size="sm" @click="editMeal(meal)" color="grey-6" />
            <q-btn flat round icon="delete" size="sm" @click="deleteMeal(meal)" color="negative" />
          </div>
        </q-item-section>
      </q-item>

      <!-- Show More Button -->
      <q-item v-if="hasMoreMeals" class="text-center">
        <q-item-section>
          <q-btn flat label="Show More" @click="showMore" icon="expand_more" color="primary" />
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Edit Meal Dialog -->
    <MealDialog v-model="showEditDialog" :meal="mealToEdit" @saved="onMealSaved" />

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete this meal?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showDeleteDialog = false" />
          <q-btn color="negative" label="Delete" @click="confirmDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Notify } from 'quasar'
import { useCaloriesStore } from '../stores/calories.js'
import MealDialog from './MealDialog.vue'

const caloriesStore = useCaloriesStore()

// Component state
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const mealToEdit = ref(null)
const mealToDelete = ref(null)
const displayCount = ref(5)

onMounted(async () => {
  await caloriesStore.loadMeals()
})

const displayMeals = computed(() => {
  // Handle case where meals might be undefined or not loaded yet
  const meals = caloriesStore.meals || []
  return meals
    .slice()
    .sort((a, b) => new Date(b.meal_time) - new Date(a.meal_time))
    .slice(0, displayCount.value)
})

const hasMoreMeals = computed(() => {
  const meals = caloriesStore.meals || []
  return meals.length > displayCount.value
})

const showMore = () => {
  displayCount.value += 5
}

const refreshMeals = async () => {
  await caloriesStore.loadMeals()
  Notify.create({
    type: 'positive',
    message: 'Meals refreshed',
    position: 'top',
    timeout: 1000,
  })
}

const editMeal = (meal) => {
  mealToEdit.value = meal
  showEditDialog.value = true
}

const onMealSaved = () => {
  // Meal was saved successfully, no additional action needed
  // The MealDialog component handles the notifications
}

const deleteMeal = (meal) => {
  mealToDelete.value = meal
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await caloriesStore.deleteMeal(mealToDelete.value.id)

    Notify.create({
      type: 'positive',
      message: 'Meal deleted',
      position: 'top',
    })

    showDeleteDialog.value = false
    mealToDelete.value = null
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Failed to delete meal',
      position: 'top',
    })
  }
}

// Utility functions
const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
</script>

<style scoped>
/* Minimal CSS - using Quasar components and utility classes */
.formatNumber {
  font-variant-numeric: tabular-nums;
}
</style>
