import { Timer, Play, Flame } from 'lucide-react'
import CircularProgress from '../ui/CircularProgress'

interface HeroFastingCardProps {
  isActive: boolean
  elapsedMs: number
  goalHours: number
  progress: number
  streak: number
  onNavigate: () => void
}

function formatTime(ms: number): { hours: string; minutes: string; label: string } {
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    label: `${hours}h ${minutes}m`,
  }
}

export default function HeroFastingCard({
  isActive,
  elapsedMs,
  goalHours,
  progress,
  streak,
  onNavigate,
}: HeroFastingCardProps) {
  const time = formatTime(elapsedMs)

  if (!isActive) {
    // Start fasting card
    return (
      <button
        onClick={onNavigate}
        className="w-full animate-fade-in-up stagger-1"
      >
        <div className="glass rounded-3xl p-6 hover:bg-white/10 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-violet-500 to-violet-400 p-4 rounded-2xl">
                <Timer size={28} className="text-white" />
              </div>
              <div className="text-left">
                <div className="text-lg font-semibold">Start a Fast</div>
                <div className="text-sm text-neutral-400 flex items-center gap-2">
                  {streak > 0 ? (
                    <>
                      <Flame size={14} className="text-orange-400" fill="currentColor" />
                      <span>{streak} day streak</span>
                    </>
                  ) : (
                    'Begin intermittent fasting'
                  )}
                </div>
              </div>
            </div>
            <div className="bg-violet-500/20 p-3 rounded-full">
              <Play size={24} className="text-violet-400" fill="currentColor" />
            </div>
          </div>
        </div>
      </button>
    )
  }

  // Active fasting card
  return (
    <button
      onClick={onNavigate}
      className="w-full animate-fade-in-up stagger-1"
    >
      <div className="p-[2px] rounded-3xl bg-gradient-to-r from-violet-500 via-violet-400 to-violet-500 animate-pulse-glow">
        <div className="bg-neutral-900 rounded-3xl p-6">
          <div className="flex flex-col items-center">
            {/* Circular progress */}
            <CircularProgress
              progress={progress}
              size="xl"
              variant="purple"
              className="mb-4"
            >
              <div className="text-center">
                <div className="text-3xl font-bold tracking-tight">
                  {time.hours}:{time.minutes}
                </div>
                <div className="text-xs text-neutral-400">elapsed</div>
              </div>
            </CircularProgress>

            {/* Goal info */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Timer size={16} className="text-violet-400" />
                <span className="text-neutral-400">{goalHours}h goal</span>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-orange-400" fill="currentColor" />
                  <span className="text-neutral-400">{streak} day streak</span>
                </div>
              )}
            </div>

            {/* Progress text */}
            <div className="mt-3 text-sm font-medium gradient-text-purple">
              {progress >= 100
                ? 'Goal reached! Tap to complete'
                : `${Math.round(progress)}% complete`}
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}
