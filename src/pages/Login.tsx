import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Mail, Lock, Eye, EyeOff, ChevronLeft } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useMeasurementsStore } from '../stores/measurementsStore'
import ProfileSetupWizard, { type CompletedProfile } from '../components/onboarding/ProfileSetupWizard'
import Button from '../components/ui/Button'

type SignUpStep = 'profile' | 'account'

interface ProfileData {
  profile: CompletedProfile
  calculatedCalories: number
  macros: { protein: number; carbs: number; fat: number }
}

export default function Login() {
  const navigate = useNavigate()
  const { login, register, loading, error, clearError } = useAuthStore()
  const { updateProfile, updateGoals } = useSettingsStore()
  const { addMeasurement } = useMeasurementsStore()

  const [isLogin, setIsLogin] = useState(true)
  const [signUpStep, setSignUpStep] = useState<SignUpStep>('profile')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Store profile data from wizard for account creation
  const [profileData, setProfileData] = useState<ProfileData | null>(null)

  const handleProfileComplete = (data: ProfileData) => {
    setProfileData(data)
    setSignUpStep('account')
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await login(email, password)
    if (success) {
      navigate('/')
    }
  }

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileData) return

    const success = await register(email, password)
    if (success) {
      // Save profile to settings store
      updateProfile({
        age: profileData.profile.age,
        gender: profileData.profile.gender,
        height: profileData.profile.height,
        currentWeight: profileData.profile.currentWeight,
        activityLevel: profileData.profile.activityLevel,
        targetWeight: profileData.profile.targetWeight,
        targetDate: profileData.profile.targetDate,
        isAutoCaloriesEnabled: true,
      })

      // Save calculated goals
      updateGoals({
        calories: profileData.calculatedCalories,
        protein: profileData.macros.protein,
        carbs: profileData.macros.carbs,
        fat: profileData.macros.fat,
      })

      // Save initial measurement to Firestore
      await addMeasurement({
        weight: profileData.profile.currentWeight,
        height: profileData.profile.height,
      })

      navigate('/')
    }
  }

  const handleToggleMode = () => {
    setIsLogin(!isLogin)
    setSignUpStep('profile')
    setProfileData(null)
    clearError()
  }

  const handleBackToProfile = () => {
    setSignUpStep('profile')
    clearError()
  }

  // Sign In mode - simple form
  if (isLogin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
              <Activity size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Fast Track</h1>
            <p className="text-neutral-400 text-sm mt-1">
              Your personal fitness companion
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-3 pl-10 pr-12 focus:outline-none focus:border-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium disabled:opacity-50"
            >
              {loading ? 'Please wait...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleToggleMode}
              className="text-primary text-sm"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Sign Up mode - multi-step flow
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full mb-3">
            <Activity size={24} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold">Create Your Account</h1>
          <p className="text-neutral-400 text-sm mt-1">
            {signUpStep === 'profile'
              ? "Let's set up your fitness profile"
              : 'Almost done! Create your login'}
          </p>
        </div>

        {signUpStep === 'profile' ? (
          <>
            <ProfileSetupWizard
              onComplete={handleProfileComplete}
              initialData={profileData?.profile}
              mode="onboarding"
            />
            <div className="mt-6 text-center">
              <button
                onClick={handleToggleMode}
                className="text-primary text-sm"
              >
                Already have an account? Sign in
              </button>
            </div>
          </>
        ) : (
          <div className="w-full max-w-sm mx-auto">
            {/* Back button */}
            <button
              onClick={handleBackToProfile}
              className="flex items-center text-neutral-400 hover:text-white mb-6 transition-colors"
            >
              <ChevronLeft size={18} />
              <span className="text-sm">Back to profile</span>
            </button>

            {/* Summary card */}
            {profileData && (
              <div className="bg-neutral-800 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-neutral-400">Daily target</div>
                    <div className="text-xl font-bold text-primary">
                      {profileData.calculatedCalories.toLocaleString()} cal
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-neutral-400">Goal</div>
                    <div className="font-medium">
                      {profileData.profile.currentWeight} → {profileData.profile.targetWeight} kg
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-3 pl-10 pr-12 focus:outline-none focus:border-primary"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  At least 6 characters
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={handleToggleMode}
                className="text-primary text-sm"
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
