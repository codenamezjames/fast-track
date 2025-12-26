import { useEffect, useState } from 'react'

export type CelebrationType = 'meal' | 'workout' | 'activity' | 'measurement' | 'fast' | 'generic'

interface SuccessCelebrationProps {
  type: CelebrationType
  message?: string
  onComplete?: () => void
}

const CELEBRATION_CONFIG: Record<CelebrationType, {
  emoji: string
  bgColor: string
  message: string
}> = {
  meal: {
    emoji: '🍽️',
    bgColor: 'bg-green-600',
    message: 'Meal logged!',
  },
  workout: {
    emoji: '💪',
    bgColor: 'bg-red-500',
    message: 'Workout complete!',
  },
  activity: {
    emoji: '🏃',
    bgColor: 'bg-blue-500',
    message: 'Activity logged!',
  },
  measurement: {
    emoji: '📊',
    bgColor: 'bg-purple-500',
    message: 'Measurement saved!',
  },
  fast: {
    emoji: '⏱️',
    bgColor: 'bg-violet-500',
    message: 'Fast complete!',
  },
  generic: {
    emoji: '✨',
    bgColor: 'bg-primary',
    message: 'Success!',
  },
}

export default function SuccessCelebration({ type, message, onComplete }: SuccessCelebrationProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter')

  const config = CELEBRATION_CONFIG[type]

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase('show'), 50)
    const showTimer = setTimeout(() => setPhase('exit'), 1800)
    const exitTimer = setTimeout(() => onComplete?.(), 2100)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(showTimer)
      clearTimeout(exitTimer)
    }
  }, [onComplete])

  return (
    <div className="fixed bottom-24 left-0 right-0 z-50 pointer-events-none flex justify-center px-4">
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl
          ${config.bgColor}
          shadow-lg
          transform transition-all duration-200 ease-out
          ${phase === 'enter' ? 'translate-y-4 opacity-0 scale-95' : ''}
          ${phase === 'show' ? 'translate-y-0 opacity-100 scale-100' : ''}
          ${phase === 'exit' ? '-translate-y-2 opacity-0 scale-95' : ''}
        `}
      >
        <span className="text-xl">{config.emoji}</span>
        <span className="text-white font-medium text-sm">
          {message || config.message}
        </span>
      </div>
    </div>
  )
}
