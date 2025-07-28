<template>
  <q-layout view="hHh lpR fFf" class="fit">
    <!-- Offline Indicator -->
    <OfflineIndicator />

    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title class="text-left"> FastTrack </q-toolbar-title>

        <!-- Logout Button -->
        <q-btn flat round icon="logout" @click="logout" size="sm" />
      </q-toolbar>
    </q-header>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- PWA Install Prompt -->
    <PwaInstallPrompt />

    <!-- Bottom Navigation Tabs -->
    <q-footer elevated>
      <q-tabs v-model="currentTab" dense align="justify">
        <q-tab name="logging" icon="restaurant" label="Logging" @click="navigateTo('/logging')" />

        <q-tab name="fasting" icon="schedule" label="Fasting" @click="navigateTo('/fasting')" />

        <q-tab
          name="analytics"
          icon="insights"
          label="Analytics"
          @click="navigateTo('/analytics')"
        />

        <q-tab name="settings" icon="settings" label="Settings" @click="navigateTo('/settings')" />
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
    console.log('Theme initialized from MainLayout')
  } catch (error) {
    console.error('Theme init error:', error)
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
