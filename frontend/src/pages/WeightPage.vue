<template>
  <q-page class="weight-page">
    <q-pull-to-refresh @refresh="onRefresh">
      <div class="weight-container">
        <!-- Header -->
        <div class="page-header">
          <span class="page-title">Body Stats</span>
          <span class="page-subtitle">Track your progress</span>
        </div>

        <!-- BMI Card -->
        <div class="bmi-card" v-if="bmi > 0">
          <div class="bmi-ring-container">
            <svg class="bmi-ring" viewBox="0 0 120 120">
              <circle class="bmi-bg" cx="60" cy="60" r="52" fill="none" stroke-width="8" />
              <circle
                class="bmi-bar"
                :class="bmiCategory.class"
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke-width="8"
                :stroke-dasharray="bmiCircumference"
                :stroke-dashoffset="bmiOffset"
                stroke-linecap="round"
              />
            </svg>
            <div class="bmi-content">
              <div class="bmi-value">{{ bmi.toFixed(1) }}</div>
              <div class="bmi-label">BMI</div>
            </div>
          </div>
          <div class="bmi-info">
            <div class="bmi-category" :class="bmiCategory.class">{{ bmiCategory.label }}</div>
            <div class="bmi-range">{{ bmiCategory.range }}</div>
          </div>
        </div>

        <!-- Setup Prompt (no height) -->
        <div class="setup-card" v-else>
          <q-icon name="straighten" size="32px" class="setup-icon" />
          <div class="setup-text">Add your height to calculate BMI</div>
        </div>

        <!-- Current Stats -->
        <div class="stats-row" v-if="latestWeight || latestMeasurements">
          <div class="stat-item" v-if="latestWeight">
            <div class="stat-value">{{ displayWeight }}</div>
            <div class="stat-label">Weight</div>
          </div>
          <div class="stat-item" v-if="bodyFat > 0">
            <div class="stat-value">{{ bodyFat.toFixed(1) }}%</div>
            <div class="stat-label">Body Fat</div>
          </div>
          <div class="stat-item" v-if="latestMeasurements?.waist">
            <div class="stat-value">{{ latestMeasurements.waist }}"</div>
            <div class="stat-label">Waist</div>
          </div>
        </div>

        <!-- Quick Entry Tabs -->
        <div class="entry-tabs">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'weight' }"
            @click="activeTab = 'weight'"
          >
            <q-icon name="monitor_weight" size="20px" />
            <span>Weight</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'measurements' }"
            @click="activeTab = 'measurements'"
          >
            <q-icon name="straighten" size="20px" />
            <span>Measurements</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'profile' }"
            @click="activeTab = 'profile'"
          >
            <q-icon name="person" size="20px" />
            <span>Profile</span>
          </button>
        </div>

        <!-- Weight Entry -->
        <div class="entry-card" v-if="activeTab === 'weight'">
          <div class="input-group">
            <label class="input-label">Weight</label>
            <div class="input-row">
              <input
                v-model="weightInput"
                type="number"
                step="0.1"
                class="num-input"
                :placeholder="`Enter weight`"
              />
              <div class="unit-toggle">
                <button
                  class="unit-btn"
                  :class="{ active: weightUnit === 'lbs' }"
                  @click="weightUnit = 'lbs'"
                >
                  lbs
                </button>
                <button
                  class="unit-btn"
                  :class="{ active: weightUnit === 'kg' }"
                  @click="weightUnit = 'kg'"
                >
                  kg
                </button>
              </div>
            </div>
          </div>
          <button
            class="save-btn"
            :class="{ active: weightInput > 0 }"
            :disabled="!weightInput || isSaving"
            @click="saveWeight"
          >
            <q-icon v-if="isSaving" name="hourglass_empty" class="spinning" />
            <template v-else>Save Weight</template>
          </button>
        </div>

        <!-- Measurements Entry -->
        <div class="entry-card" v-if="activeTab === 'measurements'">
          <div class="measurements-grid">
            <div class="input-group">
              <label class="input-label">Waist</label>
              <div class="input-with-unit">
                <input
                  v-model="measurements.waist"
                  type="number"
                  step="0.5"
                  class="num-input"
                  placeholder="0"
                />
                <span class="unit-suffix">in</span>
              </div>
            </div>
            <div class="input-group">
              <label class="input-label">Chest</label>
              <div class="input-with-unit">
                <input
                  v-model="measurements.chest"
                  type="number"
                  step="0.5"
                  class="num-input"
                  placeholder="0"
                />
                <span class="unit-suffix">in</span>
              </div>
            </div>
            <div class="input-group">
              <label class="input-label">Neck</label>
              <div class="input-with-unit">
                <input
                  v-model="measurements.neck"
                  type="number"
                  step="0.5"
                  class="num-input"
                  placeholder="0"
                />
                <span class="unit-suffix">in</span>
              </div>
            </div>
            <div class="input-group">
              <label class="input-label">Arms</label>
              <div class="input-with-unit">
                <input
                  v-model="measurements.arms"
                  type="number"
                  step="0.5"
                  class="num-input"
                  placeholder="0"
                />
                <span class="unit-suffix">in</span>
              </div>
            </div>
            <div class="input-group full-width">
              <label class="input-label">Thighs</label>
              <div class="input-with-unit">
                <input
                  v-model="measurements.thighs"
                  type="number"
                  step="0.5"
                  class="num-input"
                  placeholder="0"
                />
                <span class="unit-suffix">in</span>
              </div>
            </div>
          </div>
          <button
            class="save-btn"
            :class="{ active: hasAnyMeasurement }"
            :disabled="!hasAnyMeasurement || isSaving"
            @click="saveMeasurements"
          >
            <q-icon v-if="isSaving" name="hourglass_empty" class="spinning" />
            <template v-else>Save Measurements</template>
          </button>
        </div>

        <!-- Profile Entry -->
        <div class="entry-card" v-if="activeTab === 'profile'">
          <div class="input-group">
            <label class="input-label">Height</label>
            <div class="height-inputs" v-if="heightUnit === 'ft'">
              <div class="input-with-unit">
                <input v-model="heightFeet" type="number" class="num-input" placeholder="5" />
                <span class="unit-suffix">ft</span>
              </div>
              <div class="input-with-unit">
                <input v-model="heightInches" type="number" class="num-input" placeholder="10" />
                <span class="unit-suffix">in</span>
              </div>
            </div>
            <div class="input-with-unit" v-else>
              <input v-model="heightCm" type="number" class="num-input" placeholder="178" />
              <span class="unit-suffix">cm</span>
            </div>
            <div class="unit-toggle" style="margin-top: 12px">
              <button
                class="unit-btn"
                :class="{ active: heightUnit === 'ft' }"
                @click="heightUnit = 'ft'"
              >
                ft/in
              </button>
              <button
                class="unit-btn"
                :class="{ active: heightUnit === 'cm' }"
                @click="heightUnit = 'cm'"
              >
                cm
              </button>
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">Gender (for body fat calc)</label>
            <div class="gender-toggle">
              <button
                class="gender-btn"
                :class="{ active: gender === 'male' }"
                @click="gender = 'male'"
              >
                <q-icon name="male" size="20px" />
                <span>Male</span>
              </button>
              <button
                class="gender-btn"
                :class="{ active: gender === 'female' }"
                @click="gender = 'female'"
              >
                <q-icon name="female" size="20px" />
                <span>Female</span>
              </button>
            </div>
          </div>

          <button
            class="save-btn"
            :class="{ active: hasValidHeight }"
            :disabled="!hasValidHeight || isSaving"
            @click="saveProfile"
          >
            <q-icon v-if="isSaving" name="hourglass_empty" class="spinning" />
            <template v-else>Save Profile</template>
          </button>
        </div>

        <!-- History Section -->
        <div class="history-section" v-if="recentEntries.length > 0">
          <div class="section-header">
            <span class="section-label">Recent</span>
          </div>
          <div class="history-list">
            <div
              v-for="entry in recentEntries"
              :key="entry.id"
              class="history-item"
              @click="openEditDialog(entry)"
            >
              <div class="history-date">{{ formatDate(entry.date) }}</div>
              <div class="history-value">{{ formatWeight(entry.weight) }}</div>
              <q-icon name="edit" size="14px" class="edit-icon" />
            </div>
          </div>
        </div>
      </div>
    </q-pull-to-refresh>

    <!-- Edit Dialog -->
    <WeightEditDialog
      v-model="showEditDialog"
      :entry="selectedEntry"
      :default-unit="weightUnit"
      @save="handleSaveEntry"
      @delete="handleDeleteEntry"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { db, offlineOperations } from '../services/offline.js'
