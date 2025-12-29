<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errors = ref<{ email?: string; password?: string }>({})

async function handleSubmit() {
  // Clear errors
  errors.value = {}

  // Basic validation
  if (!email.value) {
    errors.value.email = 'Email is required'
    return
  }
  if (!password.value) {
    errors.value.password = 'Password is required'
    return
  }

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    })

    // Redirect to original destination or dashboard
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (error) {
    console.error('Login failed:', error)
  }
}

function goToRegister() {
  router.push('/register')
}
</script>

<template>
  <div class="login-view">
    <div class="login-view__content">
      <div class="login-view__header">
        <h1 class="login-view__title">Fast Track</h1>
        <p class="login-view__subtitle">Track your fitness journey</p>
      </div>

      <Card padding="lg">
        <form class="login-form" @submit.prevent="handleSubmit">
          <h2 class="login-form__title">Welcome Back</h2>

          <div v-if="authStore.error" class="login-form__error">
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
            autocomplete="current-password"
            :error="errors.password"
            required
          />

          <Button type="submit" variant="primary" full-width :loading="authStore.loading">
            Sign In
          </Button>

          <div class="login-form__footer">
            <span class="login-form__footer-text">Don't have an account?</span>
            <button type="button" class="login-form__link" @click="goToRegister">
              Sign up
            </button>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: var(--color-background);
}

.login-view__content {
  width: 100%;
  max-width: 400px;
}

.login-view__header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-view__title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0 0 0.5rem 0;
}

.login-view__subtitle {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.login-form__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
}

.login-form__error {
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  color: var(--color-error);
  font-size: 0.875rem;
  text-align: center;
}

.login-form__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

.login-form__footer-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.login-form__link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}

.login-form__link:hover {
  color: var(--color-primary-dark);
}
</style>
