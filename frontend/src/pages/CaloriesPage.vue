<template>
  <q-page class="calories-page">
    <q-pull-to-refresh @refresh="onRefresh">
      <div class="calories-container">
        <!-- Hero Section (Compact) -->
        <div class="hero-section">
          <div class="hero-left">
            <span class="greeting">{{ greeting }}</span>
            <span class="date">{{ formattedDate }}</span>
          </div>
          <div class="hero-ring">
            <svg class="progress-ring" viewBox="0 0 100 100">
              <circle class="progress-bg" cx="50" cy="50" r="42" fill="none" stroke-width="6" />
              <circle
                class="progress-bar"
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke-width="6"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="progressOffset"
                stroke-linecap="round"
              />
            </svg>
            <div class="ring-content">
              <div class="ring-value">{{ animatedCalories }}</div>
              <div class="ring-label">/ {{ dailyGoal }}</div>
            </div>
          </div>
        </div>

        <!-- Remaining indicator -->
        <div class="remaining-bar" :class="{ 'over-goal': isOverGoal }">
          <q-icon :name="isOverGoal ? 'warning' : 'local_fire_department'" size="16px" />
          <span>{{ remainingText }}</span>
        </div>

        <!-- Quick Add Chips -->
        <div class="quick-chips">
          <button v-for="amt in quickAmounts" :key="amt" class="quick-chip" @click="quickAdd(amt)">
            +{{ amt }}
          </button>
        </div>

        <!-- Keypad Section -->
        <div class="keypad-card">
          <div class="display-row">
            <span class="display-value" :class="{ 'has-value': entryAmount > 0 }">
              {{ entryAmount || '0' }}
            </span>
            <span class="display-unit">kcal</span>
          </div>

          <div class="keypad">
            <button
              v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
              :key="n"
              class="key"
              @click="appendDigit(n)"
            >
              {{ n }}
            </button>
            <button class="key key-action" @click="clearEntry">C</button>
            <button class="key" @click="appendDigit(0)">0</button>
            <button class="key key-action" @click="backspace">
              <q-icon name="backspace" size="18px" />
            </button>
          </div>

          <button
            class="add-btn"
            :class="{ active: entryAmount > 0 }"
            :disabled="!entryAmount || isAdding"
            @click="confirmAdd"
          >
            <q-icon v-if="isAdding" name="hourglass_empty" class="spinning" size="20px" />
            <template v-else>Add</template>
          </button>
        </div>

        <!-- Today's Meals (scrollable) -->
        <div class="meals-section" v-if="todaysMeals.length > 0">
          <div class="meals-header">
            <span>Today</span>
            <span class="meal-count">{{ todaysMeals.length }}</span>
          </div>
          <div class="meals-scroll">
            <div
              v-for="meal in todaysMeals"
              :key="meal.id"
              class="meal-item"
              @click="openEditDialog(meal)"
            >
              <span class="meal-time">{{ formatTime(meal.date) }}</span>
              <span class="meal-cal">{{ meal.calories }}</span>
              <q-icon name="edit" size="12px" class="edit-icon" />
            </div>
          </div>
        </div>
      </div>
    </q-pull-to-refresh>

    <!-- Edit Dialog -->
    <MealEditDialog
      v-model="showEditDialog"
      :meal="selectedMeal"
      @save="handleSaveMeal"
      @delete="handleDeleteMeal"
      @duplicate="handleDuplicateMeal"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useCaloriesStore } from '../stores/calories.js'
import { useSettingsStore } from '../stores/settings.js'
import MealEditDialog from '../components/MealEditDialog.vue'

const $q = useQuasar()
const caloriesStore = useCaloriesStore()
const settingsStore = useSettingsStore()

// State
const entryAmount = ref(0)
const isAdding = ref(false)
const animatedCalories = ref(0)
const quickAmounts = [100, 250, 500]
const showEditDialog = ref(false)
const selectedMeal = ref(null)

// Dynamic goal from settings
const dailyGoal = computed(() => settingsStore.calorieGoal)

