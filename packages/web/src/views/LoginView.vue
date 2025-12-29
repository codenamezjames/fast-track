<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { Zap } from 'lucide-vue-next'
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
    <div class="login-view__background">
      <div class="background__gradient background__gradient--1"></div>
      <div class="background__gradient background__gradient--2"></div>
      <div class="background__gradient background__gradient--3"></div>
    </div>

    <div class="login-view__content">
      <div class="login-view__header">
        <div class="header__logo">
          <Zap :size="32" class="header__logo-icon" />
        </div>
        <h1 class="header__title">Fast Track</h1>
        <p class="header__subtitle">Your Personal Fitness Journey</p>
      </div>

      <Card padding="lg" glass>
        <form class="login-form" @submit.prevent="handleSubmit">
          <h2 class="login-form__title">Welcome Back</h2>
          <p class="login-form__description">Sign in to continue your progress</p>

          <div v-if="authStore.error" class="login-form__error">
            {{ authStore.error }}
          </div>

          <div class="login-form__fields">
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
          </div>

          <Button type="submit" variant="gradient" size="lg" full-width :loading="authStore.loading">
            Sign In
          </Button>

          <div class="login-form__footer">
            <span class="login-form__footer-text">Don't have an account?</span>
            <button type="button" class="login-form__link" @click="goToRegister">
              Sign up now
            </button>
          </div>
        </form>
      </Card>

      <div class="login-view__decoration">
        <div class="decoration__circle decoration__circle--1"></div>
        <div class="decoration__circle decoration__circle--2"></div>
      </div>
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
  position: relative;
  overflow: hidden;
}

.login-view__background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.background__gradient {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s ease-in-out infinite;
}

.background__gradient--1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #c0ff00 0%, transparent 70%);
  top: -10%;
  right: -10%;
  animation-delay: 0s;
}

.background__gradient--2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #00ff88 0%, transparent 70%);
  bottom: -5%;
  left: -5%;
  animation-delay: 7s;
}

.background__gradient--3 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #7fff00 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 14s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(0);
  }
  33% {
    transform: translateY(-30px) translateX(30px);
  }
  66% {
    transform: translateY(30px) translateX(-30px);
  }
}

.login-view__content {
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 1;
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-view__header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.header__logo {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem;
  border-radius: var(--radius-xl);
  background: var(--color-primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 40px var(--color-primary-glow), var(--shadow-xl);
  animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 40px var(--color-primary-glow), var(--shadow-xl);
  }
  50% {
    box-shadow: 0 0 60px var(--color-primary-glow), 0 0 80px var(--color-primary-glow),
      var(--shadow-xl);
  }
}

.header__logo-icon {
  color: white;
}

.header__title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #ffffff 0%, #c0ff00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.header__subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin: 0;
  font-weight: 500;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.login-form__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
  letter-spacing: -0.02em;
}

.login-form__description {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  margin: -0.5rem 0 0 0;
  text-align: center;
}

.login-form__error {
  padding: 1rem 1.25rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-lg);
  color: var(--color-error);
  font-size: 0.9375rem;
  text-align: center;
  font-weight: 500;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-form__fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.login-form__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-divider);
}

.login-form__footer-text {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
}

.login-form__link {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  padding: 0;
  transition: color 0.2s ease;
}

.login-form__link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-primary-gradient);
  transform: scaleX(0);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.login-form__link:hover {
  color: var(--color-primary-light);
}

.login-form__link:hover::after {
  transform: scaleX(1);
}

.login-view__decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: -1;
}

.decoration__circle {
  position: absolute;
  border-radius: 50%;
  border: 2px solid;
  opacity: 0.1;
}

.decoration__circle--1 {
  width: 300px;
  height: 300px;
  border-color: #c0ff00;
  top: -150px;
  right: -150px;
  animation: rotate 30s linear infinite;
}

.decoration__circle--2 {
  width: 200px;
  height: 200px;
  border-color: #00ff88;
  bottom: -100px;
  left: -100px;
  animation: rotate 40s linear infinite reverse;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .header__title {
    font-size: 2rem;
  }

  .header__subtitle {
    font-size: 1rem;
  }

  .header__logo {
    width: 3.5rem;
    height: 3.5rem;
  }

  .login-form__title {
    font-size: 1.5rem;
  }

  .background__gradient {
    filter: blur(60px);
  }
}
</style>
