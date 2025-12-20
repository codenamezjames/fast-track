import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Utensils, Dumbbell, Scale, MapPin, Flame, Target, Plus } from 'lucide-react'
import { useFastingStore } from '../stores/fastingStore'
import { useMealsStore } from '../stores/mealsStore'
import { useWorkoutsStore } from '../stores/workoutsStore'
import { useMeasurementsStore } from '../stores/measurementsStore'
import { useActivityStore } from '../stores/activityStore'
import MotivationalGreeting from '../components/dashboard/MotivationalGreeting'
import HeroFastingCard from '../components/dashboard/HeroFastingCard'
import StatCardEnhanced from '../components/dashboard/StatCardEnhanced'
import QuickActionButton from '../components/dashboard/QuickActionButton'
import StreakBadge from '../components/ui/StreakBadge'

const CALORIE_GOAL = 2200
const WORKOUT_GOAL = 4

export default function Dashboard() {
  const navigate = useNavigate()

  // Fasting
  const {
    currentFast,
    subscribeToFasts,
    cleanup: cleanupFasting,
    getStreak,
  } = useFastingStore()

  // Meals
  const {
    subscribeToMeals,
    cleanup: cleanupMeals,
    getTodaysCalories,
  } = useMealsStore()

  // Workouts
  const {
    subscribeToData: subscribeToWorkouts,
    cleanup: cleanupWorkouts,
    getThisWeeksWorkouts,
  } = useWorkoutsStore()

  // Measurements
  const {
    subscribeToMeasurements,
    cleanup: cleanupMeasurements,
    getLatestWeight,
  } = useMeasurementsStore()

  // Activity
  const {
    subscribeToActivities,
    cleanup: cleanupActivities,
    getTodaysDistance,
  } = useActivityStore()

  const [fastingElapsed, setFastingElapsed] = useState(0)

  // Subscribe to all stores
  useEffect(() => {
    subscribeToFasts()
    subscribeToMeals()
    subscribeToWorkouts()
    subscribeToMeasurements()
    subscribeToActivities()

    return () => {
      cleanupFasting()
      cleanupMeals()
      cleanupWorkouts()
      cleanupMeasurements()
      cleanupActivities()
    }
  }, [])

  // Update fasting elapsed time
  useEffect(() => {
    if (!currentFast) {
      setFastingElapsed(0)
      return
    }

    const updateElapsed = () => {
      const now = new Date()
      setFastingElapsed(now.getTime() - currentFast.startTime.getTime())
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000) // Update every second for smoother display
    return () => clearInterval(interval)
  }, [currentFast])

  const isFasting = !!currentFast
  const fastingProgress = currentFast
    ? Math.min(100, (fastingElapsed / (currentFast.goalHours * 60 * 60 * 1000)) * 100)
    : 0

  const todaysCalories = getTodaysCalories()
  const weeklyWorkouts = getThisWeeksWorkouts()
  const latestWeight = getLatestWeight()
  const todaysDistance = getTodaysDistance()
  const fastingStreak = getStreak()
  const caloriesProgress = (todaysCalories / CALORIE_GOAL) * 100

  // Calculate goals hit today
  const goalsHit = [
    todaysCalories >= CALORIE_GOAL * 0.8 && todaysCalories <= CALORIE_GOAL * 1.1, // Within 80-110% of calorie goal
    weeklyWorkouts >= WORKOUT_GOAL,
  ].filter(Boolean).length

  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Motivational Greeting */}
      <MotivationalGreeting
        streak={fastingStreak}
        isFasting={isFasting}
        fastingProgress={fastingProgress}
        workoutsThisWeek={weeklyWorkouts}
        caloriesProgress={caloriesProgress}
      />

      {/* Hero Fasting Card */}
      <HeroFastingCard
        isActive={isFasting}
        elapsedMs={fastingElapsed}
        goalHours={currentFast?.goalHours ?? 16}
        progress={fastingProgress}
        streak={fastingStreak}
        onNavigate={() => navigate('/fasting')}
      />

      {/* Streak Badges */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 animate-fade-in-up stagger-2">
        <StreakBadge
          icon={<Flame size={16} />}
          count={fastingStreak}
          label="day streak"
          variant="fire"
          active={fastingStreak > 0}
        />
        <StreakBadge
          icon={<Dumbbell size={16} />}
          count={weeklyWorkouts}
          label="workouts"
          variant="primary"
          active={weeklyWorkouts > 0}
        />
        <StreakBadge
          icon={<Target size={16} />}
          count={goalsHit}
          label="goals hit"
          variant="secondary"
          active={goalsHit > 0}
        />
      </div>

      {/* Today's Progress */}
      <section className="animate-fade-in-up stagger-3">
        <h2 className="text-lg font-semibold mb-3 gradient-text">Today's Progress</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCardEnhanced
            icon={<Utensils size={18} />}
            label="Calories"
            value={todaysCalories.toLocaleString()}
            goal={CALORIE_GOAL}
            current={todaysCalories}
            subtext={`of ${CALORIE_GOAL.toLocaleString()}`}
            onClick={() => navigate('/meals')}
            variant="primary"
          />
          <StatCardEnhanced
            icon={<Dumbbell size={18} />}
            label="Workouts"
            value={weeklyWorkouts.toString()}
            goal={WORKOUT_GOAL}
            current={weeklyWorkouts}
            subtext="this week"
            onClick={() => navigate('/workouts')}
            variant="secondary"
          />
          <StatCardEnhanced
            icon={<MapPin size={18} />}
            label="Distance"
            value={`${todaysDistance.toFixed(1)} km`}
            subtext="today"
            onClick={() => navigate('/activity')}
            variant="accent"
          />
          <StatCardEnhanced
            icon={<Scale size={18} />}
            label="Weight"
            value={latestWeight ? `${latestWeight} kg` : '--'}
            subtext={latestWeight ? 'current' : 'not set'}
            onClick={() => navigate('/profile')}
            variant="primary"
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="animate-fade-in-up stagger-4">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="flex gap-3">
          <QuickActionButton
            icon={<Plus size={18} />}
            label="Log Meal"
            onClick={() => navigate('/meals')}
            variant="primary"
          />
          <QuickActionButton
            icon={<Dumbbell size={18} />}
            label="Workout"
            onClick={() => navigate('/workouts')}
            variant="secondary"
          />
        </div>
      </section>
    </div>
  )
}