// Progress ring (smaller radius = 42)
const circumference = 2 * Math.PI * 42
const progressOffset = computed(() => {
  const progress = Math.min(todaysCalories.value / dailyGoal.value, 1)
  return circumference * (1 - progress)
})

// Computed
const todaysCalories = computed(() => caloriesStore.todaysCalories)
const todaysMeals = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return caloriesStore.meals
    .filter((m) => m.date && m.date.startsWith(today))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)
})

const isOverGoal = computed(() => todaysCalories.value > dailyGoal.value)
const remainingCalories = computed(() => dailyGoal.value - todaysCalories.value)
const remainingText = computed(() => {
  if (isOverGoal.value) return `${Math.abs(remainingCalories.value)} over`
  return `${remainingCalories.value} left`
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
})

// Animate calorie counter
watch(
  todaysCalories,
  (newVal) => {
    animateValue(animatedCalories.value, newVal, 400)
  },
  { immediate: true },
)

function animateValue(start, end, duration) {
  const startTime = performance.now()
  const update = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    animatedCalories.value = Math.round(start + (end - start) * eased)
    if (progress < 1) requestAnimationFrame(update)
  }
  requestAnimationFrame(update)
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function appendDigit(digit) {
  const next = Number(`${entryAmount.value || ''}${digit}`)
  if (!Number.isNaN(next) && next <= 9999) entryAmount.value = next
}

function clearEntry() {
  entryAmount.value = 0
}

function backspace() {
  entryAmount.value = Number(String(entryAmount.value).slice(0, -1)) || 0
}

function quickAdd(amount) {
  addCalories(amount)
}

async function confirmAdd() {
  if (!entryAmount.value) return
  await addCalories(entryAmount.value)
  entryAmount.value = 0
}

async function addCalories(amount) {
  isAdding.value = true
  try {
    await caloriesStore.addMeal(amount)
    $q.notify({ message: `+${amount}`, color: 'positive', position: 'top', timeout: 1000 })
  } catch {
    $q.notify({ message: 'Failed', color: 'negative', position: 'top' })
  } finally {
    isAdding.value = false
  }
}

function openEditDialog(meal) {
  selectedMeal.value = {
    ...meal,
    meal_time: meal.date || meal.meal_time,
  }
  showEditDialog.value = true
}

async function handleSaveMeal(data) {
  try {
    if (data.id) {
      // Update existing meal
      await caloriesStore.updateMeal(data.id, data.calories, data.notes, data.dateTime)
      $q.notify({ message: 'Updated', color: 'positive', position: 'top', timeout: 1500 })
    } else {
      // Add new meal
      await caloriesStore.addMeal(data.calories, data.notes, data.dateTime)
      $q.notify({ message: `+${data.calories}`, color: 'positive', position: 'top', timeout: 1000 })
    }
  } catch {
    $q.notify({ message: 'Failed to save', color: 'negative', position: 'top' })
  }
}

async function handleDeleteMeal(id) {
  try {
    await caloriesStore.deleteMeal(id)
    $q.notify({ message: 'Deleted', color: 'grey-8', position: 'top', timeout: 1500 })
  } catch {
    $q.notify({ message: 'Failed to delete', color: 'negative', position: 'top' })
  }
}

async function handleDuplicateMeal(data) {
  try {
    await caloriesStore.addMeal(data.calories, data.notes)
    $q.notify({
      message: `+${data.calories} logged again`,
      color: 'positive',
      position: 'top',
      timeout: 1500,
    })
  } catch {
    $q.notify({ message: 'Failed to log', color: 'negative', position: 'top' })
  }
}

async function onRefresh(done) {
  await Promise.all([caloriesStore.loadMeals(), settingsStore.loadSettings()])
  done()
}

onMounted(async () => {
  await Promise.all([caloriesStore.loadMeals(), settingsStore.loadSettings()])
})
</script>

<style scoped>
.calories-page {
  display: flex;
  flex-direction: column;
  padding: 0 !important;
  min-height: 100%;
}

