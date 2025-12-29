<script setup lang="ts">
import { Check, X } from 'lucide-vue-next'
import type { DailyActivity } from '@/types'
import Card from '@/components/ui/Card.vue'

interface Props {
  activity: DailyActivity | null
}

defineProps<Props>()

interface ActivityItem {
  key: keyof Pick<DailyActivity, 'fastCompleted' | 'mealsLogged' | 'workoutCompleted'>
  label: string
  color: string
}

const activities: ActivityItem[] = [
  { key: 'fastCompleted', label: 'Fast Completed', color: 'var(--color-fasting)' },
  { key: 'mealsLogged', label: 'Meals Logged', color: 'var(--color-meals)' },
  { key: 'workoutCompleted', label: 'Workout Done', color: 'var(--color-workouts)' },
]
</script>

<template>
  <Card padding="lg">
    <div class="today-activity">
      <h3 class="today-activity__title">Today's Activities</h3>

      <div class="today-activity__list">
        <div
          v-for="item in activities"
          :key="item.key"
          class="today-activity__item"
        >
          <div
            :class="[
              'today-activity__icon',
              { 'today-activity__icon--completed': activity?.[item.key] },
            ]"
            :style="{ borderColor: item.color }"
          >
            <Check v-if="activity?.[item.key]" :size="20" :color="item.color" />
            <X v-else :size="20" />
          </div>

          <span
            :class="[
              'today-activity__label',
              { 'today-activity__label--completed': activity?.[item.key] },
            ]"
          >
            {{ item.label }}
          </span>
        </div>
      </div>

      <div v-if="activity?.streakMaintained" class="today-activity__streak">
        <span class="today-activity__streak-text">✨ Streak Maintained!</span>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.today-activity {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.today-activity__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.today-activity__list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.today-activity__item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.today-activity__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-disabled);
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.today-activity__icon--completed {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--color-success);
}

.today-activity__label {
  font-size: 1rem;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.today-activity__label--completed {
  color: var(--color-text-primary);
  font-weight: 500;
}

.today-activity__streak {
  padding: 1rem;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
  border-radius: var(--radius-md);
  text-align: center;
}

.today-activity__streak-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-primary);
}
</style>
