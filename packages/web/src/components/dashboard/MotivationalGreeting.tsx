import { Flame } from 'lucide-react'

interface MotivationalGreetingProps {
  streak: number
  isFasting: boolean
  fastingProgress: number
  workoutsThisWeek: number
  caloriesProgress: number // 0-100
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good nightt'
}

function getMotivationalMessage({
  streak,
  isFasting,
  fastingProgress,
  workoutsThisWeek,
  caloriesProgress,
}: MotivationalGreetingProps): string {
  // Priority: Active fasting > Streak celebration > Workout praise > General encouragement

  if (isFasting) {
    if (fastingProgress >= 90) {
      return "Almost there! The finish line is in sight!"
    } else if (fastingProgress >= 75) {
      return "You're crushing it! Final stretch!"
    } else if (fastingProgress >= 50) {
      return "Halfway through! Stay strong!"
    } else {
      return "Your fast is underway. You've got this!"
    }
  }

  if (streak >= 14) {
    return `Incredible! ${streak} days of discipline!`
  } else if (streak >= 7) {
    return `${streak} day streak! You're unstoppable!`
  } else if (streak >= 3) {
    return `${streak} days strong! Keep the momentum!`
  } else if (streak > 0) {
    return `${streak} day streak! Building great habits!`
  }

  if (workoutsThisWeek >= 4) {
    return "Crushing your workout goals this week!"
  } else if (workoutsThisWeek >= 2) {
    return "Great workout consistency!"
  }

  if (caloriesProgress >= 80 && caloriesProgress <= 110) {
    return "Right on track with nutrition today!"
  }

  // Default fallbacks
  const defaults = [
    "Every step counts. Let's make today great!",
    "Your future self will thank you!",
    "Consistency beats perfection!",
    "Small progress is still progress!",
  ]
  return defaults[Math.floor(Math.random() * defaults.length)]
}

export default function MotivationalGreeting(props: MotivationalGreetingProps) {
  const greeting = getGreeting()
  const message = getMotivationalMessage(props)

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl font-bold mb-1">{greeting}!</h1>
      <div className="flex items-center gap-2">
        {props.streak > 0 && (
          <div className="relative">
            <Flame size={18} className="text-orange-400" fill="currentColor" />
            <div className="absolute inset-0 blur-md bg-orange-400/40 -z-10" />
          </div>
        )}
        <p className="text-neutral-400">{message}</p>
      </div>
    </div>
  )
}
