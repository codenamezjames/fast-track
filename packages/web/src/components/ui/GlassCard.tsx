import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  gradient?: 'primary' | 'secondary' | 'accent' | 'fire' | 'none'
  glowEffect?: boolean
  onClick?: () => void
  as?: 'button' | 'div'
}

const gradientClasses = {
  primary: 'from-primary to-cyan-400',
  secondary: 'from-secondary to-emerald-400',
  accent: 'from-accent to-pink-400',
  fire: 'from-orange-500 to-yellow-400',
  none: '',
}

export default function GlassCard({
  children,
  className = '',
  gradient = 'none',
  glowEffect = false,
  onClick,
  as = 'div',
}: GlassCardProps) {
  const Component = onClick ? 'button' : as

  return (
    <Component
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/5 backdrop-blur-md
        border border-white/10
        shadow-xl
        ${glowEffect ? 'shadow-primary/20' : ''}
        ${onClick ? 'cursor-pointer hover:bg-white/10 transition-colors text-left w-full' : ''}
        ${className}
      `}
    >
      {/* Gradient accent bar at top */}
      {gradient !== 'none' && (
        <div
          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradientClasses[gradient]}`}
        />
      )}
      {children}
    </Component>
  )
}
