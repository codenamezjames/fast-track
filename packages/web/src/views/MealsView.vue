<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { Utensils } from 'lucide-vue-next'
</script>

<template>
  <MainLayout>
    <EmptyState
      :icon="Utensils"
      title="Meals"
      description="Meal tracking coming soon!"
    />
  </MainLayout>
</template>
