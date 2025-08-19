<template>
  <q-page class="fit q-pa-md">
    <div class="q-mx-auto q-gutter-y-md" style="max-width: 560px">
      <div class="q-gutter-y-md">
        <!-- Profile Settings -->
        <div>
          <ProfileSettings @logout="handleLogout" />
        </div>

        <!-- Notification Settings -->
        <div>
          <NotificationSettings />
        </div>

        <!-- Weight Tracking Settings -->
        <div>
          <WeightTrackingSettings />
        </div>

        <!-- Data Management Settings -->
        <div>
          <DataManagementSettings />
        </div>

        <!-- About Section -->
        <div>
          <AboutSection />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
import ProfileSettings from '../components/settings/ProfileSettings.vue'
import NotificationSettings from '../components/settings/NotificationSettings.vue'
import WeightTrackingSettings from '../components/settings/WeightTrackingSettings.vue'
import DataManagementSettings from '../components/settings/DataManagementSettings.vue'
import AboutSection from '../components/settings/AboutSection.vue'

// Router
const router = useRouter()

// Methods
const handleLogout = () => {
  // Redirect to login page after logout
  router.push('/login')
}
</script>

<style scoped>
</style>
