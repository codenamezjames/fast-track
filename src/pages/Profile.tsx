import { useEffect, useState } from 'react'
import { User, Scale, Ruler, Target, Plus, Settings, LogOut, Activity, ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useMeasurementsStore } from '../stores/measurementsStore'
import { useSettingsStore } from '../stores/settingsStore'
import AddMeasurementModal from '../components/profile/AddMeasurementModal'
// import HealthSettings from '../components/profile/HealthSettings' // TODO: Enable when health sync is working
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

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const {
    measurements,
    addMeasurement,
    subscribeToMeasurements,
    cleanup,
    getLatestWeight,
    getLatestHeight,
    getBMI,
  } = useMeasurementsStore()

  const { goals, updateGoals } = useSettingsStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [editingGoals, setEditingGoals] = useState({
    calories: goals.calories.toString(),
    protein: goals.protein.toString(),
    carbs: goals.carbs.toString(),
    fat: goals.fat.toString(),
  })

  useEffect(() => {
    subscribeToMeasurements()
    return () => cleanup()
  }, [])

  const latestWeight = getLatestWeight()
  const latestHeight = getLatestHeight()
  const bmi = getBMI()
  const bmiCategory = bmi ? getBMICategory(bmi) : null

  const latestMeasurement = measurements[0]

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

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Body Measurements</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="p-2 bg-neutral-800 rounded-full hover:bg-primary transition-colors"
          >
            <Plus size={18} />
          </button>
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

      {/* Daily Goals Settings */}
      <div className="mb-6">
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="w-full bg-neutral-800 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Settings size={20} className="text-primary" />
            <div className="text-left">
              <div className="font-medium">Daily Goals</div>
              <div className="text-sm text-neutral-400">
                {goals.calories} cal | {goals.protein}g protein
              </div>
            </div>
          </div>
          {settingsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {settingsOpen && (
          <div className="mt-2 bg-neutral-800 rounded-xl p-4 space-y-4">
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

      {/* TODO: Enable Health App Integration when health sync is working
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Health Integration</h2>
        <HealthSettings />
      </div>
      */}

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

      {showCelebration && (
        <SuccessCelebration
          type="measurement"
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </div>
  )
}
