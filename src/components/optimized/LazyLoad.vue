<template>
  <div ref="container" class="lazy-load-container">
    <!-- Loading placeholder -->
    <div v-if="!isVisible && !isLoaded" class="lazy-placeholder">
      <q-skeleton v-if="showSkeleton" :type="skeletonType" />
      <div v-else class="text-center q-pa-md">
        <q-spinner-dots size="24px" color="primary" />
        <div class="text-caption q-mt-sm">Loading...</div>
      </div>
    </div>

    <!-- Actual content -->
    <div v-show="isVisible || isLoaded" class="lazy-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  threshold: {
    type: Number,
    default: 0.1,
  },
  rootMargin: {
    type: String,
    default: '50px',
  },
  showSkeleton: {
    type: Boolean,
    default: true,
  },
  skeletonType: {
    type: String,
    default: 'text',
  },
  immediate: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['visible', 'loaded'])

// Refs
const container = ref(null)
const isVisible = ref(false)
const isLoaded = ref(false)
let observer = null

// Methods
const handleIntersection = (entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      isVisible.value = true
      emit('visible')

      // Mark as loaded after a short delay
      setTimeout(() => {
        isLoaded.value = true
        emit('loaded')
      }, 100)

      // Disconnect observer after first intersection
      if (observer) {
        observer.disconnect()
      }
    }
  })
}

// Lifecycle
onMounted(() => {
  if (props.immediate) {
    isVisible.value = true
    isLoaded.value = true
    emit('visible')
    emit('loaded')
    return
  }

  if ('IntersectionObserver' in window && container.value) {
    observer = new IntersectionObserver(handleIntersection, {
      threshold: props.threshold,
      rootMargin: props.rootMargin,
    })

    observer.observe(container.value)
  } else {
    // Fallback for older browsers
    isVisible.value = true
    isLoaded.value = true
    emit('visible')
    emit('loaded')
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.lazy-load-container {
  position: relative;
  min-height: 100px;
}

.lazy-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
}

.lazy-content {
  width: 100%;
}
</style>
