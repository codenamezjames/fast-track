<template>
  <q-dialog v-model="isVisible" persistent>
    <q-card :style="cardStyle">
      <!-- Dialog Header -->
      <DialogHeader :title="title" :subtitle="subtitle" @close="handleClose" />

      <!-- Dialog Content -->
      <q-card-section class="dialog-content">
        <slot />
      </q-card-section>

      <!-- Dialog Actions -->
      <q-card-actions
        v-if="$slots.actions || showDefaultActions"
        align="right"
        class="dialog-actions"
      >
        <slot name="actions">
          <q-btn
            v-if="showCancelButton"
            flat
            :label="cancelLabel"
            @click="handleCancel"
            :disable="isLoading"
          />
          <q-btn
            v-if="showConfirmButton"
            :label="confirmLabel"
            :color="confirmColor"
            :loading="isLoading"
            :disable="isLoading || !isValid"
            unelevated
            @click="handleConfirm"
          />
        </slot>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import DialogHeader from '../DialogHeader.vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  // Action buttons
  showCancelButton: {
    type: Boolean,
    default: true,
  },
  showConfirmButton: {
    type: Boolean,
    default: true,
  },
  showDefaultActions: {
    type: Boolean,
    default: true,
  },
  cancelLabel: {
    type: String,
    default: 'Cancel',
  },
  confirmLabel: {
    type: String,
    default: 'Confirm',
  },
  confirmColor: {
    type: String,
    default: 'primary',
  },
  // Validation
  isValid: {
    type: Boolean,
    default: true,
  },
  // Loading state
  isLoading: {
    type: Boolean,
    default: false,
  },
  // Styling
  minWidth: {
    type: String,
    default: '350px',
  },
  maxWidth: {
    type: String,
    default: '600px',
  },
})

// Emits
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'close'])

// Computed
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const cardStyle = computed(() => ({
  minWidth: props.minWidth,
  maxWidth: props.maxWidth,
  width: '100%',
}))

// Methods
const handleClose = () => {
  emit('close')
  isVisible.value = false
}

const handleCancel = () => {
  emit('cancel')
  isVisible.value = false
}

const handleConfirm = () => {
  if (props.isValid && !props.isLoading) {
    emit('confirm')
  }
}
</script>

<style scoped>
.dialog-content {
  padding: 20px;
}

.dialog-actions {
  padding: 16px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

/* Dark mode support */
:deep(.q-dark) .dialog-actions {
  border-top-color: rgba(255, 255, 255, 0.12);
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .dialog-content {
    padding: 16px;
  }

  .dialog-actions {
    padding: 12px 16px;
  }
}
</style>
