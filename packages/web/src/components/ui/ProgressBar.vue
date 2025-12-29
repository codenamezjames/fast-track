<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number
  max?: number
  color?: string
  showLabel?: boolean
  height?: 'sm' | 'md' | 'lg'
  striped?: boolean
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  showLabel: false,
  height: 'md',
  striped: false,
  animated: false,
})

const percentage = computed(() => {
  const pct = (props.value / props.max) * 100
  return Math.min(100, Math.max(0, pct))
})

const progressStyle = computed(() => {
  const style: Record<string, string> = {
    width: `${percentage.value}%`,
  }

  if (props.color) {
    style.background = props.color
  }

  return style
})

const formattedLabel = computed(() => {
  return `${Math.round(percentage.value)}%`
})
</script>

<template>
  <div class="progress-wrapper">
    <div
      :class="[
        'progress-bar',
        `progress-bar--${height}`,
      ]"
    >
      <div
        :class="[
          'progress-bar__fill',
          { 'progress-bar__fill--striped': striped },
          { 'progress-bar__fill--animated': animated },
        ]"
        :style="progressStyle"
        role="progressbar"
        :aria-valuenow="value"
        :aria-valuemin="0"
        :aria-valuemax="max"
      ></div>
    </div>

    <span v-if="showLabel" class="progress-label">{{ formattedLabel }}</span>
  </div>
</template>

<style scoped>
.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.progress-bar {
  flex: 1;
  background: var(--color-surface-variant);
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
}

.progress-bar--sm {
  height: 0.375rem;
}

.progress-bar--md {
  height: 0.625rem;
}

.progress-bar--lg {
  height: 1rem;
}

.progress-bar__fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}

.progress-bar__fill--striped {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
}

.progress-bar__fill--animated {
  animation: progress-stripes 1s linear infinite;
}

@keyframes progress-stripes {
  0% {
    background-position: 1rem 0;
  }
  100% {
    background-position: 0 0;
  }
}

.progress-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  min-width: 3rem;
  text-align: right;
}
</style>
