<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Trash2 } from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import ManualFoodEntry from './ManualFoodEntry.vue'
import type { FoodItem, MealType } from '@/types'

interface Props {
  open: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: [data: { type: MealType; foods: FoodItem[]; totalCalories: number }]
}>()

const mealType = ref<MealType>('breakfast')
const foods = ref<FoodItem[]>([])

const mealTypes: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
]

const totalCalories = computed(() => {
  return foods.value.reduce((sum, food) => sum + food.calories, 0)
})

const totalMacros = computed(() => {
  return foods.value.reduce(
    (acc, food) => ({
      protein: acc.protein + (food.protein || 0),
      carbs: acc.carbs + (food.carbs || 0),
      fat: acc.fat + (food.fat || 0),
    }),
    { protein: 0, carbs: 0, fat: 0 }
  )
})

const canSave = computed(() => {
  return foods.value.length > 0
})

function handleAddFood(food: FoodItem) {
  foods.value.push(food)
}

function handleRemoveFood(index: number) {
  foods.value.splice(index, 1)
}

function handleSave() {
  if (!canSave.value) return

  emit('save', {
    type: mealType.value,
    foods: foods.value,
    totalCalories: totalCalories.value,
  })

  // Reset
  mealType.value = 'breakfast'
  foods.value = []
}

function handleClose() {
  emit('close')
  // Reset
  mealType.value = 'breakfast'
  foods.value = []
}
</script>

<template>
  <Modal :model-value="open" title="Add Meal" max-width="lg" @update:model-value="(val) => !val && handleClose()">
    <div class="add-meal-modal">
      <!-- Meal Type Selection -->
      <div class="add-meal-modal__section">
        <label class="add-meal-modal__label">Meal Type</label>
        <div class="add-meal-modal__meal-types">
          <button
            v-for="type in mealTypes"
            :key="type.value"
            :class="[
              'add-meal-modal__meal-type',
              { 'add-meal-modal__meal-type--active': mealType === type.value },
            ]"
            @click="mealType = type.value"
          >
            {{ type.label }}
          </button>
        </div>
      </div>

      <!-- Added Foods List -->
      <div v-if="foods.length > 0" class="add-meal-modal__section">
        <label class="add-meal-modal__label">Added Foods ({{ foods.length }})</label>
        <div class="add-meal-modal__foods">
          <div v-for="(food, index) in foods" :key="index" class="add-meal-modal__food">
            <div class="add-meal-modal__food-info">
              <span class="add-meal-modal__food-name">{{ food.name }}</span>
              <span class="add-meal-modal__food-details">
                {{ food.calories }} cal
                <template v-if="food.protein || food.carbs || food.fat">
                  • P: {{ food.protein || 0 }}g • C: {{ food.carbs || 0 }}g • F: {{ food.fat || 0 }}g
                </template>
              </span>
            </div>
            <button
              class="add-meal-modal__food-remove"
              @click="handleRemoveFood(index)"
              aria-label="Remove food"
            >
              <Trash2 :size="16" />
            </button>
          </div>
        </div>

        <!-- Totals -->
        <div class="add-meal-modal__totals">
          <div class="add-meal-modal__total">
            <span class="add-meal-modal__total-label">Total Calories</span>
            <span class="add-meal-modal__total-value">{{ totalCalories }} cal</span>
          </div>
          <div class="add-meal-modal__macros">
            <span class="add-meal-modal__macro">P: {{ Math.round(totalMacros.protein) }}g</span>
            <span class="add-meal-modal__macro">C: {{ Math.round(totalMacros.carbs) }}g</span>
            <span class="add-meal-modal__macro">F: {{ Math.round(totalMacros.fat) }}g</span>
          </div>
        </div>
      </div>

      <!-- Manual Food Entry -->
      <div class="add-meal-modal__section">
        <label class="add-meal-modal__label">Add Food</label>
        <ManualFoodEntry @add="handleAddFood" />
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="add-meal-modal__footer">
        <Button variant="ghost" @click="handleClose">Cancel</Button>
        <Button variant="meals" :disabled="!canSave" @click="handleSave">Save Meal</Button>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
.add-meal-modal {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.add-meal-modal__section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.add-meal-modal__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.add-meal-modal__meal-types {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.add-meal-modal__meal-type {
  padding: 0.75rem;
  background: var(--color-surface-variant);
  border: 2px solid var(--color-border);
  color: var(--color-text-primary);
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-meal-modal__meal-type:hover {
  border-color: var(--color-meals);
  background: rgba(255, 149, 0, 0.1);
}

.add-meal-modal__meal-type--active {
  background: var(--color-meals);
  border-color: var(--color-meals);
  color: #0d0d0d;
}

.add-meal-modal__meal-type:active {
  transform: scale(0.98);
}

.add-meal-modal__foods {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--color-surface-variant);
  border-radius: var(--radius-md);
  max-height: 200px;
  overflow-y: auto;
}

.add-meal-modal__food {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
}

.add-meal-modal__food-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.add-meal-modal__food-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add-meal-modal__food-details {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.add-meal-modal__food-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.add-meal-modal__food-remove:hover {
  background: var(--color-error);
  border-color: var(--color-error);
  color: white;
}

.add-meal-modal__food-remove:active {
  transform: scale(0.95);
}

.add-meal-modal__totals {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 149, 0, 0.1);
  border: 1px solid rgba(255, 149, 0, 0.3);
  border-radius: var(--radius-md);
}

.add-meal-modal__total {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.add-meal-modal__total-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.add-meal-modal__total-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-meals);
}

.add-meal-modal__macros {
  display: flex;
  gap: 1rem;
}

.add-meal-modal__macro {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.add-meal-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .add-meal-modal__meal-types {
    grid-template-columns: repeat(2, 1fr);
  }

  .add-meal-modal__totals {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
