<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useStreaksStore } from '@/stores/streaksStore'
import { useMealsStore } from '@/stores/mealsStore'
import MainLayout from '@/components/layout/MainLayout.vue'
import QuickStats from '@/components/dashboard/QuickStats.vue'
import StreakDisplay from '@/components/streak/StreakDisplay.vue'
import TodayActivity from '@/components/dashboard/TodayActivity.vue'
import FastingTimer from '@/components/fasting/FastingTimer.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const streaksStore = useStreaksStore()
const mealsStore = useMealsStore()

const loading = ref(true)

const currentStreak = computed(() => streaksStore.streak?.currentStreak || 0)
const longestStreak = computed(() => streaksStore.streak?.longestStreak || 0)
const intensity = computed(() => streaksStore.streak?.intensity || 'cold')
const freezesAvailable = computed(() => streaksStore.streak?.freezesAvailable || 0)

const todayCalories = computed(() => mealsStore.dailySummary?.totalCalories || 0)

onMounted(async () => {
  try {
    await Promise.all([
      streaksStore.fetchStreak(),
      streaksStore.fetchTodayActivity(),
      mealsStore.fetchDailySummary(),
    ])
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <MainLayout>
    <div class="dashboard">
      <div v-if="loading" class="dashboard__loading">
        <LoadingSpinner size="lg" />
      </div>

      <template v-else>
        <QuickStats
          :current-streak="currentStreak"
          :today-calories="todayCalories"
          :calorie-goal="2000"
          :weekly-progress="75"
        />

        <div class="dashboard__grid">
          <div class="dashboard__main">
            <StreakDisplay
              :current-streak="currentStreak"
              :longest-streak="longestStreak"
              :intensity="intensity"
              :freezes-available="freezesAvailable"
            />

            <FastingTimer />
          </div>

          <div class="dashboard__sidebar">
            <TodayActivity :activity="streaksStore.todayActivity" />
          </div>
        </div>
      </template>
    </div>
  </MainLayout>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard__loading {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
}

.dashboard__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.dashboard__main,
.dashboard__sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .dashboard__grid {
    grid-template-columns: 2fr 1fr;
  }
}
</style>
