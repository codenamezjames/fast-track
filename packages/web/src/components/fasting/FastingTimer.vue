<script setup lang="ts">
import { Timer, Play, Square } from 'lucide-vue-next'
import { useFasting } from '@/composables/useFasting'
import Card from '@/components/ui/Card.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'

const fasting = useFasting()

const emit = defineEmits<{
  'start-fast': []
  'end-fast': []
}>()

function handleStart() {
  emit('start-fast')
}

async function handleEnd() {
  await fasting.endFast()
  emit('end-fast')
}
</script>

<template>
  <Card padding="lg">
    <div class="fasting-timer">
      <div class="fasting-timer__header">
        <div class="fasting-timer__title-wrapper">
          <Timer :size="24" :stroke-width="2" />
          <h3 class="fasting-timer__title">Fasting Timer</h3>
        </div>

        <Badge
          v-if="fasting.hasActiveFast.value"
          :variant="fasting.isCompleted.value ? 'success' : 'warning'"
        >
          {{ fasting.isCompleted.value ? 'Completed' : 'Active' }}
        </Badge>
      </div>

      <div v-if="!fasting.hasActiveFast.value" class="fasting-timer__empty">
        <div class="fasting-timer__empty-icon">
          <Timer :size="48" :stroke-width="1.5" />
        </div>
        <p class="fasting-timer__empty-text">No active fast</p>
        <Button variant="primary" @click="handleStart">
          <Play :size="18" />
          Start Fasting
        </Button>
      </div>

      <div v-else class="fasting-timer__content">
        <div class="fasting-timer__time">
          <div class="fasting-timer__time-value">{{ fasting.formattedElapsed.value }}</div>
          <div class="fasting-timer__time-label">Elapsed</div>
        </div>

        <ProgressBar
          :value="fasting.percentage.value"
          :max="100"
          height="lg"
          :striped="!fasting.isCompleted.value"
          :animated="!fasting.isCompleted.value"
          :color="fasting.isCompleted.value ? 'var(--color-success)' : 'var(--color-fasting)'"
          show-label
        />

        <div class="fasting-timer__stats">
          <div class="fasting-timer__stat">
            <span class="fasting-timer__stat-label">Goal</span>
            <span class="fasting-timer__stat-value">{{ fasting.formattedGoal.value }}</span>
          </div>

          <div v-if="!fasting.isCompleted.value" class="fasting-timer__stat">
            <span class="fasting-timer__stat-label">Remaining</span>
            <span class="fasting-timer__stat-value">{{ fasting.formattedRemaining.value }}</span>
          </div>

          <div v-else class="fasting-timer__stat">
            <span class="fasting-timer__stat-label">Status</span>
            <span class="fasting-timer__stat-value fasting-timer__stat-value--success">
              Goal Reached! 🎉
            </span>
          </div>
        </div>

        <Button variant="danger" full-width :loading="fasting.loading.value" @click="handleEnd">
          <Square :size="18" />
          End Fast
        </Button>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.fasting-timer {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.fasting-timer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fasting-timer__title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-fasting);
}

.fasting-timer__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.fasting-timer__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
}

.fasting-timer__empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background: var(--color-surface-variant);
  border-radius: var(--radius-full);
  color: var(--color-text-disabled);
}

.fasting-timer__empty-text {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.fasting-timer__content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.fasting-timer__time {
  text-align: center;
  padding: 1.5rem 0;
}

.fasting-timer__time-value {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-fasting);
  line-height: 1;
  margin-bottom: 0.5rem;
  font-variant-numeric: tabular-nums;
}

.fasting-timer__time-label {
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.fasting-timer__stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
  background: var(--color-surface-variant);
  border-radius: var(--radius-md);
}

.fasting-timer__stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.fasting-timer__stat-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.fasting-timer__stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.fasting-timer__stat-value--success {
  color: var(--color-success);
}
</style>
