<template>
  <q-page class="dashboard-page fit">
    <div class="dashboard-container">
      <div class="row q-gutter-md">
        <!-- Profile Settings -->
        <div class="col-12">
          <ProfileSettings @logout="handleLogout" />
        </div>

        <!-- Notification Settings -->
        <div class="col-12">
          <NotificationSettings />
        </div>

        <!-- Weight Tracking Settings -->
        <div class="col-12">
          <WeightTrackingSettings />
        </div>

        <!-- Data Management Settings -->
        <div class="col-12">
          <DataManagementSettings />
        </div>

        <!-- About Section -->
        <div class="col-12">
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
.dashboard-page {
  padding: 20px;
}

.dashboard-container {
  max-width: 800px;
  margin: 0 auto;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .dashboard-page {
    padding: 16px;
  }
}
</style>
