<template>
  <q-card flat bordered class="chart-card">
    <q-card-section>
      <div class="text-h6 q-mb-md">Weekly Overview</div>
      <div class="weekly-overview">
        <div class="overview-item" v-for="day in weeklyData" :key="day.date">
          <div class="day-header">
            <div class="day-name">{{ day.dayName }}</div>
            <div class="day-date text-caption text-grey-6">{{ day.date }}</div>
          </div>
          <div class="day-stats">
            <div class="stat-item">
              <q-icon name="local_fire_department" size="16px" color="primary" />
              <span class="q-ml-xs">{{ day.calories }} cal</span>
            </div>
            <div class="stat-item">
              <q-icon name="timer" size="16px" color="secondary" />
              <span class="q-ml-xs">{{ day.fastingHours }}h</span>
            </div>
          </div>
          <div class="day-progress">
            <q-linear-progress
              :value="day.calorieProgress"
              color="primary"
              size="4px"
              rounded
              class="q-mt-xs"
            />
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  weeklyData: {
    type: Array,
    required: true,
    default: () => [],
  },
})
</script>

<style scoped>
.chart-card {
  border-radius: 12px;
  overflow: hidden;
}

.weekly-overview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.overview-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  background: var(--q-background);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.day-header {
  flex: 1;
}

.day-name {
  font-weight: 600;
  font-size: 0.95rem;
}

.day-stats {
  display: flex;
  gap: 16px;
  flex: 2;
  justify-content: center;
}

.stat-item {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.day-progress {
  flex: 1;
  min-width: 60px;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .overview-item {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }

  .day-stats {
    justify-content: space-around;
    width: 100%;
  }

  .day-progress {
    width: 100%;
  }
}

/* Dark mode adjustments */
body.body--dark .overview-item {
  background: var(--q-dark-page);
  border-color: rgba(255, 255, 255, 0.12);
}
</style>
