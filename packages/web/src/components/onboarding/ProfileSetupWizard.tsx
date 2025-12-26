import { useState, useMemo } from 'react'
import { User, Ruler, Activity, Target, Check, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { calculateCaloriesFromProfile, type Gender, type ActivityLevel } from '../../lib/calorieCalculator'

// Completed profile with all required fields (non-null)
export interface CompletedProfile {
  age: number
  gender: Gender
  height: number
  currentWeight: number
  activityLevel: ActivityLevel
  targetWeight: number
  targetDate: string
}

interface ProfileSetupWizardProps {
  onComplete: (data: {
    profile: CompletedProfile
    calculatedCalories: number
    macros: { protein: number; carbs: number; fat: number }
  }) => void
  initialData?: Partial<CompletedProfile>
  mode?: 'onboarding' | 'edit'
}

type WizardStep = 'basic' | 'body' | 'activity' | 'goals' | 'review'

const STEPS: WizardStep[] = ['basic', 'body', 'activity', 'goals', 'review']

const STEP_INFO: Record<WizardStep, { title: string; icon: React.ReactNode }> = {
  basic: { title: 'About You', icon: <User size={20} /> },
  body: { title: 'Body Stats', icon: <Ruler size={20} /> },
  activity: { title: 'Activity', icon: <Activity size={20} /> },
  goals: { title: 'Goals', icon: <Target size={20} /> },
  review: { title: 'Review', icon: <Check size={20} /> },
}

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise, desk job' },
  { value: 'moderate', label: 'Moderately Active', description: 'Exercise 3-5 days/week' },
  { value: 'active', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
]

export default function ProfileSetupWizard({
  onComplete,
  initialData,
  mode = 'onboarding',
}: ProfileSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic')
  const [formData, setFormData] = useState({
    age: initialData?.age?.toString() || '',
    gender: initialData?.gender || (null as Gender | null),
    height: initialData?.height?.toString() || '',
    currentWeight: initialData?.currentWeight?.toString() || '',
    activityLevel: initialData?.activityLevel || (null as ActivityLevel | null),
    targetWeight: initialData?.targetWeight?.toString() || '',
    targetDate: initialData?.targetDate || getDefaultTargetDate(),
  })

  function getDefaultTargetDate(): string {
    const date = new Date()
    date.setMonth(date.getMonth() + 3) // 3 months from now
    return date.toISOString().split('T')[0]
  }

  const currentStepIndex = STEPS.indexOf(currentStep)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === STEPS.length - 1

  const calculation = useMemo(() => {
    const { age, gender, height, currentWeight, activityLevel, targetWeight, targetDate } = formData
    if (!age || !gender || !height || !currentWeight || !activityLevel || !targetWeight || !targetDate) {
      return null
    }
    return calculateCaloriesFromProfile({
      age: parseInt(age),
      gender,
      height: parseFloat(height),
      weight: parseFloat(currentWeight),
      activityLevel,
      targetWeight: parseFloat(targetWeight),
      targetDate,
    })
  }, [formData])

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'basic':
        return !!formData.age && !!formData.gender && parseInt(formData.age) >= 18
      case 'body':
        return !!formData.height && !!formData.currentWeight
      case 'activity':
        return !!formData.activityLevel
      case 'goals':
        return !!formData.targetWeight && !!formData.targetDate
      case 'review':
        return !!calculation
      default:
        return false
    }
  }

  const handleNext = () => {
    if (isLastStep) {
      // All fields are validated by canProceed() before reaching this point
      if (calculation && formData.gender && formData.activityLevel) {
        onComplete({
          profile: {
            age: parseInt(formData.age),
            gender: formData.gender,
            height: parseFloat(formData.height),
            currentWeight: parseFloat(formData.currentWeight),
            activityLevel: formData.activityLevel,
            targetWeight: parseFloat(formData.targetWeight),
            targetDate: formData.targetDate,
          },
          calculatedCalories: calculation.dailyCalories,
          macros: calculation.macros,
        })
      }
    } else {
      setCurrentStep(STEPS[currentStepIndex + 1])
    }
  }

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(STEPS[currentStepIndex - 1])
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((step, index) => {
          const isActive = step === currentStep
          const isCompleted = index < currentStepIndex
          return (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-neutral-800 text-neutral-500'
                }`}
              >
                {isCompleted ? <Check size={18} /> : STEP_INFO[step].icon}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-1 ${
                    isCompleted ? 'bg-green-500' : 'bg-neutral-700'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step title */}
      <h2 className="text-xl font-bold mb-6 text-center">
        {STEP_INFO[currentStep].title}
      </h2>

      {/* Step content */}
      <div className="min-h-[280px]">
        {currentStep === 'basic' && (
          <BasicInfoStep
            age={formData.age}
            gender={formData.gender}
            onAgeChange={(age) => setFormData({ ...formData, age })}
            onGenderChange={(gender) => setFormData({ ...formData, gender })}
          />
        )}
        {currentStep === 'body' && (
          <BodyStatsStep
            height={formData.height}
            weight={formData.currentWeight}
            onHeightChange={(height) => setFormData({ ...formData, height })}
            onWeightChange={(currentWeight) => setFormData({ ...formData, currentWeight })}
          />
        )}
        {currentStep === 'activity' && (
          <ActivityStep
            activityLevel={formData.activityLevel}
            onChange={(activityLevel) => setFormData({ ...formData, activityLevel })}
          />
        )}
        {currentStep === 'goals' && (
          <GoalsStep
            currentWeight={formData.currentWeight}
            targetWeight={formData.targetWeight}
            targetDate={formData.targetDate}
            calculation={calculation}
            onTargetWeightChange={(targetWeight) => setFormData({ ...formData, targetWeight })}
            onTargetDateChange={(targetDate) => setFormData({ ...formData, targetDate })}
          />
        )}
        {currentStep === 'review' && (
          <ReviewStep calculation={calculation} mode={mode} />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-6">
        {!isFirstStep && (
          <Button variant="secondary" onClick={handleBack} className="flex-1">
            <ChevronLeft size={18} className="mr-1" />
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className={isFirstStep ? 'w-full' : 'flex-1'}
        >
          {isLastStep ? (
            mode === 'onboarding' ? 'Continue to Sign Up' : 'Save Changes'
          ) : (
            <>
              Next
              <ChevronRight size={18} className="ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Step Components

function BasicInfoStep({
  age,
  gender,
  onAgeChange,
  onGenderChange,
}: {
  age: string
  gender: Gender | null
  onAgeChange: (age: string) => void
  onGenderChange: (gender: Gender) => void
}) {
  return (
    <div className="space-y-6">
      <Input
        label="What's your age?"
        type="number"
        min="18"
        max="100"
        placeholder="e.g., 30"
        value={age}
        onChange={(e) => onAgeChange(e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-3">
          What's your gender?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onGenderChange('male')}
            className={`p-4 rounded-xl border-2 transition-all ${
              gender === 'male'
                ? 'border-primary bg-primary/10'
                : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
            }`}
          >
            <span className="text-2xl mb-2 block">👨</span>
            <span className="font-medium">Male</span>
          </button>
          <button
            type="button"
            onClick={() => onGenderChange('female')}
            className={`p-4 rounded-xl border-2 transition-all ${
              gender === 'female'
                ? 'border-primary bg-primary/10'
                : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
            }`}
          >
            <span className="text-2xl mb-2 block">👩</span>
            <span className="font-medium">Female</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function BodyStatsStep({
  height,
  weight,
  onHeightChange,
  onWeightChange,
}: {
  height: string
  weight: string
  onHeightChange: (height: string) => void
  onWeightChange: (weight: string) => void
}) {
  return (
    <div className="space-y-6">
      <Input
        label="Current weight (kg)"
        type="number"
        step="0.1"
        min="30"
        max="300"
        placeholder="e.g., 75.5"
        value={weight}
        onChange={(e) => onWeightChange(e.target.value)}
      />

      <Input
        label="Height (cm)"
        type="number"
        min="100"
        max="250"
        placeholder="e.g., 175"
        value={height}
        onChange={(e) => onHeightChange(e.target.value)}
      />

      <p className="text-sm text-neutral-400">
        We use this to calculate your daily calorie needs using the Mifflin-St Jeor equation.
      </p>
    </div>
  )
}

function ActivityStep({
  activityLevel,
  onChange,
}: {
  activityLevel: ActivityLevel | null
  onChange: (level: ActivityLevel) => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-400 mb-4">
        Choose your typical activity level:
      </p>
      {ACTIVITY_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
            activityLevel === option.value
              ? 'border-primary bg-primary/10'
              : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
          }`}
        >
          <div className="font-medium">{option.label}</div>
          <div className="text-sm text-neutral-400">{option.description}</div>
        </button>
      ))}
    </div>
  )
}

