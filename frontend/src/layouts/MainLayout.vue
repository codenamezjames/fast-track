<template>
  <q-layout view="lHh Lpr lFf" class="fit">
    <!-- Offline Indicator -->
    <OfflineIndicator />

    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          round
          dense
          icon="menu"
          class="q-mr-sm"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-toolbar-title class="text-left"> FastTrack </q-toolbar-title>
        <q-space />
        <q-btn flat round icon="logout" @click="logout" size="sm" />
      </q-toolbar>
      <q-separator dark inset />
    </q-header>

    <!-- Left Navigation (Desktop) -->
    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      :width="220"
      bordered
      behavior="mobile"
    >
      <q-list separator>
        <q-item clickable v-ripple to="/app/logging/calories" exact>
          <q-item-section avatar>
            <q-icon name="bolt" />
          </q-item-section>
          <q-item-section>Calories</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/app/logging/weight" exact>
          <q-item-section avatar>
            <q-icon name="monitor_weight" />
          </q-item-section>
          <q-item-section>Weight</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/app/fasting" exact>
          <q-item-section avatar>
            <q-icon name="schedule" />
          </q-item-section>
          <q-item-section>Fasting</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/app/analytics" exact>
          <q-item-section avatar>
            <q-icon name="insights" />
          </q-item-section>
          <q-item-section>Analytics</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/app/settings" exact>
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>Settings</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- PWA Install Prompt -->
    <PwaInstallPrompt />

    <!-- Bottom Navigation Tabs -->
    <q-footer elevated class="lt-md">
      <q-tabs v-model="currentTab" dense align="justify">
        <q-tab name="calories" icon="bolt" label="Calories" @click="navigateTo('calories')" />
        <q-tab name="weight" icon="monitor_weight" label="Weight" @click="navigateTo('weight')" />
        <q-tab name="fasting" icon="schedule" label="Fasting" @click="navigateTo('fasting')" />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useThemeStore } from '../stores/theme.js'
import OfflineIndicator from '../components/OfflineIndicator.vue'
import PwaInstallPrompt from '../components/PwaInstallPrompt.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const currentTab = ref('logging')
const leftDrawerOpen = ref(false)

// Update tab based on current route
watch(
  () => route.path,
  (newPath) => {
    if (newPath.includes('fasting')) {
      currentTab.value = 'fasting'
    } else if (newPath.includes('analytics')) {
      currentTab.value = 'analytics'
    } else if (newPath.includes('settings')) {
      currentTab.value = 'settings'
    } else if (newPath.includes('logging') || newPath.includes('calories')) {
      currentTab.value = 'logging'
    } else {
      currentTab.value = 'logging'
    }
  },
  { immediate: true },
)

// Initialize theme system
onMounted(() => {
  try {
    themeStore.init()
  } catch {
    // Theme init error
  }
})

const navigateTo = (path) => {
  router.push(path)
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* Let Quasar handle all theming automatically */
</style>
