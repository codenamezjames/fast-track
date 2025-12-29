import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Utensils, Dumbbell, Scale, MapPin, Plus, Check, Timer } from 'lucide-react'
import { useFastingStore } from '../stores/fastingStore'
import { useMealsStore } from '../stores/mealsStore'
import { useWorkoutsStore } from '../stores/workoutsStore'
import { useMeasurementsStore } from '../stores/measurementsStore'
import { useActivityStore } from '../stores/activityStore'
import { useStreakStore } from '../stores/streakStore'
import { useSettingsStore } from '../stores/settingsStore'
import MotivationalGreeting from '../components/dashboard/MotivationalGreeting'
import HeroFastingCard from '../components/dashboard/HeroFastingCard'
import StatCardEnhanced from '../components/dashboard/StatCardEnhanced'
import QuickActionButton from '../components/dashboard/QuickActionButton'
import StreakDisplay from '../components/streak/StreakDisplay'
import WeeklyCalendar from '../components/streak/WeeklyCalendar'
import StreakFreezeIndicator from '../components/streak/StreakFreezeIndicator'
import MilestoneCelebration from '../components/streak/MilestoneCelebration'
import DailyGoalCelebration from '../components/streak/DailyGoalCelebration'
import NextActionSuggestion from '../components/dashboard/NextActionSuggestion'

const WORKOUT_GOAL = 4

