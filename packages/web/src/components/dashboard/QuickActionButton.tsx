import type { ReactNode } from 'react'

interface QuickActionButtonProps {
  icon: ReactNode
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'purple' | 'orange' | 'red' | 'blue'
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-primary to-cyan-500 text-white hover:opacity-90 shadow-lg shadow-primary/25',
  secondary: 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700',
  purple: 'bg-gradient-to-r from-violet-500 to-violet-400 text-white hover:opacity-90 shadow-lg shadow-violet-500/25',
  orange: 'bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:opacity-90 shadow-lg shadow-orange-500/25',
  red: 'bg-gradient-to-r from-red-500 to-red-400 text-white hover:opacity-90 shadow-lg shadow-red-500/25',
  blue: 'bg-gradient-to-r from-blue-500 to-blue-400 text-white hover:opacity-90 shadow-lg shadow-blue-500/25',
}

export default function QuickActionButton({
  icon,
  label,
  onClick,
  variant = 'primary',
}: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-2
        py-4 px-4 rounded-2xl
        font-medium
        transition-all duration-200
        ${variantStyles[variant]}
      `}
    >
      {icon}
      {label}
    </button>
  )
}
