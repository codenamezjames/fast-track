import { Timer, Utensils, Dumbbell } from 'lucide-react'
import { useStreakStore } from '../../stores/streakStore'

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function ConsistencyStats() {
  const { historyStats, historyLoading } = useStreakStore()

  if (historyLoading || !historyStats) {
    return (
      <div className="bg-neutral-900 rounded-xl p-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  const { completionRate, bestDayOfWeek, dayOfWeekBreakdown, activityBreakdown } = historyStats

  // Find max for scaling bars
  const maxDayCount = Math.max(...dayOfWeekBreakdown.map((d) => d.count), 1)
  const maxActivityCount = Math.max(
    activityBreakdown.fasting,
    activityBreakdown.meals,
    activityBreakdown.workouts,
    1
  )

  return (
    <div className="space-y-4">
      {/* Completion Rate */}
      <div className="bg-neutral-900 rounded-xl p-4">
        <h4 className="text-sm font-medium text-neutral-400 mb-3">Completion Rate</h4>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-neutral-800 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <span className="text-lg font-bold text-white min-w-[3rem] text-right">
            {completionRate}%
          </span>
        </div>
      </div>

      {/* Best Day */}
      <div className="bg-neutral-900 rounded-xl p-4">
        <h4 className="text-sm font-medium text-neutral-400 mb-3">Activity by Day of Week</h4>

        {/* Day of week bar chart */}
        <div className="flex items-end justify-between gap-1 h-20 mb-2">
          {dayOfWeekBreakdown.map(({ day, count }) => {
            const height = (count / maxDayCount) * 100
            const isBest = day === bestDayOfWeek && count > 0

            return (
              <div key={day} className="flex-1 flex flex-col items-center">
                <div className="w-full relative" style={{ height: '60px' }}>
                  <div
                    className={`absolute bottom-0 w-full rounded-t transition-all duration-500 ${
                      isBest
                        ? 'bg-gradient-to-t from-orange-500 to-yellow-400'
                        : 'bg-neutral-700'
                    }`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                </div>
                <span className={`text-xs mt-1 ${isBest ? 'text-orange-400 font-medium' : 'text-neutral-500'}`}>
                  {DAYS_OF_WEEK[day].charAt(0)}
                </span>
              </div>
            )
          })}
        </div>

        <p className="text-sm text-neutral-400 text-center">
          Best day: <span className="text-white font-medium">{DAYS_OF_WEEK[bestDayOfWeek]}</span>
        </p>
      </div>

      {/* Activity Breakdown */}
      <div className="bg-neutral-900 rounded-xl p-4">
        <h4 className="text-sm font-medium text-neutral-400 mb-3">Activity Breakdown</h4>

        <div className="space-y-3">
          {/* Fasting */}
          <div className="flex items-center gap-3">
            <Timer size={16} className="text-purple-400" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-neutral-300">Fasting</span>
                <span className="text-sm text-neutral-400">{activityBreakdown.fasting}</span>
              </div>
              <div className="bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${(activityBreakdown.fasting / maxActivityCount) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Meals */}
          <div className="flex items-center gap-3">
            <Utensils size={16} className="text-orange-400" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-neutral-300">Meals Logged</span>
                <span className="text-sm text-neutral-400">{activityBreakdown.meals}</span>
              </div>
              <div className="bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all duration-500"
                  style={{ width: `${(activityBreakdown.meals / maxActivityCount) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Workouts */}
          <div className="flex items-center gap-3">
            <Dumbbell size={16} className="text-red-400" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-neutral-300">Workouts</span>
                <span className="text-sm text-neutral-400">{activityBreakdown.workouts}</span>
              </div>
              <div className="bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-500"
                  style={{ width: `${(activityBreakdown.workouts / maxActivityCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
