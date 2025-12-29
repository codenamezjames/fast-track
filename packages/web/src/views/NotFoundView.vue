<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Home } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="not-found">
    <div class="not-found__content">
      <h1 class="not-found__code">404</h1>
      <h2 class="not-found__title">Page Not Found</h2>
      <p class="not-found__description">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button variant="primary" @click="goHome">
        <Home :size="18" />
        Go Home
      </Button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: var(--color-background);
}

.not-found__content {
  text-align: center;
  max-width: 500px;
}

.not-found__code {
  font-size: 6rem;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0 0 1rem 0;
  line-height: 1;
}

.not-found__title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 1rem 0;
}

.not-found__description {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin: 0 0 2rem 0;
}
</style>
