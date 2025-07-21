<template>
  <q-card-section class="dialog-header">
    <div class="flex justify-between">
      <div class="text-h6 col-auto">{{ title }}</div>
      <div class="col-auto">
        <q-btn flat round dense icon="close" @click="$emit('close')" />
      </div>
    </div>
    <q-separator v-if="showSeparator" color="primary" />
  </q-card-section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  showSeparator: {
    type: Boolean,
    default: true
  }
})

defineEmits(['close'])
</script>

<style scoped>
.dialog-header {
  padding-bottom: 8px;
}
</style> 