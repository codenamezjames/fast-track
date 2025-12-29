import { Flame } from 'lucide-react'
import { useStreakStore, MILESTONES } from '../../stores/streakStore'

export default function MilestoneProgress() {
  const { streakData } = useStreakStore()
  const { currentStreak, milestonesAchieved } = streakData

  // Find next milestone
  const nextMilestone = MILESTONES.find((m) => m > currentStreak) ?? MILESTONES[MILESTONES.length - 1]
  const prevMilestone = MILESTONES.filter((m) => m <= currentStreak).pop() ?? 0

  // Calculate progress to next milestone
  const progressRange = nextMilestone - prevMilestone
  const currentProgress = currentStreak - prevMilestone
  const progressPercent = progressRange > 0 ? (currentProgress / progressRange) * 100 : 100

  const daysToGo = nextMilestone - currentStreak
  const isClose = daysToGo <= 3 && daysToGo > 0

  // SVG dimensions
  const size = 200
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progressPercent / 100) * circumference

  // Milestone marker position (at the target point on the ring)
  const targetAngle = -90 + 360 // Full circle position for target
  const markerX = size / 2 + radius * Math.cos((targetAngle * Math.PI) / 180)
  const markerY = size / 2 + radius * Math.sin((targetAngle * Math.PI) / 180)

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${isClose ? 'animate-pulse' : ''}`}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="fire-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            {isClose && (
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            )}
          </defs>

          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-neutral-800"
          />

          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#fire-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
            filter={isClose ? 'url(#glow)' : undefined}
          />

          {/* Next milestone marker */}
          <circle
            cx={markerX}
            cy={markerY}
            r={8}
            fill="#171717"
            stroke="#facc15"
            strokeWidth={2}
            className="transform rotate-90"
            style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Flame
            size={32}
            className={`text-orange-500 mb-1 ${currentStreak > 0 ? 'animate-[wiggle_0.5s_ease-in-out_infinite]' : ''}`}
          />
          <span className="text-4xl font-bold text-white">{currentStreak}</span>
          <span className="text-sm text-neutral-400">day streak</span>
        </div>
      </div>

      {/* Milestone info */}
      <div className="mt-4 text-center">
        {daysToGo > 0 ? (
          <>
            <p className={`text-lg font-medium ${isClose ? 'text-yellow-400' : 'text-neutral-300'}`}>
              {daysToGo} day{daysToGo !== 1 ? 's' : ''} to {nextMilestone}
            </p>
            <p className="text-sm text-neutral-500">
              {milestonesAchieved.length > 0
                ? `${milestonesAchieved.length} milestone${milestonesAchieved.length !== 1 ? 's' : ''} achieved`
                : 'Keep going!'}
            </p>
          </>
        ) : (
          <p className="text-lg font-medium text-yellow-400">
            All milestones achieved!
          </p>
        )}
      </div>
    </div>
  )
}
