import { useState } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'purple' | 'orange' | 'red' | 'blue'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  children: React.ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  animated = true,
  className = '',
  children,
  onClick,
  ...props
}: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const baseStyles = 'font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-neutral-800 text-white hover:bg-neutral-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-neutral-300 hover:bg-neutral-800',
    purple: 'bg-violet-500 text-white hover:bg-violet-600',
    orange: 'bg-orange-500 text-white hover:bg-orange-600',
    red: 'bg-red-500 text-white hover:bg-red-600',
    blue: 'bg-blue-500 text-white hover:bg-blue-600',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5',
    lg: 'px-6 py-3 text-lg',
  }

  const animationStyles = animated
    ? 'transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg'
    : 'transition-colors'

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (animated && !props.disabled) {
      setIsPressed(true)
      setTimeout(() => setIsPressed(false), 150)
    }
    onClick?.(e)
  }

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${animationStyles}
        ${isPressed ? 'animate-success-pulse' : ''}
        ${className}
      `}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}
