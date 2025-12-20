import { Flame } from 'lucide-react'

interface StreakDisplayProps {
  count: number
  intensity: 'cold' | 'warm' | 'hot' | 'fire' | 'inferno'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  onClick?: () => void
}

const intensityStyles = {
  cold: {
    flame: 'text-neutral-400',
    glow: '',
    bg: 'from-neutral-700/50 to-neutral-800/50',
    animate: '',
  },
  warm: {
    flame: 'text-orange-400',
    glow: 'shadow-orange-400/20',
    bg: 'from-orange-500/20 to-yellow-500/20',
    animate: '',
  },
  hot: {
    flame: 'text-orange-500',
    glow: 'shadow-orange-500/30',
    bg: 'from-orange-500/30 to-red-500/20',
    animate: 'animate-pulse',
  },
  fire: {
    flame: 'text-orange-400',
    glow: 'shadow-orange-400/40 shadow-xl',
    bg: 'from-orange-500/40 to-red-500/30',
    animate: 'animate-pulse',
  },
  inferno: {
    flame: 'text-yellow-400',
    glow: 'shadow-yellow-400/50 shadow-2xl',
    bg: 'from-yellow-500/40 to-orange-500/40',
    animate: 'animate-bounce',
  },
}

const sizes = {
  sm: { icon: 24, text: 'text-lg', container: 'p-3' },
  md: { icon: 40, text: 'text-3xl', container: 'p-4' },
  lg: { icon: 56, text: 'text-5xl', container: 'p-6' },
}

export default function StreakDisplay({
  count,
  intensity,
  size = 'md',
  showLabel = true,
  onClick,
}: StreakDisplayProps) {
  const styles = intensityStyles[intensity]
  const sizeConfig = sizes[size]

  const Container = onClick ? 'button' : 'div'

  return (
    <Container
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center
        rounded-2xl bg-gradient-to-br ${styles.bg}
        border border-white/10
        ${sizeConfig.container}
        ${styles.glow}
        ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}
      `}
    >
      {/* Flame icon with animation */}
      <div className={`relative ${styles.animate}`}>
        <Flame
          size={sizeConfig.icon}
          className={styles.flame}
          fill="currentColor"
        />
        {/* Glow effect behind flame */}
        {intensity !== 'cold' && (
          <div
            className={`absolute inset-0 blur-xl ${styles.flame} opacity-50 -z-10`}
            style={{ transform: 'scale(1.5)' }}
          >
            <Flame size={sizeConfig.icon} fill="currentColor" />
          </div>
        )}
      </div>

      {/* Streak count */}
      <span className={`font-bold ${sizeConfig.text} mt-1`}>{count}</span>

      {/* Label */}
      {showLabel && (
        <span className="text-xs text-neutral-400 mt-0.5">
          {count === 1 ? 'day' : 'days'}
        </span>
      )}

      {/* Sparkle effects for high streaks */}
      {intensity === 'inferno' && (
        <>
          <div className="absolute top-1 right-2 w-1 h-1 bg-yellow-300 rounded-full animate-ping" />
          <div className="absolute top-3 left-2 w-1 h-1 bg-orange-300 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
          <div className="absolute bottom-4 right-3 w-1 h-1 bg-yellow-200 rounded-full animate-ping" style={{ animationDelay: '0.6s' }} />
        </>
      )}
    </Container>
  )
}