import { useWeightStore } from '../stores/weight.js'
import { useAuthStore } from '../stores/auth.js'
import WeightEditDialog from '../components/WeightEditDialog.vue'

const $q = useQuasar()
const weightStore = useWeightStore()
const authStore = useAuthStore()

// State
const activeTab = ref('weight')
const isSaving = ref(false)
const showEditDialog = ref(false)
const selectedEntry = ref(null)
const weightInput = ref('')
const weightUnit = ref('lbs')
const heightUnit = ref('ft')
const heightFeet = ref('')
const heightInches = ref('')
const heightCm = ref('')
const gender = ref('male')
const measurements = ref({
  waist: '',
  chest: '',
  neck: '',
  arms: '',
  thighs: '',
})
const profile = ref(null)
const bodyMeasurements = ref([])

// Computed
const latestWeight = computed(() => weightStore.latestWeight)
const displayWeight = computed(() => {
  if (!latestWeight.value) return '—'
  const w = latestWeight.value.weight
  if (weightUnit.value === 'lbs') {
    return `${(w * 2.20462).toFixed(1)} lbs`
  }
  return `${w.toFixed(1)} kg`
})

const latestMeasurements = computed(() => {
  if (bodyMeasurements.value.length === 0) return null
  return [...bodyMeasurements.value].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
})

