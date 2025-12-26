import Modal from '../ui/Modal'
import ProfileSetupWizard, { type CompletedProfile } from '../onboarding/ProfileSetupWizard'
import { useSettingsStore } from '../../stores/settingsStore'
import { useMeasurementsStore } from '../../stores/measurementsStore'

interface EditGoalsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function EditGoalsModal({ isOpen, onClose }: EditGoalsModalProps) {
  const { profile, updateProfile, updateGoals } = useSettingsStore()
  const { addMeasurement, getLatestWeight, getLatestHeight } = useMeasurementsStore()

  // Get current values from either profile or measurements
  const currentWeight = profile.currentWeight || getLatestWeight()
  const currentHeight = profile.height || getLatestHeight()

  const handleComplete = async (data: {
    profile: CompletedProfile
    calculatedCalories: number
    macros: { protein: number; carbs: number; fat: number }
  }) => {
    // Update profile in settings store
    updateProfile({
      age: data.profile.age,
      gender: data.profile.gender,
      height: data.profile.height,
      currentWeight: data.profile.currentWeight,
      activityLevel: data.profile.activityLevel,
      targetWeight: data.profile.targetWeight,
      targetDate: data.profile.targetDate,
      isAutoCaloriesEnabled: true,
    })

    // Update goals
    updateGoals({
      calories: data.calculatedCalories,
      protein: data.macros.protein,
      carbs: data.macros.carbs,
      fat: data.macros.fat,
    })

    // If weight or height changed, add a new measurement
    const weightChanged = data.profile.currentWeight !== currentWeight
    const heightChanged = data.profile.height !== currentHeight

    if (weightChanged || heightChanged) {
      await addMeasurement({
        weight: weightChanged ? data.profile.currentWeight : undefined,
        height: heightChanged ? data.profile.height : undefined,
      })
    }

    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Weight Loss Goals">
      <ProfileSetupWizard
        onComplete={handleComplete}
        initialData={{
          age: profile.age ?? undefined,
          gender: profile.gender ?? undefined,
          height: currentHeight ?? undefined,
          currentWeight: currentWeight ?? undefined,
          activityLevel: profile.activityLevel ?? undefined,
          targetWeight: profile.targetWeight ?? undefined,
          targetDate: profile.targetDate ?? undefined,
        }}
        mode="edit"
      />
    </Modal>
  )
}
