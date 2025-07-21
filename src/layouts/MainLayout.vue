<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title class="text-center">
          FastTrack
        </q-toolbar-title>
        
        <!-- Logout Button -->
        <q-btn 
          flat 
          round 
          icon="logout" 
          @click="logout"
          size="sm"
        />
      </q-toolbar>
    </q-header>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Bottom Navigation Tabs -->
    <q-footer class="bg-white">
      <q-tabs
        v-model="currentTab"
        dense
        class="text-grey-6"
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-tab 
          name="calories" 
          icon="restaurant" 
          label="Calories"
          @click="navigateTo('/calories')"
        />
        
        <q-tab 
          name="fasting" 
          icon="schedule" 
          label="Fasting"
          @click="navigateTo('/fasting')"
        />
        
        <q-tab 
          name="settings" 
          icon="settings" 
          label="Settings"
          @click="navigateTo('/settings')"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const currentTab = ref('calories')

// Update tab based on current route
watch(() => route.path, (newPath) => {
  if (newPath.includes('fasting')) {
    currentTab.value = 'fasting'
  } else if (newPath.includes('settings')) {
    currentTab.value = 'settings'
  } else {
    currentTab.value = 'calories'
  }
}, { immediate: true })

const navigateTo = (path) => {
  router.push(path)
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.q-footer {
  border-top: 1px solid #e0e0e0;
}
</style>
