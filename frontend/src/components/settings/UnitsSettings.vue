<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 q-mb-md">Units</div>

      <!-- Weight Unit -->
      <div class="setting-item">
        <div class="setting-label">
          <q-icon name="monitor_weight" size="20px" color="primary" />
          <span>Weight Unit</span>
        </div>
        <div class="setting-control">
          <q-btn-toggle
            v-model="weightUnit"
            :options="weightOptions"
            no-caps
            rounded
            unelevated
            toggle-color="primary"
            color="grey-3"
            text-color="grey-7"
            @update:model-value="updateWeightUnit"
          />
        </div>
      </div>

      <!-- Height Unit -->
      <div class="setting-item">
        <div class="setting-label">
          <q-icon name="height" size="20px" color="secondary" />
          <span>Height Unit</span>
        </div>
        <div class="setting-control">
          <q-btn-toggle
            v-model="heightUnit"
            :options="heightOptions"
            no-caps
            rounded
            unelevated
            toggle-color="primary"
            color="grey-3"
            text-color="grey-7"
            @update:model-value="updateHeightUnit"
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

const weightUnit = ref('lbs')
const heightUnit = ref('ft')

const weightOptions = [
  { label: 'lbs', value: 'lbs' },
  { label: 'kg', value: 'kg' },
]

const heightOptions = [
  { label: 'ft/in', value: 'ft' },
  { label: 'cm', value: 'cm' },
]

onMounted(async () => {
  await settingsStore.loadSettings()
  weightUnit.value = settingsStore.weightUnit
  heightUnit.value = settingsStore.heightUnit
})

watch(
  () => settingsStore.weightUnit,
  (val) => {
    weightUnit.value = val
  },
)

watch(
  () => settingsStore.heightUnit,
  (val) => {
    heightUnit.value = val
  },
)

const updateWeightUnit = (unit) => {
  settingsStore.setWeightUnit(unit)
}

const updateHeightUnit = (unit) => {
  settingsStore.setHeightUnit(unit)
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