const heightInCm = computed(() => {
  if (profile.value?.height) return profile.value.height
  if (heightUnit.value === 'ft') {
    const ft = parseFloat(heightFeet.value) || 0
    const inches = parseFloat(heightInches.value) || 0
    return (ft * 12 + inches) * 2.54
  }
  return parseFloat(heightCm.value) || 0
})

const hasValidHeight = computed(() => {
  if (heightUnit.value === 'ft') {
    return (parseFloat(heightFeet.value) || 0) > 0
  }
  return (parseFloat(heightCm.value) || 0) > 0
})

const hasAnyMeasurement = computed(() => {
  return Object.values(measurements.value).some((v) => parseFloat(v) > 0)
})

// BMI Calculation
const bmi = computed(() => {
  if (!latestWeight.value || !heightInCm.value) return 0
  const weightKg = latestWeight.value.weight
  const heightM = heightInCm.value / 100
  return weightKg / (heightM * heightM)
})

const bmiCircumference = 2 * Math.PI * 52
const bmiOffset = computed(() => {
  // Map BMI 15-40 to 0-100%
  const normalizedBmi = Math.min(Math.max(bmi.value, 15), 40)
  const progress = (normalizedBmi - 15) / 25
  return bmiCircumference * (1 - progress)
})

const bmiCategory = computed(() => {
  const b = bmi.value
  if (b < 18.5) return { label: 'Underweight', range: '< 18.5', class: 'bmi-under' }
  if (b < 25) return { label: 'Normal', range: '18.5 - 24.9', class: 'bmi-normal' }
  if (b < 30) return { label: 'Overweight', range: '25 - 29.9', class: 'bmi-over' }
  return { label: 'Obese', range: '30+', class: 'bmi-obese' }
})

// Body Fat Calculation (Navy Method)
const bodyFat = computed(() => {
  if (!latestMeasurements.value || !heightInCm.value) return 0
  const waist = parseFloat(latestMeasurements.value.waist) || 0
  const neck = parseFloat(latestMeasurements.value.neck) || 0
  if (!waist || !neck) return 0

  const heightIn = heightInCm.value / 2.54

  if (gender.value === 'male') {
    // Men: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
    if (waist <= neck) return 0
    const bf =
      495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(heightIn)) - 450
    return Math.max(0, bf)
  } else {
    // Women need hip measurement too - simplified without hip
    // Using approximation
    if (waist <= neck) return 0
    const bf =
      495 / (1.29579 - 0.35004 * Math.log10(waist + 0 - neck) + 0.221 * Math.log10(heightIn)) - 450
    return Math.max(0, bf)
  }
})

const recentEntries = computed(() => {
  return [...weightStore.entries].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
})

// Methods
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function formatWeight(weightKg) {
  if (weightUnit.value === 'lbs') {
    return `${(weightKg * 2.20462).toFixed(1)} lbs`
  }
  return `${weightKg.toFixed(1)} kg`
}

async function saveWeight() {
  if (!weightInput.value) return
  isSaving.value = true
  try {
    await weightStore.addWeightEntry(weightInput.value, null, weightUnit.value)
    weightInput.value = ''
    $q.notify({
      message: 'Weight saved',
      color: 'positive',
      position: 'top',
      timeout: 1500,
    })
  } catch {
    $q.notify({
      message: 'Failed to save',
      color: 'negative',
      position: 'top',
    })
  } finally {
    isSaving.value = false
  }
}

