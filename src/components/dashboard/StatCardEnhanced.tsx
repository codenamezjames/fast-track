import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import CircularProgress from '../ui/CircularProgress'

interface StatCardEnhancedProps {
  icon: ReactNode
  label: string
  value: string | number
  goal?: number
  current?: number
  subtext?: string
  trend?: { value: number; direction: 'up' | 'down' | 'neutral' }
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'accent'
  className?: string
}

const iconGradients = {
  primary: 'from-primary/30 to-cyan-400/30',
  secondary: 'from-secondary/30 to-emerald-400/30',
  accent: 'from-accent/30 to-pink-400/30',
}

const iconColors = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  accent: 'text-accent',
}

export default function StatCardEnhanced({
  icon,
  label,
  value,
  goal,
  current,
  subtext,
  trend,
  onClick,
  variant = 'primary',
  className = '',
}: StatCardEnhancedProps) {
  const progress = goal && current !== undefined ? (current / goal) * 100 : undefined

  return (
    <GlassCard onClick={onClick} className={`p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {/* Icon with gradient background */}
          <div
            className={`p-2.5 rounded-xl bg-gradient-to-br ${iconGradients[variant]}`}
          >
            <div className={iconColors[variant]}>{icon}</div>
          </div>
          {/* Text content */}
          <div>
            <span className="text-xs text-neutral-400 block">{label}</span>
            <div className="text-xl font-bold mt-0.5">{value}</div>
            {subtext && (
              <span className="text-xs text-neutral-500">{subtext}</span>
            )}
          </div>
        </div>
        {/* Mini progress ring */}
        {progress !== undefined && (
          <CircularProgress
            size="sm"
            progress={progress}
            variant={variant}
            showValue
          />
        )}
      </div>
      {/* Trend indicator */}
      {trend && trend.direction !== 'neutral' && (
        <div
          className={`flex items-center gap-1 mt-2 text-xs ${
            trend.direction === 'up' ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {trend.direction === 'up' ? (
            <TrendingUp size={12} />
          ) : (
            <TrendingDown size={12} />
          )}
          <span>{trend.value > 0 ? '+' : ''}{trend.value}</span>
        </div>
      )}
    </GlassCard>
  )
}
