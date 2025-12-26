import { useEffect, useState } from 'react'
import { User, Scale, Ruler, Target, Plus, Settings, LogOut, Activity, ChevronDown, ChevronUp, TrendingDown, Edit2 } from 'lucide-react'
import IconButton from '../components/ui/IconButton'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useMeasurementsStore } from '../stores/measurementsStore'
import { useSettingsStore } from '../stores/settingsStore'
import AddMeasurementModal from '../components/profile/AddMeasurementModal'
import EditGoalsModal from '../components/profile/EditGoalsModal'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import SuccessCelebration from '../components/ui/SuccessCelebration'

function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-yellow-400' }
  if (bmi < 25) return { label: 'Normal', color: 'text-green-400' }
  if (bmi < 30) return { label: 'Overweight', color: 'text-orange-400' }
  return { label: 'Obese', color: 'text-red-400' }
}

function formatDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

function formatTargetDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const {
    measurements,
    addMeasurement,
    fetchMeasurements,
    getLatestWeight,
    getLatestHeight,
    getBMI,
  } = useMeasurementsStore()

  const { goals, profile, metrics, hasCompletedSetup, updateGoals } = useSettingsStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [goalsModalOpen, setGoalsModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [editingGoals, setEditingGoals] = useState({
    calories: goals.calories.toString(),
    protein: goals.protein.toString(),
    carbs: goals.carbs.toString(),
    fat: goals.fat.toString(),
  })

  useEffect(() => {
    fetchMeasurements()
  }, [fetchMeasurements])

  // Sync editing goals with store
  useEffect(() => {
    setEditingGoals({
      calories: goals.calories.toString(),
      protein: goals.protein.toString(),
      carbs: goals.carbs.toString(),
      fat: goals.fat.toString(),
    })
  }, [goals])

  const latestWeight = getLatestWeight()
  const latestHeight = getLatestHeight()
  const bmi = getBMI()
  const bmiCategory = bmi ? getBMICategory(bmi) : null

  const latestMeasurement = measurements[0]
  const hasSetupGoals = hasCompletedSetup()

  const handleSave = async (data: { weight?: number; height?: number; bodyFat?: number }) => {
    await addMeasurement(data)
    setShowCelebration(true)
  }

  const handleGoalChange = (field: keyof typeof editingGoals, value: string) => {
    setEditingGoals((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveGoals = () => {
    updateGoals({
      calories: parseInt(editingGoals.calories) || goals.calories,
      protein: parseInt(editingGoals.protein) || goals.protein,
      carbs: parseInt(editingGoals.carbs) || goals.carbs,
      fat: parseInt(editingGoals.fat) || goals.fat,
    })
    setSettingsOpen(false)
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="bg-neutral-800 rounded-xl p-4 mb-6 flex items-center gap-4">
        <div className="bg-primary/20 p-4 rounded-full">
          <User size={32} className="text-primary" />
        </div>
        <div>
          <div className="font-semibold">{user?.email || 'Guest User'}</div>
          <div className="text-neutral-400 text-sm">Personal account</div>
        </div>
      </div>

      {/* Weight Loss Goals Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Weight Loss Goals</h2>
          <IconButton
            icon={<Edit2 size={16} />}
            onClick={() => setGoalsModalOpen(true)}
            variant="neutral"
            className="hover:bg-primary"
          />
        </div>

        {hasSetupGoals ? (
          <div className="space-y-3">
            {/* Main calorie target */}
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-primary">Daily Calorie Target</div>
                  <div className="text-2xl font-bold">{goals.calories.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-neutral-400">Goal</div>
                  <div className="font-medium">
                    {profile.currentWeight} → {profile.targetWeight} kg
                  </div>
                </div>
              </div>
            </div>

            {/* Progress & metrics */}
            <div className="bg-neutral-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={16} className="text-green-400" />
                <span className="text-sm font-medium">Your Plan</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-neutral-400">Weekly loss</div>
                  <div className="font-medium">{metrics.weeklyLoss?.toFixed(2) || '--'} kg/week</div>
                </div>
                <div>
                  <div className="text-neutral-400">Target date</div>
                  <div className="font-medium">
                    {profile.targetDate ? formatTargetDate(profile.targetDate) : '--'}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-400">Your TDEE</div>
                  <div className="font-medium">{metrics.tdee?.toLocaleString() || '--'} cal</div>
                </div>
                <div>
                  <div className="text-neutral-400">Daily deficit</div>
                  <div className="font-medium text-red-400">-{metrics.dailyDeficit?.toLocaleString() || '--'} cal</div>
                </div>
              </div>
            </div>

            {/* Macros */}
            <div className="bg-neutral-800 rounded-xl p-4">
              <div className="text-sm font-medium text-neutral-400 mb-3">Daily Macros</div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold">{goals.protein}g</div>
                  <div className="text-xs text-neutral-400">Protein</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{goals.carbs}g</div>
                  <div className="text-xs text-neutral-400">Carbs</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{goals.fat}g</div>
                  <div className="text-xs text-neutral-400">Fat</div>
                </div>
              </div>
            </div>

            {profile.isAutoCaloriesEnabled && (
              <p className="text-xs text-neutral-500 text-center">
                Calories auto-update when you log new weight measurements
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={() => setGoalsModalOpen(true)}
            className="w-full bg-neutral-800 border-2 border-dashed border-neutral-700 rounded-xl p-6 text-center hover:border-primary transition-colors"
          >
            <Target size={32} className="mx-auto mb-2 text-neutral-500" />
            <div className="font-medium">Set Up Weight Loss Goals</div>
            <div className="text-sm text-neutral-400 mt-1">
              Calculate your personalized calorie target
            </div>
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Body Measurements</h2>
          <IconButton
            icon={<Plus size={18} />}
            onClick={() => setModalOpen(true)}
            variant="neutral"
            className="hover:bg-primary"
          />
        </div>

        <div className="space-y-3">
          <div className="bg-neutral-800 rounded-xl p-4 flex items-center gap-4">
            <Scale size={20} className="text-primary" />
            <div className="flex-1">
              <div className="font-medium">Weight</div>
              <div className="text-neutral-400 text-sm">
                {latestMeasurement
                  ? `Updated ${formatDate(latestMeasurement.date)}`
                  : 'Not recorded'}
              </div>
            </div>
            <div className="text-xl font-semibold">
              {latestWeight ? `${latestWeight} kg` : '-- kg'}
            </div>
          </div>

          <div className="bg-neutral-800 rounded-xl p-4 flex items-center gap-4">
            <Ruler size={20} className="text-primary" />
            <div className="flex-1">
              <div className="font-medium">Height</div>
              <div className="text-neutral-400 text-sm">
                {latestHeight ? 'Set' : 'Not set'}
              </div>
            </div>
            <div className="text-xl font-semibold">
              {latestHeight ? `${latestHeight} cm` : '-- cm'}
            </div>
          </div>

          <div className="bg-neutral-800 rounded-xl p-4 flex items-center gap-4">
            <Target size={20} className="text-primary" />
            <div className="flex-1">
              <div className="font-medium">BMI</div>
              <div className="text-neutral-400 text-sm">
                {bmiCategory ? (
                  <span className={bmiCategory.color}>{bmiCategory.label}</span>
                ) : (
                  'Add weight & height'
                )}
              </div>
            </div>
            <div className="text-xl font-semibold">
              {bmi ? bmi.toFixed(1) : '--'}
            </div>
          </div>
        </div>

        {/* Weight history */}
        {measurements.filter((m) => m.weight).length > 1 && (
          <div className="mt-4 bg-neutral-800 rounded-xl p-4">
            <h3 className="text-sm font-medium text-neutral-400 mb-3">
              Recent Weight
            </h3>
            <div className="space-y-2">
              {measurements
                .filter((m) => m.weight)
                .slice(0, 5)
                .map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-neutral-400">{formatDate(m.date)}</span>
                    <span>{m.weight} kg</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual Goals Override */}
      <div className="mb-6">
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="w-full bg-neutral-800 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Settings size={20} className="text-primary" />
            <div className="text-left">
              <div className="font-medium">Manual Goals Override</div>
              <div className="text-sm text-neutral-400">
                {goals.calories} cal | {goals.protein}g protein
              </div>
            </div>
          </div>
          {settingsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {settingsOpen && (
          <div className="mt-2 bg-neutral-800 rounded-xl p-4 space-y-4">
            <p className="text-xs text-neutral-500">
              Override the calculated goals with custom values. This will disable auto-updates.
            </p>
            <Input
              label="Daily Calorie Goal"
              type="number"
              value={editingGoals.calories}
              onChange={(e) => handleGoalChange('calories', e.target.value)}
            />
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Protein (g)"
                type="number"
                value={editingGoals.protein}
                onChange={(e) => handleGoalChange('protein', e.target.value)}
              />
              <Input
                label="Carbs (g)"
                type="number"
                value={editingGoals.carbs}
                onChange={(e) => handleGoalChange('carbs', e.target.value)}
              />
              <Input
                label="Fat (g)"
                type="number"
                value={editingGoals.fat}
                onChange={(e) => handleGoalChange('fat', e.target.value)}
              />
            </div>
            <Button onClick={handleSaveGoals} className="w-full">
              Save Goals
            </Button>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">More</h2>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/activity')}
            className="w-full bg-neutral-800 rounded-xl p-4 flex items-center gap-4 text-left"
          >
            <Activity size={20} className="text-neutral-400" />
            <span>Activity Tracking</span>
          </button>

          <button
            onClick={logout}
            className="w-full bg-neutral-800 rounded-xl p-4 flex items-center gap-4 text-left text-red-400"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <AddMeasurementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        currentHeight={latestHeight}
      />

      <EditGoalsModal
        isOpen={goalsModalOpen}
        onClose={() => setGoalsModalOpen(false)}
      />

      {showCelebration && (
        <SuccessCelebration
          type="measurement"
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </div>
  )
}
