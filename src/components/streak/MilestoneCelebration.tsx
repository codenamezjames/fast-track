import { useEffect, useState } from 'react'
import { Flame, Trophy, Star, Sparkles, X } from 'lucide-react'

interface MilestoneCelebrationProps {
  milestone: number
  onDismiss: () => void
}

const milestoneMessages: Record<number, { title: string; subtitle: string; emoji: string }> = {
  3: { title: "You're on fire!", subtitle: '3 days of dedication', emoji: '🔥' },
  7: { title: 'One week strong!', subtitle: 'You earned a streak freeze!', emoji: '⚡' },
  14: { title: 'Two weeks!', subtitle: 'Habits are forming', emoji: '💪' },
  30: { title: 'A full month!', subtitle: 'You earned a streak freeze!', emoji: '🏆' },
  50: { title: 'Fifty days!', subtitle: 'Incredible discipline', emoji: '🌟' },
  100: { title: 'CENTURY!', subtitle: '100 days! You earned a streak freeze!', emoji: '💯' },
  150: { title: '150 days!', subtitle: 'Legendary status', emoji: '👑' },
  200: { title: '200 days!', subtitle: 'Unstoppable force', emoji: '🚀' },
  365: { title: 'ONE YEAR!', subtitle: 'You earned a streak freeze!', emoji: '🎉' },
  500: { title: '500 DAYS!', subtitle: 'Absolute legend', emoji: '🏅' },
  1000: { title: '1000 DAYS!', subtitle: 'You are the streak', emoji: '🌈' },
}

export default function MilestoneCelebration({
  milestone,
  onDismiss,
}: MilestoneCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 50)
    setTimeout(() => setShowConfetti(true), 300)

    // Auto-dismiss after 5 seconds
    const timeout = setTimeout(() => {
      handleDismiss()
    }, 5000)

    return () => clearTimeout(timeout)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(onDismiss, 300)
  }

  const message = milestoneMessages[milestone] || {
    title: `${milestone} days!`,
    subtitle: 'Keep going!',
    emoji: '🔥',
  }

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/80 backdrop-blur-sm
        transition-opacity duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={handleDismiss}
    >
      {/* Confetti particles */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#f97316', '#facc15', '#22d3ee', '#a855f7', '#22c55e'][
                  Math.floor(Math.random() * 5)
                ],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Modal content */}
      <div
        className={`
          relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900
          rounded-3xl p-8 max-w-sm w-full text-center
          border border-orange-500/30
          shadow-2xl shadow-orange-500/20
          transform transition-all duration-300
          ${isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-4'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Emoji */}
        <div className="text-6xl mb-4 animate-bounce">{message.emoji}</div>

        {/* Fire icon with glow */}
        <div className="relative inline-flex mb-4">
          <Flame
            size={80}
            className="text-orange-400 animate-pulse"
            fill="currentColor"
          />
          <div className="absolute inset-0 blur-2xl bg-orange-400/50 -z-10" />
        </div>

        {/* Streak number */}
        <div className="text-6xl font-bold gradient-text-fire mb-2">
          {milestone}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">{message.title}</h2>

        {/* Subtitle */}
        <p className="text-neutral-400 mb-6">{message.subtitle}</p>

        {/* Stars decoration */}
        <div className="flex justify-center gap-2 mb-6">
          {[...Array(Math.min(5, Math.floor(milestone / 7) + 1))].map((_, i) => (
            <Star
              key={i}
              size={20}
              className="text-yellow-400"
              fill="currentColor"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>

        {/* Continue button */}
        <button
          onClick={handleDismiss}
          className="
            w-full py-3 px-6 rounded-xl
            bg-gradient-to-r from-orange-500 to-yellow-500
            text-white font-semibold
            hover:opacity-90 transition-opacity
            shadow-lg shadow-orange-500/30
          "
        >
          Keep the fire going!
        </button>
      </div>
    </div>
  )
}
