<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue'
import FastingTimer from '@/components/fasting/FastingTimer.vue'
</script>

<template>
  <MainLayout>
    <div class="fasting-view">
      <FastingTimer />
    </div>
  </MainLayout>
</template>

<style scoped>
.fasting-view {
  max-width: 600px;
  margin: 0 auto;
}
</style>
