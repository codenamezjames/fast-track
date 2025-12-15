<template>
  <q-page class="fit q-pa-md">
    <div class="q-mx-auto q-gutter-y-md" style="max-width: 560px">
      <div class="q-gutter-y-md">
        <!-- Profile Settings -->
        <div>
          <ProfileSettings @logout="handleLogout" />
        </div>

        <!-- Goals Settings -->
        <div>
          <GoalsSettings />
        </div>

        <!-- Theme Settings -->
        <div>
          <ThemeSettings />
        </div>

        <!-- Units Settings -->
        <div>
          <UnitsSettings />
        </div>

        <!-- Notification Settings -->
        <div>
          <NotificationSettings />
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
import GoalsSettings from '../components/settings/GoalsSettings.vue'
import ThemeSettings from '../components/settings/ThemeSettings.vue'
import UnitsSettings from '../components/settings/UnitsSettings.vue'
import NotificationSettings from '../components/settings/NotificationSettings.vue'
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

<style scoped></style>
