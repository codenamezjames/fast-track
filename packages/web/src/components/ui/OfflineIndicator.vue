<script setup lang="ts">
import { WifiOff } from 'lucide-vue-next'
import { usePwa } from '@/composables/usePwa'

const { isOnline } = usePwa()
</script>

<template>
  <Transition name="slide-down">
    <div v-if="!isOnline" class="offline-indicator">
      <WifiOff :size="16" />
      <span>You're offline</span>
    </div>
  </Transition>
</template>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #f59e0b;
  color: #78350f;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Slide down animation */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
