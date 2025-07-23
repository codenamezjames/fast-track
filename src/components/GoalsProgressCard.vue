<template>
  <q-card flat bordered class="chart-card">
    <q-card-section>
      <div class="text-h6 q-mb-md">Goals Progress</div>
      <div class="goals-progress">
        <div class="goal-item q-mb-md" v-for="goal in goals" :key="goal.id">
          <div class="goal-header">
            <div class="goal-title">{{ goal.title }}</div>
            <div class="goal-value">{{ goal.current }} / {{ goal.target }}</div>
          </div>
          <q-linear-progress
            :value="goal.progress"
            :color="goal.color"
            size="8px"
            rounded
            class="q-mt-sm"
          />
          <div class="text-caption text-grey-6 q-mt-xs">
            {{ Math.round(goal.progress * 100) }}% of {{ goal.period }} goal
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  goals: {
    type: Array,
    required: true,
    default: () => []
  }
})
</script>

<style scoped>
.chart-card {
  border-radius: 12px;
  overflow: hidden;
}

.goals-progress {
  display: flex;
  flex-direction: column;
}

.goal-item {
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.goal-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goal-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.goal-value {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--q-text-color);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .goal-header {
    flex-direction: column;
    gap: 4px;
    text-align: center;
  }
}

/* Dark mode adjustments */
body.body--dark .goal-item {
  border-color: rgba(255, 255, 255, 0.12);
}
</style> 