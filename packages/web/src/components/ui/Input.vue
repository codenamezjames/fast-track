<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'tel'
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  autocomplete?: string
  min?: number | string
  max?: number | string
  step?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const hasError = computed(() => !!props.error)

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="input-wrapper">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="input-required">*</span>
    </label>

    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :autocomplete="autocomplete"
      :min="min"
      :max="max"
      :step="step"
      :class="['input', { 'input--error': hasError, 'input--disabled': disabled }]"
      @input="handleInput"
    />

    <span v-if="error" class="input-error">{{ error }}</span>
  </div>
</template>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.input-required {
  color: var(--color-error);
}

.input {
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
}

.input:hover:not(.input--disabled) {
  border-color: var(--color-primary);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.input::placeholder {
  color: var(--color-text-disabled);
}

.input--error {
  border-color: var(--color-error);
}

.input--error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-surface-variant);
}

.input-error {
  font-size: 0.875rem;
  color: var(--color-error);
}

/* Number input buttons styling */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  opacity: 1;
}

/* Date/time input styling */
input[type='date'],
input[type='time'] {
  cursor: pointer;
}

input[type='date']::-webkit-calendar-picker-indicator,
input[type='time']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(0.8);
}
</style>
