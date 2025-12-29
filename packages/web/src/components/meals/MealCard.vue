<script setup lang="ts">
import { computed } from 'vue'
import { Trash2, Edit } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import type { Meal } from '@/types'

interface Props {
  meal: Meal
}

const props = defineProps<Props>()
const emit = defineEmits<{
  edit: [meal: Meal]
  delete: [id: number]
}>()

const mealTypeLabel = computed(() => {
  return props.meal.type.charAt(0).toUpperCase() + props.meal.type.slice(1)
})

const mealTime = computed(() => {
  const date = new Date(props.meal.date)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
})

const totalMacros = computed(() => {
  return props.meal.foods.reduce(
    (acc, food) => ({
      protein: acc.protein + (food.protein || 0),
      carbs: acc.carbs + (food.carbs || 0),
      fat: acc.fat + (food.fat || 0),
    }),
    { protein: 0, carbs: 0, fat: 0 }
  )
})
</script>

<template>
  <Card padding="md" class="meal-card">
    <div class="meal-card__header">
      <div class="meal-card__info">
        <h3 class="meal-card__type">{{ mealTypeLabel }}</h3>
        <span class="meal-card__time">{{ mealTime }}</span>
      </div>

      <div class="meal-card__actions">
        <button class="meal-card__action" @click="emit('edit', meal)" aria-label="Edit meal">
          <Edit :size="18" />
        </button>
        <button
          class="meal-card__action meal-card__action--delete"
          @click="emit('delete', meal.id)"
          aria-label="Delete meal"
        >
          <Trash2 :size="18" />
        </button>
      </div>
    </div>

    <div class="meal-card__foods">
      <div v-for="food in meal.foods" :key="food.name" class="meal-card__food">
        <span class="meal-card__food-name">{{ food.name }}</span>
        <span class="meal-card__food-calories">{{ food.calories }} cal</span>
      </div>
    </div>

    <div class="meal-card__footer">
      <div class="meal-card__total">
        <span class="meal-card__total-label">Total</span>
        <span class="meal-card__total-value">{{ meal.totalCalories }} cal</span>
      </div>

      <div class="meal-card__macros">
        <span class="meal-card__macro">P: {{ Math.round(totalMacros.protein) }}g</span>
        <span class="meal-card__macro">C: {{ Math.round(totalMacros.carbs) }}g</span>
        <span class="meal-card__macro">F: {{ Math.round(totalMacros.fat) }}g</span>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.meal-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.meal-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.meal-card__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meal-card__type {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.meal-card__time {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.meal-card__actions {
  display: flex;
  gap: 0.5rem;
}

.meal-card__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: var(--color-surface-variant);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.meal-card__action:hover {
  background: var(--color-meals);
  color: #0d0d0d;
  border-color: var(--color-meals);
}

.meal-card__action--delete:hover {
  background: var(--color-error);
  color: white;
  border-color: var(--color-error);
}

.meal-card__action:active {
  transform: scale(0.95);
}

.meal-card__foods {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--color-surface-variant);
  border-radius: var(--radius-md);
}

.meal-card__food {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meal-card__food-name {
  font-size: 0.9375rem;
  color: var(--color-text-primary);
}

.meal-card__food-calories {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.meal-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.meal-card__total {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meal-card__total-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.meal-card__total-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-meals);
}

.meal-card__macros {
  display: flex;
  gap: 0.75rem;
}

.meal-card__macro {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}
</style>