.calories-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  padding: 16px;
  padding-bottom: 12px;
  gap: 12px;
  box-sizing: border-box;
  overflow: hidden;
}

/* Hero - centered with large ring */
.hero-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  min-height: 0;
}

.hero-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
}

.greeting {
  font-size: 13px;
  opacity: 0.5;
}

.date {
  font-size: 18px;
  font-weight: 700;
}

.hero-ring {
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}

.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-bg {
  stroke: rgba(0, 0, 0, 0.06);
}

.body--dark .progress-bg {
  stroke: rgba(255, 255, 255, 0.1);
}

.progress-bar {
  stroke: var(--q-primary);
  transition: stroke-dashoffset 0.4s ease;
  filter: drop-shadow(0 0 4px rgba(79, 124, 255, 0.4));
}

.ring-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  line-height: 1.1;
}

.ring-value {
  font-size: 28px;
  font-weight: 700;
}

.ring-label {
  font-size: 13px;
  opacity: 0.5;
}

/* Remaining bar */
.remaining-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  background: rgba(79, 124, 255, 0.1);
  color: var(--q-primary);
  flex-shrink: 0;
}

.remaining-bar.over-goal {
  background: rgba(255, 77, 79, 0.1);
  color: var(--q-negative);
}

/* Quick chips */
.quick-chips {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.quick-chip {
  flex: 1;
  padding: 12px 4px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.body--light .quick-chip {
  background: rgba(79, 124, 255, 0.08);
  color: var(--q-primary);
}

.body--dark .quick-chip {
  background: rgba(79, 124, 255, 0.15);
  color: #7da2ff;
}

.quick-chip:active {
  transform: scale(0.95);
}

/* Keypad card */
.keypad-card {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--ft-color-surface-light-start);
  border-radius: 16px;
  padding: 14px;
}

.body--dark .keypad-card {
  background: var(--ft-color-surface-dark-start);
}

.display-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.03);
  flex-shrink: 0;
}

.body--dark .display-row {
  background: rgba(255, 255, 255, 0.05);
}

.display-value {
  font-size: 32px;
  font-weight: 700;
  transition: color 0.2s ease;
}

.display-value.has-value {
  color: var(--q-primary);
}

.display-unit {
  font-size: 14px;
  opacity: 0.4;
}

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.key {
  border: none;
  border-radius: 12px;
  font-size: 22px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.08s ease;
  min-height: 48px;
}

.body--light .key {
  background: rgba(0, 0, 0, 0.04);
  color: inherit;
}

.body--dark .key {
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
}

.key:active {
  transform: scale(0.92);
}

.key-action {
  font-size: 14px;
}

.body--light .key-action {
  background: rgba(0, 0, 0, 0.02);
  color: rgba(0, 0, 0, 0.4);
}

.body--dark .key-action {
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.4);
}

.add-btn {
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  background: rgba(79, 124, 255, 0.12);
  color: rgba(79, 124, 255, 0.4);
  flex-shrink: 0;
}

.add-btn.active {
  background: var(--q-primary);
  color: white;
  box-shadow: 0 4px 16px rgba(79, 124, 255, 0.35);
}

.add-btn:disabled {
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Meals section */
.meals-section {
  flex-shrink: 0;
  max-height: 80px;
  display: flex;
  flex-direction: column;
}

.meals-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.5;
  margin-bottom: 4px;
}

.meal-count {
  background: rgba(79, 124, 255, 0.1);
  color: var(--q-primary);
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 10px;
}

.meals-scroll {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.meal-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.1s ease;
}

.body--light .meal-item {
  background: rgba(0, 0, 0, 0.04);
}

.body--dark .meal-item {
  background: rgba(255, 255, 255, 0.06);
}

.meal-item:active {
  background: rgba(255, 77, 79, 0.15);
}

.meal-time {
  opacity: 0.5;
}

.meal-cal {
  font-weight: 600;
}

.edit-icon {
  opacity: 0.3;
  margin-left: 2px;
}

.meal-item:hover .edit-icon,
.meal-item:active .edit-icon {
  opacity: 0.6;
}
</style>
