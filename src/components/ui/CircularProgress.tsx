interface CircularProgressProps {
  progress: number // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl'
  strokeWidth?: number
  variant?: 'primary' | 'secondary' | 'accent' | 'fire' | 'purple' | 'orange' | 'red' | 'blue'
  showValue?: boolean
  valueLabel?: string
  children?: React.ReactNode
  className?: string
}

const sizes = {
  sm: 48,
  md: 80,
  lg: 120,
  xl: 160,
}

const defaultStrokes = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 10,
}

const gradients = {
  primary: { from: '#1976d2', to: '#22d3ee' }, // primary to cyan-400
  secondary: { from: '#26a69a', to: '#34d399' }, // secondary to emerald-400
  accent: { from: '#9c27b0', to: '#f472b6' }, // accent to pink-400
  fire: { from: '#f97316', to: '#facc15' }, // orange-500 to yellow-400
  // Page-specific colors
  purple: { from: '#8b5cf6', to: '#c084fc' }, // violet-500 to violet-400 (Fasting)
  orange: { from: '#f97316', to: '#fb923c' }, // orange-500 to orange-400 (Meals)
  red: { from: '#ef4444', to: '#f87171' }, // red-500 to red-400 (Workouts)
  blue: { from: '#3b82f6', to: '#60a5fa' }, // blue-500 to blue-400 (Activity)
}

export default function CircularProgress({
  progress,
  size = 'md',
  strokeWidth,
  variant = 'primary',
  showValue = false,
  valueLabel,
  children,
  className = '',
}: CircularProgressProps) {
  const diameter = sizes[size]
  const stroke = strokeWidth ?? defaultStrokes[size]
  const radius = (diameter - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference
  const gradientId = `gradient-${variant}-${size}`
  const { from, to } = gradients[variant]

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={diameter}
        height={diameter}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-neutral-800"
        />
        {/* Progress arc */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
        {showValue && !children && (
          <>
            <span className={`font-bold ${size === 'xl' ? 'text-3xl' : size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm'}`}>
              {Math.round(progress)}%
            </span>
            {valueLabel && (
              <span className="text-xs text-neutral-400">{valueLabel}</span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
