<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 q-mb-md">Goals</div>

      <!-- Calorie Goal -->
      <div class="setting-item">
        <div class="setting-label">
          <q-icon name="local_fire_department" size="20px" color="primary" />
          <span>Daily Calorie Goal</span>
        </div>
        <div class="setting-control">
          <q-input
            v-model.number="localCalorieGoal"
            type="number"
            dense
            outlined
            suffix="kcal"
            style="width: 120px"
            @blur="updateCalorieGoal"
            @keyup.enter="updateCalorieGoal"
          />
        </div>
      </div>

      <!-- Weight Goal -->
      <div class="setting-item">
        <div class="setting-label">
          <q-icon name="flag" size="20px" color="positive" />
          <span>Target Weight</span>
        </div>
        <div class="setting-control">
          <q-input
            v-model.number="localWeightGoal"
            type="number"
            dense
            outlined
            :suffix="settingsStore.weightUnit"
            style="width: 120px"
            placeholder="Optional"
            @blur="updateWeightGoal"
            @keyup.enter="updateWeightGoal"
          />
          <q-btn
            v-if="localWeightGoal"
            flat
            round
            dense
            icon="close"
            size="sm"
            color="grey"
            @click="clearWeightGoal"
          />
        </div>
      </div>

      <!-- Weekly Fasting Goal -->
      <div class="setting-item">
        <div class="setting-label">
          <q-icon name="schedule" size="20px" color="secondary" />
          <span>Weekly Fasting Goal</span>
        </div>
        <div class="setting-control">
          <q-btn-toggle
            v-model="localFastingGoal"
            :options="fastingOptions"
            no-caps
            rounded
            unelevated
            toggle-color="primary"
            color="grey-3"
            text-color="grey-7"
            @update:model-value="updateFastingGoal"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useSettingsStore } from '../../stores/settings.js'

const settingsStore = useSettingsStore()

const localCalorieGoal = ref(2000)
const localWeightGoal = ref(null)
const localFastingGoal = ref(5)

const fastingOptions = [
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '7', value: 7 },
]

onMounted(async () => {
  await settingsStore.loadSettings()
  localCalorieGoal.value = settingsStore.calorieGoal
  localWeightGoal.value = settingsStore.weightGoalDisplay
  localFastingGoal.value = settingsStore.weeklyFastingGoal
})

watch(
  () => settingsStore.calorieGoal,
  (val) => {
    localCalorieGoal.value = val
  },
)

watch(
  () => settingsStore.weightGoalDisplay,
  (val) => {
    localWeightGoal.value = val
  },
)

const updateCalorieGoal = () => {
  if (localCalorieGoal.value >= 500 && localCalorieGoal.value <= 10000) {
    settingsStore.setCalorieGoal(localCalorieGoal.value)
  }
}

const updateWeightGoal = () => {
  if (localWeightGoal.value && localWeightGoal.value > 0) {
    settingsStore.setWeightGoal(localWeightGoal.value)
  }
}

const clearWeightGoal = () => {
  localWeightGoal.value = null
  settingsStore.clearWeightGoal()
}

const updateFastingGoal = () => {
  settingsStore.setWeeklyFastingGoal(localFastingGoal.value)
}
</script>

<style scoped>
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.body--dark .setting-item {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
