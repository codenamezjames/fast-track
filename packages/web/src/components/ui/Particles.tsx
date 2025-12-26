interface ParticlesProps {
  count?: number
  colors?: string[]
  className?: string
}

export default function Particles({
  count = 20,
  colors = ['#f97316', '#facc15', '#22d3ee', '#a855f7', '#22c55e'],
  className = '',
}: ParticlesProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${1 + Math.random()}s`,
          }}
        />
      ))}
    </div>
  )
}
