import type { ReactNode, ButtonHTMLAttributes } from 'react'

type SelectionButtonVariant = 'primary' | 'orange' | 'red' | 'blue' | 'purple'

interface SelectionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean
  variant?: SelectionButtonVariant
  children: ReactNode
}

const selectedVariants: Record<SelectionButtonVariant, string> = {
  primary: 'bg-primary text-white',
  orange: 'bg-orange-500 text-white',
  red: 'bg-red-500 text-white',
  blue: 'bg-blue-500 text-white',
  purple: 'bg-violet-500 text-white',
}

export default function SelectionButton({
  selected,
  variant = 'primary',
  children,
  className = '',
  disabled,
  ...props
}: SelectionButtonProps) {
  return (
    <button
      className={`
        flex-1 py-3 px-2 rounded-xl text-center
        transition-colors
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${selected
          ? selectedVariants[variant]
          : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
        }
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