async function saveMeasurements() {
  if (!hasAnyMeasurement.value) return
  isSaving.value = true
  try {
    const data = {
      user_id: authStore.userId,
      date: new Date().toISOString(),
      waist: parseFloat(measurements.value.waist) || null,
      chest: parseFloat(measurements.value.chest) || null,
      neck: parseFloat(measurements.value.neck) || null,
      arms: parseFloat(measurements.value.arms) || null,
      thighs: parseFloat(measurements.value.thighs) || null,
    }
    await offlineOperations.addToOffline('body_measurements', data)
    await loadMeasurements()

    // Clear form
    measurements.value = { waist: '', chest: '', neck: '', arms: '', thighs: '' }

    $q.notify({
      message: 'Measurements saved',
      color: 'positive',
      position: 'top',
      timeout: 1500,
    })
  } catch {
    $q.notify({
      message: 'Failed to save',
      color: 'negative',
      position: 'top',
    })
  } finally {
    isSaving.value = false
  }
}

async function saveProfile() {
  if (!hasValidHeight.value) return
  isSaving.value = true
  try {
    const heightValue = heightInCm.value
    const data = {
      user_id: authStore.userId,
      height: heightValue,
      height_unit: heightUnit.value,
      gender: gender.value,
    }

    // Check if profile exists
    const existing = await db.user_profile.where('user_id').equals(authStore.userId).first()
    if (existing) {
      await db.user_profile.update(existing.id, data)
    } else {
      await db.user_profile.add(data)
    }

    profile.value = data

    $q.notify({
      message: 'Profile saved',
      color: 'positive',
      position: 'top',
      timeout: 1500,
    })
  } catch {
    $q.notify({
      message: 'Failed to save',
      color: 'negative',
      position: 'top',
    })
  } finally {
    isSaving.value = false
  }
}

function openEditDialog(entry) {
  selectedEntry.value = entry
  showEditDialog.value = true
}

async function handleSaveEntry(data) {
  try {
    await weightStore.updateWeightEntry(data.id, {
      weight: data.weight,
      date: data.date,
    })
    $q.notify({
      message: 'Weight updated',
      color: 'positive',
      position: 'top',
      timeout: 1500,
    })
  } catch {
    $q.notify({
      message: 'Failed to update',
      color: 'negative',
      position: 'top',
    })
  }
}

async function handleDeleteEntry(id) {
  try {
    await weightStore.deleteWeightEntry(id)
    $q.notify({
      message: 'Entry deleted',
      color: 'grey-8',
      position: 'top',
      timeout: 1500,
    })
  } catch {
    $q.notify({
      message: 'Failed to delete',
      color: 'negative',
      position: 'top',
    })
  }
}

async function loadProfile() {
  try {
    const p = await db.user_profile.where('user_id').equals(authStore.userId).first()
    if (p) {
      profile.value = p
      gender.value = p.gender || 'male'
      if (p.height_unit === 'cm') {
        heightUnit.value = 'cm'
        heightCm.value = p.height
      } else {
        heightUnit.value = 'ft'
        const totalInches = p.height / 2.54
        heightFeet.value = Math.floor(totalInches / 12)
        heightInches.value = Math.round(totalInches % 12)
      }
    }
  } catch {
    // Profile doesn't exist yet
  }
}

async function loadMeasurements() {
  try {
    bodyMeasurements.value = await db.body_measurements
      .where('user_id')
      .equals(authStore.userId)
      .toArray()
  } catch {
    bodyMeasurements.value = []
  }
}

async function onRefresh(done) {
  await weightStore.loadWeightEntries()
  await loadProfile()
  await loadMeasurements()
  done()
}

onMounted(async () => {
  await weightStore.loadWeightEntries()
  await loadProfile()
  await loadMeasurements()
})
</script>

<style scoped>
.weight-page {
  min-height: 100vh;
  padding: 0;
  padding-bottom: env(safe-area-inset-bottom, 80px);
}

.weight-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px 16px;
  padding-bottom: 100px;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.page-title {
  display: block;
  font-size: 24px;
  font-weight: 700;
}

.page-subtitle {
  font-size: 14px;
  opacity: 0.5;
}

/* BMI Card */
.bmi-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border-radius: 20px;
  margin-bottom: 20px;
}

.body--light .bmi-card {
  background: rgba(255, 255, 255, 0.8);
}

.body--dark .bmi-card {
  background: rgba(255, 255, 255, 0.05);
}

.bmi-ring-container {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}

.bmi-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.bmi-bg {
  stroke: rgba(0, 0, 0, 0.06);
}

.body--dark .bmi-bg {
  stroke: rgba(255, 255, 255, 0.1);
}

.bmi-bar {
  transition: stroke-dashoffset 0.5s ease;
}

