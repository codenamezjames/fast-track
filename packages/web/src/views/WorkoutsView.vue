<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { Dumbbell } from 'lucide-vue-next'
</script>

<template>
  <MainLayout>
    <EmptyState
      :icon="Dumbbell"
      title="Workouts"
      description="Workout tracking coming soon!"
    />
  </MainLayout>
</template>
