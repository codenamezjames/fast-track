<script setup lang="ts">
import { Flame, Target, TrendingUp } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'

interface Props {
  currentStreak?: number
  todayCalories?: number
  calorieGoal?: number
  weeklyProgress?: number
}

withDefaults(defineProps<Props>(), {
  currentStreak: 0,
  todayCalories: 0,
  calorieGoal: 2000,
  weeklyProgress: 0,
})
</script>

<template>
  <div class="quick-stats">
    <Card padding="md">
      <div class="stat">
        <div class="stat__icon stat__icon--fire">
          <Flame :size="24" />
        </div>
        <div class="stat__content">
          <div class="stat__label">Current Streak</div>
          <div class="stat__value">{{ currentStreak }} days</div>
        </div>
      </div>
    </Card>

    <Card padding="md">
      <div class="stat">
        <div class="stat__icon stat__icon--target">
          <Target :size="24" />
        </div>
        <div class="stat__content">
          <div class="stat__label">Today's Calories</div>
          <div class="stat__value">{{ todayCalories }} / {{ calorieGoal }}</div>
        </div>
      </div>
    </Card>

    <Card padding="md">
      <div class="stat">
        <div class="stat__icon stat__icon--progress">
          <TrendingUp :size="24" />
        </div>
        <div class="stat__content">
          <div class="stat__label">Weekly Progress</div>
          <div class="stat__value">{{ weeklyProgress }}%</div>
        </div>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.stat__icon--fire {
  background: rgba(139, 92, 246, 0.15);
  color: var(--color-fasting);
}

.stat__icon--target {
  background: rgba(249, 115, 22, 0.15);
  color: var(--color-meals);
}

.stat__icon--progress {
  background: rgba(59, 130, 246, 0.15);
  color: var(--color-activity);
}

.stat__content {
  flex: 1;
  min-width: 0;
}

.stat__label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.stat__value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}
</style>
