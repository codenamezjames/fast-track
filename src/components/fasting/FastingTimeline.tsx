interface FastingTimelineProps {
  elapsedMs: number
  goalHours: number
}

export default function FastingTimeline({ elapsedMs, goalHours }: FastingTimelineProps) {
  const goalMs = goalHours * 60 * 60 * 1000
  const progress = Math.min(100, (elapsedMs / goalMs) * 100)

  // Define fasting stages (in hours)
  const stages = [
    { hours: 0, label: 'Start', description: 'Fast begins' },
    { hours: 4, label: '4h', description: 'Blood sugar drops' },
    { hours: 12, label: '12h', description: 'Entering ketosis' },
    { hours: 16, label: '16h', description: 'Fat burning mode' },
    { hours: 18, label: '18h', description: 'Autophagy begins' },
    { hours: 24, label: '24h', description: 'Deep autophagy' },
  ].filter(s => s.hours <= goalHours + 2)

  const getStagePosition = (hours: number) => {
    return Math.min(100, (hours / goalHours) * 100)
  }

  const getCurrentStage = () => {
    const elapsedHours = elapsedMs / (60 * 60 * 1000)
    for (let i = stages.length - 1; i >= 0; i--) {
      if (elapsedHours >= stages[i].hours) {
        return stages[i]
      }
    }
    return stages[0]
  }

  const currentStage = getCurrentStage()

  return (
    <div className="space-y-4">
      {/* Current stage indicator */}
      <div className="text-center">
        <div className="text-sm text-neutral-400">Current Stage</div>
        <div className="text-lg font-semibold text-primary">{currentStage.description}</div>
      </div>

      {/* Timeline bar */}
      <div className="relative pt-2 pb-8">
        {/* Background track */}
        <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
          {/* Progress fill */}
          <div
            className="h-full bg-gradient-to-r from-primary via-cyan-400 to-green-400 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stage markers */}
        <div className="relative">
          {stages.map((stage, index) => {
            const position = getStagePosition(stage.hours)
            const isPassed = progress >= position
            const isCurrent = currentStage.hours === stage.hours

            return (
              <div
                key={index}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${position}%`, top: '-6px' }}
              >
                {/* Marker dot */}
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    isPassed
                      ? 'bg-primary border-primary'
                      : 'bg-neutral-900 border-neutral-600'
                  } ${isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-neutral-900' : ''}`}
                />
                {/* Label */}
                <div
                  className={`absolute top-5 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap ${
                    isPassed ? 'text-primary' : 'text-neutral-500'
                  }`}
                >
                  {stage.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Goal marker */}
      <div className="flex justify-between text-sm">
        <span className="text-neutral-400">0h</span>
        <span className="text-primary font-medium">{goalHours}h goal</span>
      </div>
    </div>
  )
}
