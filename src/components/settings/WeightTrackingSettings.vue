<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 q-mb-md">Weight Tracking</div>

      <q-list>
        <q-item clickable @click="showWeightEntryDialog = true">
          <q-item-section avatar>
            <q-icon name="add_circle" color="positive" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Log Weight</q-item-label>
            <q-item-label caption>Add a new weight entry</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="currentWeight" clickable @click="$router.push('/analytics')">
          <q-item-section avatar>
            <q-icon name="monitor_weight" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Current Weight: {{ currentWeight.weight }} {{ displayUnit }}</q-item-label>
            <q-item-label caption>{{ formatDate(currentWeight.date) }} • View trends</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-else>
          <q-item-section avatar>
            <q-icon name="monitor_weight" color="grey" />
          </q-item-section>
          <q-item-section>
            <q-item-label>No weight data</q-item-label>
            <q-item-label caption>Start tracking your weight</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <!-- Weight Entry Dialog -->
    <WeightEntryDialog v-model="showWeightEntryDialog" @saved="handleWeightSaved" />
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWeightStore } from '../../stores/weight.js'
import WeightEntryDialog from '../WeightEntryDialog.vue'

// Reactive refs
const showWeightEntryDialog = ref(false)

// Stores
const weightStore = useWeightStore()

// Computed
const displayUnit = ref('lbs') // Default to lbs for display
const currentWeight = computed(() => weightStore.latestWeightForDisplay(displayUnit.value))

// Methods
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const handleWeightSaved = () => {
  // Weight was saved, no additional action needed
}
</script>

<style scoped>
/* Weight tracking settings specific styles */
</style>
