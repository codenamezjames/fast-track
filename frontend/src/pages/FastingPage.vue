<template>
  <q-page class="fit q-pa-md">
    <div class="q-mx-auto" style="max-width: 560px">
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">Intermittent Fasting</div>
          <FastingTimer />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import FastingTimer from '../components/FastingTimer.vue'
</script>

<style scoped>
</style>
