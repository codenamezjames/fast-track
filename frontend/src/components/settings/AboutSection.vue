<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 q-mb-md">About FastTrack</div>

      <div class="text-body2 text-grey-7">
        Version {{ appVersion }}<br />
        A simple calorie tracker with intermittent fasting features.<br />
        Built with Vue 3 and Quasar Framework.
      </div>

      <!-- App Info -->
      <div class="q-mt-md">
        <div class="text-subtitle2 q-mb-sm">App Information</div>
        <q-list dense>
          <q-item>
            <q-item-section>
              <q-item-label>Version</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ appVersion }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>Build Date</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ buildDate }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>Environment</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ environment }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Features -->
      <div class="q-mt-md">
        <div class="text-subtitle2 q-mb-sm">Features</div>
        <div class="text-body2 text-grey-7">
          <ul class="q-mt-none q-mb-none q-pl-md">
            <li>Calorie tracking with quick entry</li>
            <li>Intermittent fasting timer</li>
            <li>Weight tracking</li>
            <li>Data visualization</li>
            <li>Offline-first design</li>
            <li>Mobile-responsive interface</li>
          </ul>
        </div>
      </div>

      <!-- Links -->
      <div class="q-mt-md">
        <div class="text-subtitle2 q-mb-sm">Support</div>
        <div class="row q-gutter-sm">
          <q-btn
            flat
            color="primary"
            icon="bug_report"
            label="Report Bug"
            size="sm"
            @click="reportBug"
          />
          <q-btn flat color="primary" icon="help" label="Help" size="sm" @click="showHelp" />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

// Computed
const appVersion = computed(() => '1.0.0')

const buildDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const environment = computed(() => {
  return import.meta.env.MODE === 'production' ? 'Production' : 'Development'
})

// Methods
const reportBug = () => {
  // Open bug report URL or email
  const subject = encodeURIComponent('FastTrack Bug Report')
  const body = encodeURIComponent(
    `Version: ${appVersion.value}\nEnvironment: ${environment.value}\n\nPlease describe the issue:`,
  )
  window.open(`mailto:support@fasttrack.app?subject=${subject}&body=${body}`)
}

const showHelp = () => {
  // Open help documentation
  window.open('https://fasttrack.app/help', '_blank')
}
</script>

<style scoped>
/* About section specific styles */
</style>
