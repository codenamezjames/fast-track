<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus } from 'lucide-vue-next'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import type { FoodItem } from '@/types'

const emit = defineEmits<{
  add: [food: FoodItem]
}>()

const name = ref('')
const calories = ref<number | ''>('')
const protein = ref<number | ''>('')
const carbs = ref<number | ''>('')
const fat = ref<number | ''>('')
const servingSize = ref('')

const isValid = computed(() => {
  return name.value.trim() !== '' && calories.value !== '' && Number(calories.value) > 0
})

function handleAdd() {
  if (!isValid.value) return

  const food: FoodItem = {
    name: name.value.trim(),
    calories: Number(calories.value),
    protein: protein.value ? Number(protein.value) : undefined,
    carbs: carbs.value ? Number(carbs.value) : undefined,
    fat: fat.value ? Number(fat.value) : undefined,
    servingSize: servingSize.value.trim() || undefined,
  }

  emit('add', food)

  // Reset form
  name.value = ''
  calories.value = ''
  protein.value = ''
  carbs.value = ''
  fat.value = ''
  servingSize.value = ''
}
</script>

<template>
  <div class="manual-food-entry">
    <div class="manual-food-entry__form">
      <Input v-model="name" label="Food Name" placeholder="e.g., Chicken Breast" required />

      <div class="manual-food-entry__row">
        <Input
          v-model="calories"
          type="number"
          label="Calories"
          placeholder="200"
          required
          min="0"
        />
        <Input
          v-model="servingSize"
          label="Serving Size"
          placeholder="100g (optional)"
        />
      </div>

      <div class="manual-food-entry__divider">
        <span class="manual-food-entry__divider-text">Macros (Optional)</span>
      </div>

      <div class="manual-food-entry__macros">
        <Input v-model="protein" type="number" label="Protein (g)" placeholder="0" min="0" />
        <Input v-model="carbs" type="number" label="Carbs (g)" placeholder="0" min="0" />
        <Input v-model="fat" type="number" label="Fat (g)" placeholder="0" min="0" />
      </div>

      <Button variant="meals" full-width :disabled="!isValid" @click="handleAdd">
        <Plus :size="18" />
        Add Food
      </Button>
    </div>
  </div>
</template>

<style scoped>
.manual-food-entry {
  display: flex;
  flex-direction: column;
}

.manual-food-entry__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.manual-food-entry__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.manual-food-entry__divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.5rem 0;
}

.manual-food-entry__divider::before,
.manual-food-entry__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.manual-food-entry__divider-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.manual-food-entry__macros {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .manual-food-entry__row {
    grid-template-columns: 1fr;
  }

  .manual-food-entry__macros {
    grid-template-columns: 1fr;
  }
}
</style>
