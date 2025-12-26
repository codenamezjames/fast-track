import { Timer, Utensils, Dumbbell, Sparkles } from 'lucide-react'

interface NextActionSuggestionProps {
  fastCompleted: boolean
  mealsLogged: boolean
  workoutCompleted: boolean
  allComplete: boolean
  onNavigate: (path: string) => void
}

export default function NextActionSuggestion({
  fastCompleted,
  mealsLogged,
  workoutCompleted,
  allComplete,
  onNavigate,
}: NextActionSuggestionProps) {
  if (allComplete) {
    return (
      <div className="h-full glass rounded-xl p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center shrink-0">
          <Sparkles size={16} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-green-400">All done!</div>
          <div className="text-xs text-neutral-500">Streak secured for today</div>
        </div>
      </div>
    )
  }

  // Find the next uncompleted action to suggest
  const suggestions = [
    {
      completed: fastCompleted,
      icon: Timer,
      label: 'Complete a fast',
      sublabel: 'Start intermittent fasting',
      path: '/fasting',
      color: 'from-violet-500 to-violet-400',
    },
    {
      completed: mealsLogged,
      icon: Utensils,
      label: 'Log your meals',
      sublabel: 'Track what you eat',
      path: '/meals',
      color: 'from-orange-500 to-orange-400',
    },
    {
      completed: workoutCompleted,
      icon: Dumbbell,
      label: 'Do a workout',
      sublabel: 'Get moving today',
      path: '/workouts',
      color: 'from-red-500 to-red-400',
    },
  ]

  const nextAction = suggestions.find((s) => !s.completed)

  if (!nextAction) return null

  const Icon = nextAction.icon

  return (
    <button
      onClick={() => onNavigate(nextAction.path)}
      className="w-full h-full glass rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left"
    >
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${nextAction.color} flex items-center justify-center shrink-0`}>
        <Icon size={16} className="text-white" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">{nextAction.label}</div>
        <div className="text-xs text-neutral-500">{nextAction.sublabel}</div>
      </div>
      <div className="text-xs text-neutral-500">Next up</div>
    </button>
  )
}
