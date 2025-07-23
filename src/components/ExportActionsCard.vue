<template>
  <q-card flat bordered class="chart-card">
    <q-card-section>
      <div class="text-h6 q-mb-md">Export Data</div>
      <div class="export-actions">
        <div class="row q-gutter-md justify-center">
          <div class="col-12 col-sm-6 col-md-3" v-for="action in actions" :key="action.id">
            <q-btn
              unelevated
              :color="action.color"
              :icon="action.icon"
              :label="action.label"
              class="full-width export-btn"
              @click="$emit(action.event)"
              :loading="action.loading"
            />
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineEmits(['exportCalories', 'exportFasting', 'shareReport', 'printReport'])

const props = defineProps({
  exportingCalories: {
    type: Boolean,
    default: false
  },
  exportingFasting: {
    type: Boolean,
    default: false
  }
})

const actions = [
  {
    id: 'calories',
    color: 'primary',
    icon: 'file_download',
    label: 'Export Calories CSV',
    event: 'exportCalories',
    loading: props.exportingCalories
  },
  {
    id: 'fasting',
    color: 'secondary',
    icon: 'file_download',
    label: 'Export Fasting CSV',
    event: 'exportFasting',
    loading: props.exportingFasting
  },
  {
    id: 'share',
    color: 'positive',
    icon: 'share',
    label: 'Share Report',
    event: 'shareReport',
    loading: false
  },
  {
    id: 'print',
    color: 'info',
    icon: 'print',
    label: 'Print Report',
    event: 'printReport',
    loading: false
  }
]
</script>

<style scoped>
.chart-card {
  border-radius: 12px;
  overflow: hidden;
}

.export-btn {
  height: 48px;
}
</style> 