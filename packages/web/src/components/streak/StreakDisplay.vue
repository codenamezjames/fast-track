<script setup lang="ts">
import { computed } from 'vue'
import { Flame, Snowflake } from 'lucide-vue-next'
import type { StreakIntensity } from '@/types'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'

interface Props {
  currentStreak: number
  longestStreak: number
  intensity?: StreakIntensity
  freezesAvailable?: number
}

const props = withDefaults(defineProps<Props>(), {
  intensity: 'cold',
  freezesAvailable: 0,
})

const intensityConfig = computed(() => {
  const configs: Record<StreakIntensity, { color: string; emoji: string; label: string }> = {
    cold: { color: '#64748b', emoji: '❄️', label: 'Getting Started' },
    warm: { color: '#f59e0b', emoji: '🔥', label: 'Warming Up' },
    hot: { color: '#f97316', emoji: '🔥🔥', label: 'On Fire' },
    fire: { color: '#ef4444', emoji: '🔥🔥🔥', label: 'Blazing' },
    inferno: { color: '#dc2626', emoji: '🔥🔥🔥🔥', label: 'Inferno' },
  }
  return configs[props.intensity]
})
</script>

<template>
  <Card padding="lg">
    <div class="streak-display">
      <div class="streak-display__header">
        <h3 class="streak-display__title">Your Streak</h3>
        <Badge v-if="freezesAvailable > 0" variant="info">
          <Snowflake :size="14" />
          {{ freezesAvailable }} {{ freezesAvailable === 1 ? 'Freeze' : 'Freezes' }}
        </Badge>
      </div>

      <div class="streak-display__main">
        <div class="streak-display__icon" :style="{ color: intensityConfig.color }">
          <Flame :size="64" :stroke-width="2" />
        </div>

        <div class="streak-display__value">{{ currentStreak }}</div>
        <div class="streak-display__label">Day{{ currentStreak !== 1 ? 's' : '' }}</div>

        <div class="streak-display__intensity">
          <span class="streak-display__emoji">{{ intensityConfig.emoji }}</span>
          <span class="streak-display__intensity-label">{{ intensityConfig.label }}</span>
        </div>
      </div>

      <div class="streak-display__footer">
        <div class="streak-display__stat">
          <span class="streak-display__stat-label">Longest Streak</span>
          <span class="streak-display__stat-value">{{ longestStreak }} days</span>
        </div>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.streak-display {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.streak-display__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.streak-display__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.streak-display__main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 0;
}

.streak-display__icon {
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.streak-display__value {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.streak-display__label {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.streak-display__intensity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color-surface-variant);
  border-radius: var(--radius-full);
}

.streak-display__emoji {
  font-size: 1.25rem;
}

.streak-display__intensity-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.streak-display__footer {
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.streak-display__stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.streak-display__stat-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.streak-display__stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}
</style>