.bmi-bar.bmi-under {
  stroke: #3498db;
}
.bmi-bar.bmi-normal {
  stroke: #2ecc71;
}
.bmi-bar.bmi-over {
  stroke: #f39c12;
}
.bmi-bar.bmi-obese {
  stroke: #e74c3c;
}

.bmi-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.bmi-value {
  font-size: 24px;
  font-weight: 700;
}

.bmi-label {
  font-size: 11px;
  opacity: 0.5;
  text-transform: uppercase;
}

.bmi-info {
  flex: 1;
}

.bmi-category {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.bmi-category.bmi-under {
  color: #3498db;
}
.bmi-category.bmi-normal {
  color: #2ecc71;
}
.bmi-category.bmi-over {
  color: #f39c12;
}
.bmi-category.bmi-obese {
  color: #e74c3c;
}

.bmi-range {
  font-size: 13px;
  opacity: 0.5;
}

/* Setup Card */
.setup-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px;
  border-radius: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.body--light .setup-card {
  background: rgba(79, 124, 255, 0.08);
}

.body--dark .setup-card {
  background: rgba(79, 124, 255, 0.15);
}

.setup-icon {
  opacity: 0.5;
}

.setup-text {
  font-size: 14px;
  opacity: 0.7;
}

/* Stats Row */
.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 16px 12px;
  border-radius: 16px;
}

.body--light .stat-item {
  background: rgba(0, 0, 0, 0.03);
}

.body--dark .stat-item {
  background: rgba(255, 255, 255, 0.05);
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
}

.stat-label {
  font-size: 11px;
  opacity: 0.5;
  margin-top: 4px;
}

/* Entry Tabs */
.entry-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.body--light .tab-btn {
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.5);
}

.body--dark .tab-btn {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.5);
}

.tab-btn.active {
  background: var(--q-primary);
  color: white;
}

/* Entry Card */
.entry-card {
  padding: 20px;
  border-radius: 20px;
  margin-bottom: 20px;
}

.body--light .entry-card {
  background: rgba(255, 255, 255, 0.9);
}

.body--dark .entry-card {
  background: rgba(255, 255, 255, 0.05);
}

.input-group {
  margin-bottom: 16px;
}

.input-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.5;
  margin-bottom: 8px;
}

.input-row {
  display: flex;
  gap: 12px;
}

.num-input {
  flex: 1;
  padding: 14px 16px;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  width: 100%;
}

.body--light .num-input {
  background: rgba(0, 0, 0, 0.04);
  color: inherit;
}

.body--dark .num-input {
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
}

.num-input::placeholder {
  opacity: 0.3;
}

.num-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--q-primary);
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.unit-suffix {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.5;
}

.unit-toggle {
  display: flex;
  gap: 4px;
}

.unit-btn {
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.body--light .unit-btn {
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.5);
}

.body--dark .unit-btn {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.5);
}

.unit-btn.active {
  background: var(--q-primary);
  color: white;
}

.height-inputs {
  display: flex;
  gap: 12px;
}

.gender-toggle {
  display: flex;
  gap: 12px;
}

.gender-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.body--light .gender-btn {
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.5);
}

.body--dark .gender-btn {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.5);
}

.gender-btn.active {
  background: var(--q-primary);
  color: white;
}

.measurements-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.measurements-grid .input-group {
  margin-bottom: 0;
}

.measurements-grid .full-width {
  grid-column: span 2;
}

.save-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(79, 124, 255, 0.15);
  color: rgba(79, 124, 255, 0.5);
  margin-top: 8px;
}

.save-btn.active {
  background: var(--q-primary);
  color: white;
  box-shadow: 0 8px 24px rgba(79, 124, 255, 0.35);
}

.save-btn:disabled {
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* History Section */
.history-section {
  margin-top: 8px;
}

.section-header {
  margin-bottom: 12px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.5;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-radius: 14px;
}

.body--light .history-item {
  background: rgba(0, 0, 0, 0.03);
}

.body--dark .history-item {
  background: rgba(255, 255, 255, 0.05);
}

.history-date {
  font-size: 14px;
  opacity: 0.5;
  flex: 1;
}

.history-value {
  font-size: 16px;
  font-weight: 600;
}

.history-item {
  cursor: pointer;
  transition: all 0.15s ease;
}

.history-item:active {
  transform: scale(0.98);
}

.edit-icon {
  opacity: 0.3;
  margin-left: auto;
}

.history-item:hover .edit-icon,
.history-item:active .edit-icon {
  opacity: 0.6;
}

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .weight-container {
    padding-bottom: calc(100px + env(safe-area-inset-bottom));
  }
}
</style>
