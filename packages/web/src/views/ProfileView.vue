<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { User } from 'lucide-vue-next'
</script>

<template>
  <MainLayout>
    <EmptyState
      :icon="User"
      title="Profile"
      description="Profile settings coming soon!"
    />
  </MainLayout>
</template>