function GoalsStep({
  currentWeight,
  targetWeight,
  targetDate,
  calculation,
  onTargetWeightChange,
  onTargetDateChange,
}: {
  currentWeight: string
  targetWeight: string
  targetDate: string
  calculation: ReturnType<typeof calculateCaloriesFromProfile> | null
  onTargetWeightChange: (weight: string) => void
  onTargetDateChange: (date: string) => void
}) {
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 14) // At least 2 weeks out
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 2) // Max 2 years out

  const weightDiff = currentWeight && targetWeight
    ? parseFloat(currentWeight) - parseFloat(targetWeight)
    : 0

  // eslint-disable-next-line react-hooks/purity -- Date.now() needed for time-based calculation
  const weeksRemaining = useMemo(() => {
    if (!targetDate) return 0
    return Math.round((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 7))
  }, [targetDate])

  return (
    <div className="space-y-6">
      <div className="bg-neutral-800 rounded-xl p-4">
        <div className="text-sm text-neutral-400">Current weight</div>
        <div className="text-xl font-bold">{currentWeight || '—'} kg</div>
      </div>

      <Input
        label="Target weight (kg)"
        type="number"
        step="0.1"
        min="30"
        max="300"
        placeholder="e.g., 70"
        value={targetWeight}
        onChange={(e) => onTargetWeightChange(e.target.value)}
      />

      <Input
        label="Target date"
        type="date"
        min={minDate.toISOString().split('T')[0]}
        max={maxDate.toISOString().split('T')[0]}
        value={targetDate}
        onChange={(e) => onTargetDateChange(e.target.value)}
      />

      {calculation && weightDiff > 0 && (
        <div className={`rounded-xl p-4 ${
          calculation.validation.isSafe ? 'bg-green-500/10' : 'bg-yellow-500/10'
        }`}>
          <div className="flex items-start gap-2">
            {!calculation.validation.isSafe && (
              <AlertTriangle size={18} className="text-yellow-500 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <div className="font-medium">
                {weightDiff.toFixed(1)} kg in {weeksRemaining} weeks
              </div>
              <div className="text-sm text-neutral-400">
                {calculation.weeklyLoss.toFixed(2)} kg/week
              </div>
              {calculation.validation.message && (
                <div className={`text-sm mt-1 ${
                  calculation.validation.isSafe ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {calculation.validation.message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ReviewStep({
  calculation,
  mode,
}: {
  calculation: ReturnType<typeof calculateCaloriesFromProfile> | null
  mode: 'onboarding' | 'edit'
}) {
  if (!calculation) {
    return (
      <div className="text-center text-neutral-400">
        Please complete all previous steps to see your plan.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 text-center">
        <div className="text-sm text-primary mb-1">Your Daily Calorie Target</div>
        <div className="text-4xl font-bold">{calculation.dailyCalories.toLocaleString()}</div>
        <div className="text-sm text-neutral-400 mt-1">calories/day</div>
      </div>

      <div className="bg-neutral-800 rounded-xl p-4 space-y-3">
        <div className="text-sm font-medium text-neutral-300">The Math</div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">Your BMR</span>
          <span>{calculation.bmr.toLocaleString()} cal</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">Your TDEE</span>
          <span>{calculation.tdee.toLocaleString()} cal</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">Daily Deficit</span>
          <span className="text-red-400">-{calculation.dailyDeficit.toLocaleString()} cal</span>
        </div>
      </div>

      <div className="bg-neutral-800 rounded-xl p-4">
        <div className="text-sm font-medium text-neutral-300 mb-3">Daily Macros</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-bold">{calculation.macros.protein}g</div>
            <div className="text-xs text-neutral-400">Protein</div>
          </div>
          <div>
            <div className="text-lg font-bold">{calculation.macros.carbs}g</div>
            <div className="text-xs text-neutral-400">Carbs</div>
          </div>
          <div>
            <div className="text-lg font-bold">{calculation.macros.fat}g</div>
            <div className="text-xs text-neutral-400">Fat</div>
          </div>
        </div>
      </div>

      <p className="text-sm text-neutral-400 text-center">
        {mode === 'onboarding'
          ? 'Your calories will auto-update as you log new weights.'
          : 'Changes will take effect immediately.'}
      </p>
    </div>
  )
}
