<template>
  <q-card flat bordered class="stat-overview-card">
    <q-card-section class="text-center">
      <q-icon :name="icon" size="32px" :color="color" class="q-mb-sm" />
      <div class="text-h5" :class="`text-${color}`">{{ value }}</div>
      <div class="text-caption text-grey-6">{{ label }}</div>
      <div class="text-body2 q-mt-xs" v-if="showTrend">
        <span :class="trendClass">
          <q-icon :name="trendIcon" size="16px" />
          {{ trendValue }}{{ trendSuffix }}
        </span>
        <span class="text-grey-6 q-ml-xs">{{ trendLabel }}</span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  showTrend: {
    type: Boolean,
    default: false
  },
  trendValue: {
    type: [String, Number],
    default: ''
  },
  trendSuffix: {
    type: String,
    default: ''
  },
  trendLabel: {
    type: String,
    default: ''
  },
  trendType: {
    type: String,
    default: 'neutral',
    validator: value => ['positive', 'negative', 'neutral', 'primary'].includes(value)
  },
  trendDirection: {
    type: String,
    default: null,
    validator: value => !value || ['positive', 'negative', 'neutral'].includes(value)
  }
})

const trendClass = computed(() => {
  if (props.trendType === 'positive') return 'text-positive'
  if (props.trendType === 'negative') return 'text-negative'
  if (props.trendType === 'primary') return 'text-primary'
  return 'text-grey-7'
})

const trendIcon = computed(() => {
  // Use trendDirection if provided (for primary type), otherwise use trendType
  const direction = props.trendDirection || props.trendType
  if (direction === 'positive') return 'trending_up'
  if (direction === 'negative') return 'trending_down'
  return 'trending_flat'
})
</script>

<style scoped>
.stat-overview-card {
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Dark mode adjustments */
body.body--dark .stat-overview-card:hover {
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}
</style> 