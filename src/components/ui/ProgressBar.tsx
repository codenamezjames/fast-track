interface ProgressBarProps {
  progress: number // 0-100
  stages?: { position: number; label: string }[]
  showPercentage?: boolean
  height?: 'sm' | 'md' | 'lg'
}

export default function ProgressBar({
  progress,
  stages,
  showPercentage = false,
  height = 'md',
}: ProgressBarProps) {
  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }

  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className="relative">
      <div className={`w-full bg-neutral-800 rounded-full ${heights[height]} overflow-hidden`}>
        <div
          className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all duration-500"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      {stages && (
        <div className="relative mt-1">
          {stages.map((stage, index) => (
            <div
              key={index}
              className="absolute transform -translate-x-1/2"
              style={{ left: `${stage.position}%` }}
            >
              <div
                className={`w-1 h-2 mx-auto ${
                  clampedProgress >= stage.position
                    ? 'bg-primary'
                    : 'bg-neutral-600'
                }`}
              />
              <span className="text-xs text-neutral-400 whitespace-nowrap">
                {stage.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {showPercentage && (
        <div className="text-center mt-1 text-sm text-neutral-400">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  )
}
