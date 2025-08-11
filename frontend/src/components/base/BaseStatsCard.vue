<template>
  <q-card flat bordered class="stats-card">
    <q-card-section class="text-center">
      <!-- Icon -->
      <q-icon v-if="icon" :name="icon" :size="iconSize" :color="iconColor" class="q-mb-sm" />

      <!-- Main Value -->
      <div class="text-h5" :class="`text-${valueColor}`">
        {{ formattedValue }}
      </div>

      <!-- Label -->
      <div class="text-caption text-grey-6">
        {{ label }}
      </div>

      <!-- Trend (optional) -->
      <div v-if="showTrend" class="text-body2 q-mt-xs">
        <span :class="trendClass">
          <q-icon v-if="trendIcon" :name="trendIcon" size="16px" />
          {{ trendValue }}{{ trendSuffix }}
        </span>
        <span class="text-grey-6 q-ml-xs">
          {{ trendLabel }}
        </span>
      </div>

      <!-- Subtitle (optional) -->
      <div v-if="subtitle" class="text-caption text-grey-5 q-mt-xs">
        {{ subtitle }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  // Main content
  value: {
    type: [String, Number],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },

  // Icon
  icon: {
    type: String,
    default: '',
  },
  iconSize: {
    type: String,
    default: '32px',
  },
  iconColor: {
    type: String,
    default: 'primary',
  },

  // Value styling
  valueColor: {
    type: String,
    default: 'primary',
  },
  valueFormat: {
    type: String,
    default: 'number', // 'number', 'currency', 'percentage', 'custom'
    validator: (value) => ['number', 'currency', 'percentage', 'custom'].includes(value),
  },
  valueUnit: {
    type: String,
    default: '',
  },
  valueDecimals: {
    type: Number,
    default: 0,
  },

  // Trend
  showTrend: {
    type: Boolean,
    default: false,
  },
  trendValue: {
    type: [String, Number],
    default: '',
  },
  trendSuffix: {
    type: String,
    default: '',
  },
  trendLabel: {
    type: String,
    default: '',
  },
  trendIcon: {
    type: String,
    default: '',
  },
  trendType: {
    type: String,
    default: 'neutral',
    validator: (value) => ['positive', 'negative', 'neutral', 'primary'].includes(value),
  },
  trendDirection: {
    type: String,
    default: null,
    validator: (value) => !value || ['positive', 'negative', 'neutral'].includes(value),
  },

  // Styling
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'outlined', 'elevated'].includes(value),
  },
})

// Computed
const formattedValue = computed(() => {
  const val = props.value

  if (props.valueFormat === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: props.valueDecimals,
      maximumFractionDigits: props.valueDecimals,
    }).format(val)
  }

  if (props.valueFormat === 'percentage') {
    return `${val.toFixed(props.valueDecimals)}%`
  }

  if (props.valueFormat === 'number') {
    const formatted = new Intl.NumberFormat().format(val)
    return props.valueUnit ? `${formatted}${props.valueUnit}` : formatted
  }

  // Custom format - return as is
  return val
})

const trendClass = computed(() => {
  if (props.trendType === 'positive') return 'text-positive'
  if (props.trendType === 'negative') return 'text-negative'
  if (props.trendType === 'primary') return 'text-primary'
  return 'text-grey-7'
})

// cardClass computed removed as it's not being used
</script>

<style scoped>
.stats-card {
  border-radius: 12px;
  transition: all 0.2s ease;
  min-height: 120px;
  display: flex;
  align-items: center;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stats-card--outlined {
  border: 2px solid;
  border-color: var(--q-primary);
}

.stats-card--elevated {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.stats-card--small {
  min-height: 100px;
}

.stats-card--small .text-h5 {
  font-size: 1.5rem;
}

.stats-card--large {
  min-height: 140px;
}

.stats-card--large .text-h5 {
  font-size: 2rem;
}

/* Dark mode support */
:deep(.q-dark) .stats-card {
  background: var(--q-dark);
}

:deep(.q-dark) .stats-card:hover {
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .stats-card {
    min-height: 100px;
  }

  .stats-card .text-h5 {
    font-size: 1.25rem;
  }
}
</style>
