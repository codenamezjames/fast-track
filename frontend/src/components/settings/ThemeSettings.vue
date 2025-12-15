<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 q-mb-md">Appearance</div>

      <!-- Theme Mode -->
      <div class="setting-item">
        <div class="setting-label">
          <q-icon :name="themeStore.themeIcon" size="20px" color="primary" />
          <span>Theme</span>
        </div>
        <div class="setting-control">
          <q-btn-toggle
            v-model="currentMode"
            :options="themeOptions"
            no-caps
            rounded
            unelevated
            toggle-color="primary"
            color="grey-3"
            text-color="grey-7"
            @update:model-value="setTheme"
          />
        </div>
      </div>

      <!-- Current Theme Info -->
      <div class="theme-preview q-mt-md">
        <div class="preview-box" :class="{ 'preview-dark': themeStore.isDark }">
          <q-icon :name="themeStore.isDark ? 'dark_mode' : 'light_mode'" size="24px" />
          <span>{{ themeStore.isDark ? 'Dark Mode Active' : 'Light Mode Active' }}</span>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useThemeStore } from '../../stores/theme.js'

const themeStore = useThemeStore()

const currentMode = ref('auto')

const themeOptions = [
  { label: 'Auto', value: 'auto', icon: 'brightness_auto' },
  { label: 'Light', value: 'light', icon: 'light_mode' },
  { label: 'Dark', value: 'dark', icon: 'dark_mode' },
]

onMounted(() => {
  currentMode.value = themeStore.mode
})

watch(
  () => themeStore.mode,
  (val) => {
    currentMode.value = val
  },
)

const setTheme = (mode) => {
  themeStore.setMode(mode)
}
</script>

<style scoped>
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
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

.theme-preview {
  display: flex;
  justify-content: center;
}

.preview-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.04);
  color: inherit;
  font-weight: 500;
  transition: all 0.2s ease;
}

.preview-box.preview-dark {
  background: rgba(255, 255, 255, 0.08);
}
</style>
