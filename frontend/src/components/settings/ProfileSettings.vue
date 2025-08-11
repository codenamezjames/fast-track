<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 q-mb-md">Profile</div>

      <div class="row q-gutter-md items-center">
        <q-icon name="account_circle" size="64px" color="primary" />

        <div class="col">
          <div class="text-subtitle1">{{ userName || 'User' }}</div>
          <div class="text-body2 text-grey-6">{{ userEmail || 'No email' }}</div>
          <div class="text-caption text-grey-5">
            {{ authModeText }}
          </div>
        </div>
      </div>

      <!-- Profile Actions -->
      <div class="q-mt-md">
        <q-btn
          v-if="showLogoutButton"
          flat
          color="negative"
          icon="logout"
          label="Logout"
          @click="handleLogout"
          :loading="isLoggingOut"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { useErrorHandling } from '../../composables/useErrorHandling.js'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../utils/constants.js'

// Props
defineProps({
  showLogoutButton: {
    type: Boolean,
    default: true,
  },
})

// Emits
const emit = defineEmits(['logout'])

// Stores and composables
const authStore = useAuthStore()
const { executeWithErrorHandling } = useErrorHandling()

// Computed
const userName = computed(() => authStore.userName)
const userEmail = computed(() => authStore.userEmail)
const authModeText = computed(() => {
  return authStore.isOnline ? 'Online mode' : 'Using offline mode'
})

const isLoggingOut = computed(() => authStore.isLoading)

// Methods
const handleLogout = async () => {
  return executeWithErrorHandling(
    async () => {
      await authStore.logout()
      emit('logout')
    },
    ERROR_MESSAGES.LOGIN_FAILED,
    SUCCESS_MESSAGES.LOGIN_SUCCESS,
  )
}
</script>

<style scoped>
/* Profile settings specific styles */
</style>
