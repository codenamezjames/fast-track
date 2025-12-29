import { ChevronLeft, ChevronRight, Utensils, Dumbbell, Timer } from 'lucide-react'
import { useStreakStore, type DailyActivity } from '../../stores/streakStore'
import { getMonthDates, formatMonthYear, getStartOfMonth, getDateString } from '../../lib/dateUtils'
import { useEffect, useMemo } from 'react'

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function getActivityCount(activity: DailyActivity | undefined): number {
  if (!activity) return 0
  return [activity.fastCompleted, activity.mealsLogged, activity.workoutCompleted].filter(Boolean).length
}

function getCellStyle(activity: DailyActivity | undefined): string {
  const count = getActivityCount(activity)

  if (count === 0) return 'bg-neutral-800/50'
  if (count === 1) return 'bg-orange-900/60'
  if (count === 2) return 'bg-orange-500/70'
  // count === 3 (streak maintained)
  return 'bg-gradient-to-br from-orange-500 via-yellow-400 to-orange-600 shadow-[0_0_8px_rgba(249,115,22,0.5)]'
}

export default function MonthlyHeatmap() {
  const { selectedMonth, monthActivities, historyLoading, setSelectedMonth, fetchMonthHistory } = useStreakStore()

  // Fetch on mount
  useEffect(() => {
    fetchMonthHistory(selectedMonth)
  }, [])

  // Create activity map for quick lookup
  const activityMap = useMemo(() => {
    const map = new Map<string, DailyActivity>()
    monthActivities.forEach((a) => map.set(a.date, a))
    return map
  }, [monthActivities])

  // Generate calendar grid
  const calendarData = useMemo(() => {
    const dates = getMonthDates(selectedMonth)
    const firstDay = new Date(dates[0]).getDay() // 0-6 (Sun-Sat)

    // Pad start with empty cells
    const cells: (string | null)[] = Array(firstDay).fill(null)
    cells.push(...dates)

    // Pad end to complete last week
    while (cells.length % 7 !== 0) {
      cells.push(null)
    }

    // Split into weeks
    const weeks: (string | null)[][] = []
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7))
    }

    return weeks
  }, [selectedMonth])

  const navigateMonth = (delta: number) => {
    const newMonth = new Date(selectedMonth)
    newMonth.setMonth(newMonth.getMonth() + delta)
    setSelectedMonth(newMonth)
  }

  const today = getDateString()
  const isCurrentMonth = getStartOfMonth(selectedMonth).getTime() === getStartOfMonth(new Date()).getTime()

  return (
    <div className="bg-neutral-900 rounded-xl p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <ChevronLeft size={20} className="text-neutral-400" />
        </button>
        <h3 className="text-lg font-semibold text-white">
          {formatMonthYear(selectedMonth)}
        </h3>
        <button
          onClick={() => navigateMonth(1)}
          disabled={isCurrentMonth}
          className={`p-2 rounded-lg transition-colors ${
            isCurrentMonth ? 'opacity-30 cursor-not-allowed' : 'hover:bg-neutral-800'
          }`}
        >
          <ChevronRight size={20} className="text-neutral-400" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium text-neutral-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {historyLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-1">
          {calendarData.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 gap-1">
              {week.map((date, dayIdx) => {
                if (!date) {
                  return <div key={dayIdx} className="aspect-square" />
                }

                const activity = activityMap.get(date)
                const isToday = date === today
                const dayNum = new Date(date).getDate()

                return (
                  <div
                    key={date}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center relative ${getCellStyle(activity)} ${
                      isToday ? 'ring-2 ring-white ring-offset-1 ring-offset-neutral-900' : ''
                    }`}
                  >
                    <span className={`text-xs font-medium ${getActivityCount(activity) >= 2 ? 'text-white' : 'text-neutral-400'}`}>
                      {dayNum}
                    </span>

                    {/* Activity indicators */}
                    {activity && getActivityCount(activity) > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {activity.fastCompleted && (
                          <Timer size={8} className="text-purple-400" />
                        )}
                        {activity.mealsLogged && (
                          <Utensils size={8} className="text-orange-300" />
                        )}
                        {activity.workoutCompleted && (
                          <Dumbbell size={8} className="text-red-400" />
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-neutral-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-neutral-800/50" />
          <span>0</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-900/60" />
          <span>1</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-500/70" />
          <span>2</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-orange-500 to-yellow-400" />
          <span>3+</span>
        </div>
      </div>
    </div>
  )
}
