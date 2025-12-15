<template>
  <q-page class="fasting-page">
    <q-pull-to-refresh @refresh="onRefresh">
      <div class="fasting-container">
        <!-- Hero Section with Timer -->
        <div class="hero-section">
          <div class="hero-top">
            <span class="status-text">{{ statusText }}</span>
            <span class="fast-type" v-if="fastingStore.isFasting">{{ fastTypeLabel }}</span>
          </div>

          <div class="timer-ring">
            <svg class="progress-ring" viewBox="0 0 100 100">
              <circle class="progress-bg" cx="50" cy="50" r="42" fill="none" stroke-width="6" />
              <circle
                v-if="fastingStore.isFasting"
                class="progress-bar"
                :class="{ overtime: isOvertime }"
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke-width="6"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="progressOffset"
                stroke-linecap="round"
              />
            </svg>
            <div class="ring-content">
              <div class="ring-value">{{ timeDisplay }}</div>
              <div class="ring-label">
                {{ fastingStore.isFasting ? (isOvertime ? 'overtime' : 'remaining') : 'ready' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Status Bar -->
        <div class="status-bar" :class="statusClass">
          <q-icon :name="statusIcon" size="16px" />
          <span>{{ statusMessage }}</span>
        </div>

        <!-- Stats Row -->
        <div class="stats-row" v-if="fastingStore.fastingStreak > 0 || totalFasts > 0">
          <div class="stat-item" v-if="fastingStore.fastingStreak > 0">
            <q-icon name="local_fire_department" size="16px" class="streak-icon" />
            <span class="stat-value">{{ fastingStore.fastingStreak }}</span>
            <span class="stat-label">day streak</span>
          </div>
          <div class="stat-item" v-if="totalFasts > 0">
            <span class="stat-value">{{ totalFasts }}</span>
            <span class="stat-label">total fasts</span>
          </div>
          <div class="stat-item" v-if="avgDuration > 0">
            <span class="stat-value">{{ avgDuration }}h</span>
            <span class="stat-label">avg duration</span>
          </div>
        </div>

        <!-- Quick Start / Stop Section -->
        <div class="action-section">
          <template v-if="!fastingStore.isFasting">
            <div class="section-label">Quick Start</div>
            <div class="quick-chips">
              <button
                v-for="preset in fastPresets"
                :key="preset.hours"
                class="quick-chip"
                :class="{ popular: preset.popular }"
                @click="startFast(preset.hours)"
              >
                <span class="chip-hours">{{ preset.hours }}h</span>
                <span class="chip-label">{{ preset.label }}</span>
              </button>
            </div>
          </template>

          <template v-else>
            <button class="stop-btn" @click="confirmStopFast">
              <q-icon name="stop" size="20px" />
              <span>End Fast</span>
            </button>
          </template>
        </div>

        <!-- Recent Fasts -->
        <div class="history-section">
          <div class="history-header">
            <span>Recent</span>
            <button class="add-past-btn" @click="openAddDialog">
              <q-icon name="add" size="14px" />
              <span>Log Past</span>
            </button>
          </div>
          <div class="history-scroll" v-if="recentFasts.length > 0">
            <div
              v-for="fast in recentFasts"
              :key="fast.id"
              class="history-item"
              @click="openEditDialog(fast)"
            >
              <div class="history-date">{{ formatDate(fast.start_time) }}</div>
              <div class="history-duration">{{ formatDuration(fast.actual_duration) }}</div>
              <q-icon
                :name="fast.actual_duration >= fast.planned_duration ? 'check_circle' : 'cancel'"
                :color="fast.actual_duration >= fast.planned_duration ? 'positive' : 'grey'"
                size="16px"
              />
              <q-icon name="edit" size="12px" class="edit-icon" />
            </div>
          </div>
        </div>
      </div>
    </q-pull-to-refresh>

    <!-- Edit Dialog -->
    <FastingEditDialog
      v-model="showEditDialog"
      :session="selectedSession"
      @save="handleSaveSession"
      @delete="handleDeleteSession"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useFastingStore } from '../stores/fasting.js'
import FastingEditDialog from '../components/FastingEditDialog.vue'

const $q = useQuasar()
const fastingStore = useFastingStore()

// Edit dialog state
const showEditDialog = ref(false)
const selectedSession = ref(null)

// Presets
const fastPresets = [
  { hours: 12, label: '12:12', popular: false },
  { hours: 16, label: '16:8', popular: true },
  { hours: 18, label: '18:6', popular: false },
  { hours: 24, label: 'OMAD', popular: false },
]

// Progress ring
const circumference = 2 * Math.PI * 42

const progressOffset = computed(() => {
  if (!fastingStore.isFasting) return circumference
  const progress = Math.min(fastingStore.fastingProgress / 100, 1)
  return circumference * (1 - progress)
})

const isOvertime = computed(() => {
  return fastingStore.fastingProgress > 100
})

// Time display
const timeDisplay = computed(() => {
  if (!fastingStore.isFasting) return '00:00'

  const remaining = fastingStore.fastingTimeRemaining
  const absRemaining = Math.abs(remaining)
  const hours = Math.floor(absRemaining / (1000 * 60 * 60))
  const minutes = Math.floor((absRemaining % (1000 * 60 * 60)) / (1000 * 60))

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
})

// Status
const statusText = computed(() => {
  if (fastingStore.isFasting) {
    return isOvertime.value ? 'Fasting Complete!' : 'Currently Fasting'
  }
  return 'Not Fasting'
})

const fastTypeLabel = computed(() => {
  const duration = fastingStore.currentSession?.planned_duration
  if (!duration) return ''
  const preset = fastPresets.find((p) => p.hours === duration)
  return preset ? preset.label : `${duration}h`
})

const statusClass = computed(() => {
  if (!fastingStore.isFasting) return 'status-idle'
  if (isOvertime.value) return 'status-complete'
  return 'status-active'
})

const statusIcon = computed(() => {
  if (!fastingStore.isFasting) return 'schedule'
  if (isOvertime.value) return 'celebration'
  return 'local_fire_department'
})

const statusMessage = computed(() => {
  if (!fastingStore.isFasting) return 'Start a fast to begin tracking'
  if (isOvertime.value) {
    const overtime = Math.abs(fastingStore.fastingTimeRemaining)
    const hours = Math.floor(overtime / (1000 * 60 * 60))
    const minutes = Math.floor((overtime % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m overtime - great job!`
  }
  const progress = Math.round(fastingStore.fastingProgress)
  return `${progress}% complete`
})

// Recent fasts
const recentFasts = computed(() => {
  return fastingStore.sessions
    .filter((s) => s.end_time)
    .sort((a, b) => new Date(b.end_time) - new Date(a.end_time))
    .slice(0, 5)
})

// Stats
const totalFasts = computed(() => {
  return fastingStore.sessions.filter((s) => s.status === 'completed').length
})

const avgDuration = computed(() => {
  const completed = fastingStore.sessions.filter(
    (s) => s.status === 'completed' && s.actual_duration,
  )
  if (completed.length === 0) return 0
  const total = completed.reduce((sum, s) => sum + s.actual_duration, 0)
  return Math.round(total / completed.length)
})

// Methods
function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDuration(hours) {
  if (!hours) return '0h'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

async function startFast(hours) {
  try {
    await fastingStore.startFast(hours)
    $q.notify({
      message: `Started ${hours}h fast`,
      color: 'positive',
      position: 'top',
      timeout: 1500,
    })
  } catch {
    $q.notify({
      message: 'Failed to start fast',
      color: 'negative',
      position: 'top',
    })
  }
}

function confirmStopFast() {
  $q.dialog({
    title: 'End Fast?',
    message: isOvertime.value
      ? 'Great job completing your fast!'
      : 'Are you sure you want to end your fast early?',
    cancel: !isOvertime.value,
    ok: {
      label: 'End Fast',
      color: isOvertime.value ? 'positive' : 'negative',
    },
  }).onOk(async () => {
    try {
      const result = await fastingStore.endFast()
      if (result?.cancelled) {
        $q.notify({
          message: 'Fast cancelled',
          color: 'grey-8',
          position: 'top',
          timeout: 1500,
        })
      } else {
        $q.notify({
          message: 'Fast ended',
          color: 'positive',
          position: 'top',
          timeout: 1500,
        })
      }
    } catch {
      $q.notify({
        message: 'Failed to end fast',
        color: 'negative',
        position: 'top',
      })
    }
  })
}

function openEditDialog(session) {
  selectedSession.value = session
  showEditDialog.value = true
}

function openAddDialog() {
  selectedSession.value = null
  showEditDialog.value = true
}

async function handleSaveSession(data) {
  try {
    if (data.id) {
      // Update existing session
      await fastingStore.updateSession(data.id, data)
      $q.notify({
        message: 'Fast updated',
        color: 'positive',
        position: 'top',
        timeout: 1500,
      })
    } else {
      // Add new completed session
      await fastingStore.addCompletedSession(data)
      $q.notify({
        message: 'Fast logged',
        color: 'positive',
        position: 'top',
        timeout: 1500,
      })
    }
  } catch {
    $q.notify({
      message: 'Failed to save',
      color: 'negative',
      position: 'top',
    })
  }
}

async function handleDeleteSession(id) {
  try {
    await fastingStore.deleteSession(id)
    $q.notify({
      message: 'Fast deleted',
      color: 'grey-8',
      position: 'top',
      timeout: 1500,
    })
  } catch (error) {
    $q.notify({
      message: error.message || 'Failed to delete',
      color: 'negative',
      position: 'top',
    })
  }
}

async function onRefresh(done) {
  await fastingStore.loadFastingData()
  done()
}

onMounted(async () => {
  await fastingStore.loadFastingData()
})

onUnmounted(() => {
  fastingStore.stopTimer()
})
</script>

<style scoped>
.fasting-page {
  display: flex;
  flex-direction: column;
  padding: 0 !important;
  min-height: 100%;
}

.fasting-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  padding: 16px;
  padding-bottom: 12px;
  gap: 16px;
  box-sizing: border-box;
  overflow: hidden;
}

/* Hero Section */
.hero-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  min-height: 0;
}

.hero-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.status-text {
  font-size: 13px;
  opacity: 0.5;
}

.fast-type {
  font-size: 20px;
  font-weight: 700;
  color: var(--q-primary);
}

.timer-ring {
  position: relative;
  width: 160px;
  height: 160px;
  flex-shrink: 0;
}

.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-bg {
  stroke: rgba(0, 0, 0, 0.06);
}

.body--dark .progress-bg {
  stroke: rgba(255, 255, 255, 0.1);
}

.progress-bar {
  stroke: var(--q-primary);
  transition: stroke-dashoffset 0.4s ease;
  filter: drop-shadow(0 0 6px rgba(79, 124, 255, 0.4));
}

.progress-bar.overtime {
  stroke: var(--q-positive);
  filter: drop-shadow(0 0 6px rgba(33, 186, 69, 0.4));
}

.ring-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  line-height: 1.1;
}

.ring-value {
  font-size: 36px;
  font-weight: 700;
}

.ring-label {
  font-size: 13px;
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Status Bar */
.status-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  flex-shrink: 0;
}

.status-bar.status-idle {
  background: rgba(0, 0, 0, 0.04);
  color: inherit;
  opacity: 0.6;
}

.body--dark .status-bar.status-idle {
  background: rgba(255, 255, 255, 0.06);
}

.status-bar.status-active {
  background: rgba(79, 124, 255, 0.1);
  color: var(--q-primary);
}

.status-bar.status-complete {
  background: rgba(33, 186, 69, 0.1);
  color: var(--q-positive);
}

/* Stats Row */
.stats-row {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 8px 0;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.streak-icon {
  color: #ff9800;
}

.stat-value {
  font-weight: 700;
  color: var(--q-primary);
}

.stat-label {
  opacity: 0.5;
}

/* Action Section */
.action-section {
  flex-shrink: 0;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.5;
  margin-bottom: 10px;
  text-align: center;
}

.quick-chips {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.quick-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 8px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.body--light .quick-chip {
  background: rgba(0, 0, 0, 0.04);
  color: inherit;
}

.body--dark .quick-chip {
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
}

.quick-chip.popular {
  background: rgba(79, 124, 255, 0.1);
}

.body--dark .quick-chip.popular {
  background: rgba(79, 124, 255, 0.2);
}

.quick-chip:active {
  transform: scale(0.95);
}

.chip-hours {
  font-size: 18px;
  font-weight: 700;
}

.quick-chip.popular .chip-hours {
  color: var(--q-primary);
}

.chip-label {
  font-size: 11px;
  opacity: 0.6;
  margin-top: 2px;
}

.stop-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  background: rgba(255, 77, 79, 0.1);
  color: var(--q-negative);
  transition: all 0.15s ease;
}

.stop-btn:active {
  transform: scale(0.98);
  background: rgba(255, 77, 79, 0.2);
}

/* History Section */
.history-section {
  flex: 1;
  min-height: 0;
  max-height: 200px;
  display: flex;
  flex-direction: column;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.5;
  margin-bottom: 6px;
}

.add-past-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  opacity: 1;
  text-transform: none;
  letter-spacing: normal;
  background: rgba(79, 124, 255, 0.1);
  color: var(--q-primary);
  transition: all 0.15s ease;
}

.add-past-btn:active {
  transform: scale(0.95);
  background: rgba(79, 124, 255, 0.2);
}

.history-scroll {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 12px;
}

.body--light .history-item {
  background: rgba(0, 0, 0, 0.03);
}

.body--dark .history-item {
  background: rgba(255, 255, 255, 0.05);
}

.history-date {
  flex: 1;
  opacity: 0.6;
}

.history-duration {
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
</style>