export default function Dashboard() {
  const { goals } = useSettingsStore()
  const navigate = useNavigate()

  // Fasting
  const {
    currentFast,
    fetchFasts,
    getStreak: getFastingStreak,
  } = useFastingStore()

  // Meals
  const {
    fetchMeals,
    getTodaysCalories,
    setSelectedDate,
  } = useMealsStore()

  // Workouts
  const {
    fetchData: fetchWorkouts,
    getThisWeeksWorkouts,
  } = useWorkoutsStore()

  // Measurements
  const {
    fetchMeasurements,
    getLatestWeight,
  } = useMeasurementsStore()

  // Activity
  const {
    fetchActivities,
    getTodaysDistance,
  } = useActivityStore()

  // Streak
  const {
    streakData,
    weekActivities,
    todayActivity,
    showMilestone,
    showDailyGoal,
    fetchStreak,
    dismissMilestone,
    dismissDailyGoal,
    getStreakIntensity,
    isTodayComplete,
  } = useStreakStore()

  const [fastingElapsed, setFastingElapsed] = useState(0)

  // Fetch all data on mount
  useEffect(() => {
    fetchFasts()
    // Reset to today when Dashboard mounts (in case user was viewing another date in Meals)
    setSelectedDate(new Date())
    fetchMeals()
    fetchWorkouts()
    fetchMeasurements()
    fetchActivities()
    fetchStreak()
  }, [fetchFasts, fetchMeals, fetchWorkouts, fetchMeasurements, fetchActivities, fetchStreak, setSelectedDate])

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
    const interval = setInterval(updateElapsed, 1000)
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
  const fastingStreak = getFastingStreak()
  const caloriesProgress = (todaysCalories / goals.calories) * 100

  // Today's activity status
  const todayComplete = isTodayComplete()
  const activitiesCompleted = [
    todayActivity?.fastCompleted,
    todayActivity?.mealsLogged,
    todayActivity?.workoutCompleted,
  ].filter(Boolean).length

  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Milestone Celebration Modal */}
      {showMilestone && (
        <MilestoneCelebration
          milestone={showMilestone}
          onDismiss={dismissMilestone}
        />
      )}

      {/* Daily Goal Celebration */}
      {showDailyGoal && (
        <DailyGoalCelebration onComplete={dismissDailyGoal} />
      )}

      {/* Motivational Greeting */}
      <MotivationalGreeting
        streak={streakData.currentStreak}
        isFasting={isFasting}
        fastingProgress={fastingProgress}
        workoutsThisWeek={weeklyWorkouts}
        caloriesProgress={caloriesProgress}
      />

      {/* Streak Hero Section */}
      <section className="animate-fade-in-up stagger-1">
        <div className="flex items-stretch gap-4">
          {/* Streak Display + Freeze */}
          <div className="flex flex-col items-center gap-2">
            <StreakDisplay
              count={streakData.currentStreak}
              intensity={getStreakIntensity()}
              size="lg"
              onClick={() => navigate('/streaks')}
            />
            <StreakFreezeIndicator
              available={streakData.freezesAvailable}
              onClick={() => navigate('/profile')}
            />
          </div>

          {/* Streak Info */}
          <div className="flex-1 flex flex-col gap-3">
            {/* Today's Progress */}
            <div className="glass rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-400">Today's goal</span>
                <span className={`text-sm font-medium ${todayComplete ? 'text-green-400' : 'text-neutral-300'}`}>
                  {activitiesCompleted}/2 activities
                </span>
              </div>
              <div className="flex gap-2">
                <ActivityPill
                  icon={<Timer size={14} />}
                  label="Fast"
                  completed={todayActivity?.fastCompleted ?? false}
                  color="purple"
                />
                <ActivityPill
                  icon={<Utensils size={14} />}
                  label="Meals"
                  completed={todayActivity?.mealsLogged ?? false}
                  color="orange"
                />
                <ActivityPill
                  icon={<Dumbbell size={14} />}
                  label="Workout"
                  completed={todayActivity?.workoutCompleted ?? false}
                  color="red"
                />
              </div>
            </div>

            {/* Next action suggestion */}
            <div className="flex-1">
              <NextActionSuggestion
                fastCompleted={todayActivity?.fastCompleted ?? false}
                mealsLogged={todayActivity?.mealsLogged ?? false}
                workoutCompleted={todayActivity?.workoutCompleted ?? false}
                allComplete={todayComplete}
                onNavigate={navigate}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Calendar */}
      <section className="animate-fade-in-up stagger-2">
        <WeeklyCalendar activities={weekActivities} />
      </section>

      {/* Fasting Card */}
      <HeroFastingCard
        isActive={isFasting}
        elapsedMs={fastingElapsed}
        goalHours={currentFast?.goalHours ?? 16}
        progress={fastingProgress}
        streak={fastingStreak}
        onNavigate={() => navigate('/fasting')}
      />

      {/* Today's Progress */}
      <section className="animate-fade-in-up stagger-3">
        <h2 className="text-lg font-semibold mb-3 gradient-text">Today's Progress</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCardEnhanced
            icon={<Utensils size={18} />}
            label="Calories"
            value={todaysCalories.toLocaleString()}
            goal={goals.calories}
            current={todaysCalories}
            subtext={`of ${goals.calories.toLocaleString()}`}
            onClick={() => navigate('/meals')}
            variant="orange"
          />
          <StatCardEnhanced
            icon={<Dumbbell size={18} />}
            label="Workouts"
            value={weeklyWorkouts.toString()}
            goal={WORKOUT_GOAL}
            current={weeklyWorkouts}
            subtext="this week"
            onClick={() => navigate('/workouts')}
            variant="red"
          />
          <StatCardEnhanced
            icon={<MapPin size={18} />}
            label="Distance"
            value={`${todaysDistance.toFixed(1)} km`}
            subtext="today"
            onClick={() => navigate('/activity')}
            variant="blue"
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
            variant="orange"
          />
          <QuickActionButton
            icon={<Dumbbell size={18} />}
            label="Workout"
            onClick={() => navigate('/workouts')}
            variant="red"
          />
        </div>
      </section>

      {/* Stats footer */}
      <section className="animate-fade-in-up stagger-5">
        <div className="glass rounded-xl p-4 flex items-center justify-around text-center">
          <div>
            <div className="text-2xl font-bold gradient-text-fire">{streakData.longestStreak}</div>
            <div className="text-xs text-neutral-500">Best streak</div>
          </div>
          <div className="w-px h-8 bg-neutral-700" />
          <div>
            <div className="text-2xl font-bold">{streakData.totalActiveDays}</div>
            <div className="text-xs text-neutral-500">Active days</div>
          </div>
          <div className="w-px h-8 bg-neutral-700" />
          <div>
            <div className="text-2xl font-bold">{streakData.milestonesAchieved.length}</div>
            <div className="text-xs text-neutral-500">Milestones</div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Helper component for activity pills
const pillColors = {
  purple: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  red: 'bg-red-500/20 text-red-400 border border-red-500/30',
}

function ActivityPill({
  icon,
  label,
  completed,
  color,
}: {
  icon: React.ReactNode
  label: string
  completed: boolean
  color: 'purple' | 'orange' | 'red'
}) {
  return (
    <div
      className={`
        flex items-center gap-1.5 px-2 py-1 rounded-full text-xs
        ${
          completed
            ? pillColors[color]
            : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
        }
      `}
    >
      {completed ? <Check size={12} /> : icon}
      <span>{label}</span>
    </div>
  )
}
