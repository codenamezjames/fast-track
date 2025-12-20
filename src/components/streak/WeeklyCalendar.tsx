import { Flame, Check, Snowflake } from 'lucide-react'
import type { DailyActivity } from '../../stores/streakStore'

interface WeeklyCalendarProps {
  activities: DailyActivity[]
  freezeUsedDates?: string[]
}

const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function getDayName(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return DAY_NAMES[date.getDay()]
}

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}

function isFuture(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return dateStr > today
}

export default function WeeklyCalendar({
  activities,
  freezeUsedDates = [],
}: WeeklyCalendarProps) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-neutral-300">This Week</h3>
        <span className="text-xs text-neutral-500">
          {activities.filter((a) => a.streakMaintained).length}/7 days
        </span>
      </div>

      <div className="flex justify-between gap-1">
        {activities.map((activity) => {
          const today = isToday(activity.date)
          const future = isFuture(activity.date)
          const completed = activity.streakMaintained
          const freezeUsed = freezeUsedDates.includes(activity.date)

          return (
            <div
              key={activity.date}
              className="flex flex-col items-center gap-1.5"
            >
              {/* Day name */}
              <span
                className={`text-xs ${
                  today ? 'text-primary font-medium' : 'text-neutral-500'
                }`}
              >
                {getDayName(activity.date)}
              </span>

              {/* Status circle */}
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${
                    completed
                      ? 'bg-gradient-to-br from-orange-500 to-yellow-500 shadow-lg shadow-orange-500/30'
                      : freezeUsed
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30'
                      : future
                      ? 'bg-neutral-800/50 border border-neutral-700/50'
                      : today
                      ? 'bg-neutral-800 border-2 border-primary'
                      : 'bg-neutral-800/50 border border-neutral-700/50'
                  }
                `}
              >
                {completed ? (
                  <Flame size={18} className="text-white" fill="currentColor" />
                ) : freezeUsed ? (
                  <Snowflake size={18} className="text-white" />
                ) : future ? (
                  <span className="text-neutral-600 text-xs">
                    {new Date(activity.date + 'T00:00:00').getDate()}
                  </span>
                ) : today ? (
                  <span className="text-primary text-xs font-medium">
                    {new Date(activity.date + 'T00:00:00').getDate()}
                  </span>
                ) : (
                  <span className="text-neutral-500 text-xs">
                    {new Date(activity.date + 'T00:00:00').getDate()}
                  </span>
                )}
              </div>

              {/* Activity indicators */}
              <div className="flex gap-0.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    activity.fastCompleted ? 'bg-primary' : 'bg-neutral-700'
                  }`}
                  title="Fast"
                />
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    activity.mealsLogged ? 'bg-secondary' : 'bg-neutral-700'
                  }`}
                  title="Meals"
                />
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    activity.workoutCompleted ? 'bg-accent' : 'bg-neutral-700'
                  }`}
                  title="Workout"
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-neutral-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>Fast</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-secondary" />
          <span>Meals</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span>Workout</span>
        </div>
      </div>
    </div>
  )
}
