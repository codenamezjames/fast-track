<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  rows?: number
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
  rows: 4,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const textareaId = computed(() => `textarea-${Math.random().toString(36).substr(2, 9)}`)

const hasError = computed(() => !!props.error)

const characterCount = computed(() => {
  if (!props.maxLength) return null
  return `${props.modelValue.length} / ${props.maxLength}`
})

function handleInput(e: Event) {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="textarea-wrapper">
    <label v-if="label" :for="textareaId" class="textarea-label">
      {{ label }}
      <span v-if="required" class="textarea-required">*</span>
    </label>

    <textarea
      :id="textareaId"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :rows="rows"
      :maxlength="maxLength"
      :class="['textarea', { 'textarea--error': hasError, 'textarea--disabled': disabled }]"
      @input="handleInput"
    ></textarea>

    <div v-if="error || characterCount" class="textarea-footer">
      <span v-if="error" class="textarea-error">{{ error }}</span>
      <span v-if="characterCount" class="textarea-count">{{ characterCount }}</span>
    </div>
  </div>
</template>

<style scoped>
.textarea-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.textarea-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.textarea-required {
  color: var(--color-error);
}

.textarea {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--color-text-primary);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  font-family: inherit;
  resize: vertical;
}

.textarea:hover:not(.textarea--disabled) {
  border-color: var(--color-primary);
}

.textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.textarea::placeholder {
  color: var(--color-text-disabled);
}

.textarea--error {
  border-color: var(--color-error);
}

.textarea--error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.textarea--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-surface-variant);
  resize: none;
}

.textarea-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.textarea-error {
  font-size: 0.875rem;
  color: var(--color-error);
  flex: 1;
}

.textarea-count {
  font-size: 0.75rem;
  color: var(--color-text-disabled);
}
</style>
