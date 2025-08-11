<template>
  <div class="optimized-virtual-list">
    <!-- Loading state -->
    <div v-if="isLoading" class="loading-state">
      <q-spinner-dots size="24px" color="primary" />
      <div class="text-caption q-mt-sm">Loading...</div>
    </div>

    <!-- Virtual scroll list -->
    <q-virtual-scroll
      v-else
      :items="items"
      :item-size="itemHeight"
      :virtual-scroll-horizontal="false"
      :virtual-scroll-item-size="itemHeight"
      :virtual-scroll-sticky-size-start="0"
      :virtual-scroll-sticky-size-end="0"
      @virtual-scroll="onVirtualScroll"
      class="virtual-scroll-container"
      :style="{ height: containerHeight + 'px' }"
    >
      <template v-slot="{ item, index }">
        <div class="virtual-item">
          <slot :item="item" :index="index" :isVisible="true" />
        </div>
      </template>
    </q-virtual-scroll>

    <!-- Load more indicator -->
    <div v-if="hasMore && !isLoading" class="load-more">
      <q-btn
        flat
        label="Load More"
        icon="expand_more"
        @click="$emit('load-more')"
        color="primary"
      />
    </div>
  </div>
</template>

<script setup>
// Props
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  itemHeight: {
    type: Number,
    required: true,
  },
  containerHeight: {
    type: Number,
    default: 400,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  hasMore: {
    type: Boolean,
    default: false,
  },
})

// Emits
// const emit = defineEmits(['scroll', 'load-more'])

// Methods
const onVirtualScroll = () => {
  // Virtual scroll handler
}
</script>

<style scoped>
.optimized-virtual-list {
  position: relative;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--q-primary);
}

.virtual-scroll-container {
  border-radius: 8px;
}

.virtual-item {
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.virtual-item:last-child {
  border-bottom: none;
}

.load-more {
  text-align: center;
  padding: 16px;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .virtual-item {
    padding: 12px 16px;
  }
}
</style>
