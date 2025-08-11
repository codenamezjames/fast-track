<template>
  <div class="meal-quick-actions">
    <!-- Quick Calorie Buttons -->
    <div class="quick-calorie-buttons q-mb-md">
      <div class="text-subtitle2 q-mb-sm">Quick Add:</div>
      <div class="row q-gutter-xs">
        <q-btn
          v-for="amount in quickAmounts"
          :key="amount"
          :label="`+${amount}`"
          color="primary"
          unelevated
          @click="addCalories(amount)"
          class="col-auto"
          size="md"
        />
      </div>
    </div>

    <!-- Custom Amount Input -->
    <div v-if="showCustomInput" class="custom-amount-section q-mb-md">
      <div class="text-subtitle2 q-mb-sm">Custom Amount:</div>
      <div class="row q-gutter-xs items-center">
        <q-input
          v-model="customAmount"
          type="number"
          outlined
          dense
          placeholder="Enter calories"
          class="col"
          @keyup.enter="addCustomCalories"
        >
          <template v-slot:append>
            <span class="text-caption">kcal</span>
          </template>
        </q-input>
        <q-btn
          label="Add"
          color="secondary"
          unelevated
          @click="addCustomCalories"
          :disable="!customAmount || customAmount <= 0"
        />
      </div>
    </div>

    <!-- Calorie Pool Display -->
    <div v-if="showPool" class="calorie-pool q-mb-md">
      <div class="text-subtitle2 q-mb-sm">Current Meal:</div>
      <q-card flat bordered class="pool-display">
        <q-card-section class="text-center">
          <div class="text-h4 text-weight-bold text-primary">
            {{ formatNumber(caloriePool) }}
          </div>
          <div class="text-caption text-grey-6">calories</div>
          <div v-if="poolNotes" class="text-body2 text-grey-7 q-mt-sm">
            {{ poolNotes }}
          </div>
        </q-card-section>
      </q-card>

      <!-- Pool Actions -->
      <div class="row q-gutter-xs q-mt-sm">
        <q-btn
          label="Save Meal"
          color="positive"
          unelevated
          @click="saveMeal"
          :disable="caloriePool <= 0"
          class="col"
        />
        <q-btn
          label="Clear"
          color="grey"
          outline
          @click="clearPool"
          :disable="caloriePool <= 0"
          class="col-auto"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { APP_CONSTANTS } from '../../utils/constants.js'

// Props
const props = defineProps({
  quickAmounts: {
    type: Array,
    default: () => APP_CONSTANTS.QUICK_CALORIE_AMOUNTS,
  },
  showCustomInput: {
    type: Boolean,
    default: true,
  },
  showPool: {
    type: Boolean,
    default: false,
  },
  caloriePool: {
    type: Number,
    default: 0,
  },
  poolNotes: {
    type: String,
    default: '',
  },
})

// Emits
const emit = defineEmits(['add-calories', 'add-custom-calories', 'save-meal', 'clear-pool'])

// Reactive data
const customAmount = ref('')

// Methods
const addCalories = (amount) => {
  emit('add-calories', amount)
}

const addCustomCalories = () => {
  const amount = parseInt(customAmount.value)
  if (amount && amount > 0) {
    emit('add-custom-calories', amount)
    customAmount.value = ''
  }
}

const saveMeal = () => {
  if (props.caloriePool > 0) {
    emit('save-meal', {
      calories: props.caloriePool,
      notes: props.poolNotes,
    })
  }
}

const clearPool = () => {
  emit('clear-pool')
}

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}
</script>

<style scoped>
.meal-quick-actions {
  width: 100%;
}

.quick-calorie-buttons {
  border-radius: 8px;
  padding: 12px;
  background: rgba(79, 124, 255, 0.05);
}

.pool-display {
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(79, 124, 255, 0.1), rgba(79, 124, 255, 0.05));
}

.custom-amount-section {
  border-radius: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
}

/* Dark mode support */
:deep(.q-dark) .quick-calorie-buttons {
  background: rgba(79, 124, 255, 0.1);
}

:deep(.q-dark) .custom-amount-section {
  background: rgba(255, 255, 255, 0.05);
}
</style>
