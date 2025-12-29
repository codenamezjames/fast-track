<script setup lang="ts">
import { onMounted } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import Button from '@/components/ui/Button.vue'
import { User, Bell, BellOff, TestTube } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
import { useWebPush } from '@/composables/useWebPush'

const authStore = useAuthStore()
const webPush = useWebPush()

async function handleSubscribe() {
  await webPush.subscribe()
}

async function handleUnsubscribe() {
  await webPush.unsubscribe()
}

async function handleTest() {
  await webPush.testNotification()
}

onMounted(async () => {
  await webPush.checkSubscription()
})
</script>

<template>
  <MainLayout>
    <div class="profile-view">
      <div class="profile-view__header">
        <User :size="48" class="profile-view__icon" />
        <h1 class="profile-view__title">Profile</h1>
        <p class="profile-view__email">{{ authStore.user?.email }}</p>
      </div>

      <div class="profile-view__section">
        <h2 class="profile-view__section-title">
          <Bell :size="20" />
          Notifications
        </h2>

        <div v-if="!webPush.isSupported.value" class="profile-view__alert profile-view__alert--warning">
          <p>Push notifications are not supported in this browser.</p>
        </div>

        <div v-else class="profile-view__notification-settings">
          <div class="profile-view__setting">
            <div class="profile-view__setting-info">
              <h3 class="profile-view__setting-title">Push Notifications</h3>
              <p class="profile-view__setting-description">
                Get notified about fasting milestones, meal reminders, and daily goals
              </p>
            </div>

            <div class="profile-view__setting-actions">
              <Button
                v-if="!webPush.isSubscribed.value"
                variant="primary"
                size="sm"
                :loading="webPush.loading.value"
                :disabled="webPush.permission.value === 'denied'"
                @click="handleSubscribe"
              >
                <Bell :size="16" />
                Enable
              </Button>
              <Button
                v-else
                variant="danger"
                size="sm"
                :loading="webPush.loading.value"
                @click="handleUnsubscribe"
              >
                <BellOff :size="16" />
                Disable
              </Button>
            </div>
          </div>

          <div v-if="webPush.error.value" class="profile-view__alert profile-view__alert--error">
            <p>{{ webPush.error.value }}</p>
          </div>

          <div v-if="webPush.permission.value === 'denied'" class="profile-view__alert profile-view__alert--error">
            <p>
              Notifications are blocked. Please enable them in your browser settings to receive
              push notifications.
            </p>
          </div>

          <div v-if="webPush.isSubscribed.value" class="profile-view__test">
            <Button variant="outline" size="sm" @click="handleTest">
              <TestTube :size="16" />
              Test Notification
            </Button>
          </div>
        </div>
      </div>

      <div class="profile-view__section">
        <h2 class="profile-view__section-title">Account</h2>
        <p class="profile-view__placeholder">Additional settings coming soon!</p>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.profile-view {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px 16px;
}

.profile-view__header {
  text-align: center;
  margin-bottom: 32px;
}

.profile-view__icon {
  color: var(--color-primary);
  margin: 0 auto 16px;
}

.profile-view__title {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 8px 0;
}

.profile-view__email {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.profile-view__section {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 16px;
}

.profile-view__section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-view__notification-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-view__setting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.profile-view__setting-info {
  flex: 1;
}

.profile-view__setting-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text);
  margin: 0 0 4px 0;
}

.profile-view__setting-description {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.profile-view__setting-actions {
  flex-shrink: 0;
}

.profile-view__alert {
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  line-height: 1.5;
}

.profile-view__alert--warning {
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.profile-view__alert--error {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.profile-view__alert p {
  margin: 0;
}

.profile-view__test {
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}

.profile-view__placeholder {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

@media (max-width: 640px) {
  .profile-view__setting {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-view__setting-actions {
    width: 100%;
  }

  .profile-view__setting-actions button {
    width: 100%;
  }
}
</style>
