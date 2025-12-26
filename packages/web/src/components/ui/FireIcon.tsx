import { Flame } from 'lucide-react'

interface FireIconProps {
  size?: number
  animated?: boolean
  withGlow?: boolean
}

export default function FireIcon({
  size = 80,
  animated = true,
  withGlow = true,
}: FireIconProps) {
  return (
    <div className="relative inline-flex">
      <Flame
        size={size}
        className={`text-orange-400 ${animated ? 'animate-pulse' : ''}`}
        fill="currentColor"
      />
      {withGlow && (
        <div className="absolute inset-0 blur-2xl bg-orange-400/50 -z-10" />
      )}
    </div>
  )
}
