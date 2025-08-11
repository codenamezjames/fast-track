<template>
  <q-page class="dashboard-page fit">
    <div class="dashboard-container">
      <!-- Intermittent Fasting Section -->
      <div class="dashboard-section">
        <h2 class="section-title">Intermittent Fasting</h2>
        <FastingTimer />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import FastingTimer from '../components/FastingTimer.vue'
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  padding: 24px 20px;
}

.dashboard-container {
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Use Quasar spacing classes instead */

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 20px 0;
}
</style>
