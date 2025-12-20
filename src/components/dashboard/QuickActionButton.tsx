import type { ReactNode } from 'react'

interface QuickActionButtonProps {
  icon: ReactNode
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
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
        ${
          variant === 'primary'
            ? 'bg-gradient-to-r from-primary to-cyan-500 text-white hover:opacity-90 shadow-lg shadow-primary/25'
            : 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700'
        }
      `}
    >
      {icon}
      {label}
    </button>
  )
}
