import type { ReactNode } from 'react'

interface StreakBadgeProps {
  icon: ReactNode
  count: number
  label: string
  variant?: 'fire' | 'primary' | 'secondary' | 'accent'
  active?: boolean
}

const variantStyles = {
  fire: {
    active: 'bg-gradient-to-r from-orange-500/20 to-yellow-400/20 border-orange-500/40',
    inactive: 'bg-neutral-800/50 border-neutral-700/50',
    iconActive: 'text-orange-400',
    iconInactive: 'text-neutral-500',
  },
  primary: {
    active: 'bg-gradient-to-r from-primary/20 to-cyan-400/20 border-primary/40',
    inactive: 'bg-neutral-800/50 border-neutral-700/50',
    iconActive: 'text-primary',
    iconInactive: 'text-neutral-500',
  },
  secondary: {
    active: 'bg-gradient-to-r from-secondary/20 to-emerald-400/20 border-secondary/40',
    inactive: 'bg-neutral-800/50 border-neutral-700/50',
    iconActive: 'text-secondary',
    iconInactive: 'text-neutral-500',
  },
  accent: {
    active: 'bg-gradient-to-r from-accent/20 to-pink-400/20 border-accent/40',
    inactive: 'bg-neutral-800/50 border-neutral-700/50',
    iconActive: 'text-accent',
    iconInactive: 'text-neutral-500',
  },
}

export default function StreakBadge({
  icon,
  count,
  label,
  variant = 'primary',
  active = false,
}: StreakBadgeProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-full
        border whitespace-nowrap
        ${active ? styles.active : styles.inactive}
      `}
    >
      <span className={active ? styles.iconActive : styles.iconInactive}>
        {icon}
      </span>
      <span className={`font-bold ${active ? 'text-white' : 'text-neutral-400'}`}>
        {count}
      </span>
      <span className="text-xs text-neutral-400">{label}</span>
    </div>
  )
}
