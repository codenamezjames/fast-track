import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'

interface DailyGoalCelebrationProps {
  onComplete: () => void
}

export default function DailyGoalCelebration({ onComplete }: DailyGoalCelebrationProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter')

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase('show'), 50)
    const exitTimer = setTimeout(() => setPhase('exit'), 2200)
    const completeTimer = setTimeout(onComplete, 2700)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/80 backdrop-blur-sm
        transition-opacity duration-300
        ${phase === 'enter' ? 'opacity-0' : phase === 'exit' ? 'opacity-0' : 'opacity-100'}
      `}
      onClick={onComplete}
    >
      {/* Fire glow background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div
          className={`
            w-[500px] h-[500px] rounded-full
            bg-gradient-radial from-orange-500/40 via-yellow-500/20 to-transparent
            transition-all duration-700 ease-out
            ${phase === 'show' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
          `}
        />
      </div>

      {/* Fire particles */}
      {phase === 'show' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 bottom-1/2"
              style={{
                animation: `fireParticle 1.5s ease-out forwards`,
                animationDelay: `${i * 0.08}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: ['#f97316', '#facc15', '#fb923c', '#fbbf24', '#f59e0b'][i % 5],
                  boxShadow: `0 0 10px ${['#f97316', '#facc15', '#fb923c'][i % 3]}`,
                  transform: `translateX(${(Math.random() - 0.5) * 200}px)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Ember particles floating up */}
      {phase === 'show' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={`ember-${i}`}
              className="absolute rounded-full animate-pulse"
              style={{
                width: `${4 + Math.random() * 6}px`,
                height: `${4 + Math.random() * 6}px`,
                left: `${30 + Math.random() * 40}%`,
                bottom: '30%',
                background: `radial-gradient(circle, #facc15 0%, #f97316 100%)`,
                boxShadow: '0 0 8px #f97316',
                animation: `emberFloat ${2 + Math.random()}s ease-out forwards`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main content */}
      <div
        className={`
          relative flex flex-col items-center
          transition-all duration-500 ease-out
          ${phase === 'show' ? 'scale-100 translate-y-0' : 'scale-50 translate-y-8'}
        `}
      >
        {/* Fire icon stack */}
        <div className="relative">
          {/* Glow layers */}
          <div className="absolute inset-0 blur-3xl">
            <Flame size={140} className="text-orange-500/60" fill="currentColor" />
          </div>
          <div className="absolute inset-0 blur-xl">
            <Flame size={140} className="text-yellow-500/40" fill="currentColor" />
          </div>

          {/* Main flame with animation */}
          <div
            className={`
              relative
              ${phase === 'show' ? 'animate-bounce' : ''}
            `}
            style={{
              animation: phase === 'show' ? 'flameWobble 0.5s ease-in-out infinite' : undefined,
            }}
          >
            <Flame
              size={140}
              className="text-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.8)]"
              fill="url(#fireGradient)"
            />
            {/* Inner flame */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Flame
                size={80}
                className="text-yellow-400 translate-y-4"
                fill="currentColor"
              />
            </div>
          </div>

          {/* SVG gradient definition */}
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="fireGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="30%" stopColor="#f97316" />
                <stop offset="70%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Text */}
        <div
          className={`
            mt-6 text-center
            transition-all duration-500 delay-200
            ${phase === 'show' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <h2 className="text-3xl font-bold text-white mb-2">Streak Saved!</h2>
          <p className="text-orange-400 font-medium">You're on fire today!</p>
        </div>
      </div>

      {/* CSS for custom animations */}
      <style>{`
        @keyframes fireParticle {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-300px) scale(0);
            opacity: 0;
          }
        }

        @keyframes emberFloat {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-400px) translateX(${Math.random() > 0.5 ? '' : '-'}${20 + Math.random() * 40}px) scale(0.3);
            opacity: 0;
          }
        }

        @keyframes flameWobble {
          0%, 100% {
            transform: scaleX(1) scaleY(1);
          }
          25% {
            transform: scaleX(0.95) scaleY(1.05);
          }
          50% {
            transform: scaleX(1.02) scaleY(0.98);
          }
          75% {
            transform: scaleX(0.98) scaleY(1.02);
          }
        }
      `}</style>
    </div>
  )
}
