import { Snowflake } from 'lucide-react'

interface StreakFreezeIndicatorProps {
  available: number
  onClick?: () => void
}

export default function StreakFreezeIndicator({
  available,
  onClick,
}: StreakFreezeIndicatorProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-full
        border transition-all
        ${
          available > 0
            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/40 hover:from-cyan-500/30 hover:to-blue-500/30'
            : 'bg-neutral-800/50 border-neutral-700/50 opacity-60'
        }
      `}
    >
      <div className="relative">
        <Snowflake
          size={18}
          className={available > 0 ? 'text-cyan-400' : 'text-neutral-500'}
        />
        {available > 0 && (
          <div className="absolute inset-0 blur-md bg-cyan-400/40 -z-10" />
        )}
      </div>
      <span
        className={`text-sm font-medium ${
          available > 0 ? 'text-white' : 'text-neutral-500'
        }`}
      >
        {available}
      </span>
      <span className="text-xs text-neutral-400">
        {available === 1 ? 'freeze' : 'freezes'}
      </span>
    </button>
  )
}
