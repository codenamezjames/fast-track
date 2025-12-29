<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { Activity } from 'lucide-vue-next'
</script>

<template>
  <MainLayout>
    <EmptyState
      :icon="Activity"
      title="Activity"
      description="Activity tracking coming soon!"
    />
  </MainLayout>
</template>
