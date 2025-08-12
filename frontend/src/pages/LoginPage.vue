<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center">
        <q-card class="q-pa-lg" style="min-width: 300px">
          <q-card-section class="text-center">
            <div class="text-h4 text-weight-bold text-primary q-mb-md">FastTrack</div>
            <div class="text-subtitle1 text-grey-7">Calorie Tracker and Intermittent Fasting</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">
              <q-input
                v-model="email"
                label="Email"
                type="email"
                outlined
                :rules="[(val) => !!val || 'Email is required']"
              />

              <q-input
                v-model="password"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                outlined
                :rules="[(val) => !!val || 'Password is required']"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>

              <q-input
                v-if="isRegistering"
                v-model="name"
                label="Full Name"
                outlined
                :rules="[(val) => !!val || 'Name is required']"
              />

              <div v-if="authStore.error" class="text-negative text-center">
                {{ authStore.error }}
              </div>

              <q-btn
                type="submit"
                :label="isRegistering ? 'Register' : 'Login'"
                color="primary"
                class="full-width"
                :loading="authStore.isLoading"
                :disable="authStore.isLoading"
              />
            </q-form>
          </q-card-section>

          <q-card-section class="text-center">
            <q-btn
              flat
              :label="
                isRegistering ? 'Already have an account? Login' : 'Need an account? Register'
              "
              @click="toggleMode"
            />
            <q-btn
              v-if="showInstallButton"
              outline
              color="primary"
              class="q-mt-md full-width"
              icon="download"
              label="Install App"
              @click="requestInstall"
            />
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
    <!-- PWA Install prompt controller -->
    <PwaInstallPrompt ref="pwaRef" />
  </q-layout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import PwaInstallPrompt from '../components/PwaInstallPrompt.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const name = ref('')
const showPassword = ref(false)
const isRegistering = ref(false)
const pwaRef = ref(null)
const showInstallButton = ref(false)

const toggleMode = () => {
  isRegistering.value = !isRegistering.value
  authStore.clearError()
}

const onSubmit = async () => {
  try {
    if (isRegistering.value) {
      await authStore.register(email.value, password.value, name.value)
    } else {
      await authStore.login(email.value, password.value)
    }

    // Redirect to calories page on successful login/registration
    router.push('/calories')
  } catch (error) {
    console.error('Authentication error:', error)
  }
}

// PWA install handling
const updateInstallable = () => {
  try {
    const isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
    const canInstall = pwaRef.value && pwaRef.value.isInstallable && pwaRef.value.isInstallable()
    showInstallButton.value = Boolean(canInstall && !isStandalone)
  } catch {
    showInstallButton.value = false
  }
}

const handleBeforeInstallPrompt = () => updateInstallable()
const handleAppInstalled = () => {
  showInstallButton.value = false
}

const requestInstall = () => {
  if (pwaRef.value && pwaRef.value.showInstallPrompt) {
    pwaRef.value.showInstallPrompt()
  }
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
  // Initial check after mount
  setTimeout(updateInstallable, 500)
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('appinstalled', handleAppInstalled)
})
</script>
