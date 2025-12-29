<script setup lang="ts">
import { RouterView } from 'vue-router'
import PwaInstallPrompt from './components/ui/PwaInstallPrompt.vue'
import OfflineIndicator from './components/ui/OfflineIndicator.vue'
</script>

<template>
  <div id="app">
    <OfflineIndicator />
    <RouterView />
    <PwaInstallPrompt />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  background: var(--color-background);
}
</style>
