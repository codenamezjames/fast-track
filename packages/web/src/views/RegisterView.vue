<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errors = ref<{ email?: string; password?: string; confirmPassword?: string }>({})

async function handleSubmit() {
  // Clear errors
  errors.value = {}

  // Validation
  if (!email.value) {
    errors.value.email = 'Email is required'
    return
  }
  if (!password.value) {
    errors.value.password = 'Password is required'
    return
  }
  if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
    return
  }
  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match'
    return
  }

  try {
    await authStore.register({
      email: email.value,
      password: password.value,
    })

    router.push('/')
  } catch (error) {
    console.error('Registration failed:', error)
  }
}

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="register-view">
    <div class="register-view__content">
      <div class="register-view__header">
        <h1 class="register-view__title">Fast Track</h1>
        <p class="register-view__subtitle">Track your fitness journey</p>
      </div>

      <Card padding="lg">
        <form class="register-form" @submit.prevent="handleSubmit">
          <h2 class="register-form__title">Create Account</h2>

          <div v-if="authStore.error" class="register-form__error">
            {{ authStore.error }}
          </div>

          <Input
            v-model="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            autocomplete="email"
            :error="errors.email"
            required
          />

          <Input
            v-model="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            autocomplete="new-password"
            :error="errors.password"
            required
          />

          <Input
            v-model="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            autocomplete="new-password"
            :error="errors.confirmPassword"
            required
          />

          <Button type="submit" variant="primary" full-width :loading="authStore.loading">
            Create Account
          </Button>

          <div class="register-form__footer">
            <span class="register-form__footer-text">Already have an account?</span>
            <button type="button" class="register-form__link" @click="goToLogin">
              Sign in
            </button>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.register-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: var(--color-background);
}

.register-view__content {
  width: 100%;
  max-width: 400px;
}

.register-view__header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-view__title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0 0 0.5rem 0;
}

.register-view__subtitle {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.register-form__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
}

.register-form__error {
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  color: var(--color-error);
  font-size: 0.875rem;
  text-align: center;
}

.register-form__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

.register-form__footer-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.register-form__link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}

.register-form__link:hover {
  color: var(--color-primary-dark);
}
</style>
