import { ReactNode, ButtonHTMLAttributes } from 'react'

type IconButtonVariant = 'primary' | 'orange' | 'red' | 'blue' | 'purple' | 'neutral'
type IconButtonAppearance = 'solid' | 'ghost'
type IconButtonSize = 'sm' | 'md' | 'lg'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  variant?: IconButtonVariant
  appearance?: IconButtonAppearance
  size?: IconButtonSize
}

const solidVariants: Record<IconButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  orange: 'bg-orange-500 text-white hover:bg-orange-600',
  red: 'bg-red-500 text-white hover:bg-red-600',
  blue: 'bg-blue-500 text-white hover:bg-blue-600',
  purple: 'bg-violet-500 text-white hover:bg-violet-600',
  neutral: 'bg-neutral-700 text-white hover:bg-neutral-600',
}

const ghostVariants: Record<IconButtonVariant, string> = {
  primary: 'text-neutral-400 hover:text-primary hover:bg-primary/10',
  orange: 'text-neutral-400 hover:text-orange-400 hover:bg-orange-400/10',
  red: 'text-neutral-400 hover:text-red-400 hover:bg-red-400/10',
  blue: 'text-neutral-400 hover:text-blue-400 hover:bg-blue-400/10',
  purple: 'text-neutral-400 hover:text-violet-400 hover:bg-violet-400/10',
  neutral: 'text-neutral-400 hover:text-white hover:bg-neutral-700',
}

const sizes: Record<IconButtonSize, string> = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
}

export default function IconButton({
  icon,
  variant = 'primary',
  appearance = 'solid',
  size = 'md',
  className = '',
  disabled,
  ...props
}: IconButtonProps) {
  const variantStyles = appearance === 'solid' ? solidVariants[variant] : ghostVariants[variant]

  return (
    <button
      className={`
        rounded-full
        transition-colors
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${sizes[size]}
        ${variantStyles}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon}
    </button>
  )
}
