import { useEffect } from 'react'
import { ArrowLeft, Trophy, Calendar, Star, Snowflake } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStreakStore } from '../stores/streakStore'
import MilestoneProgress from '../components/streak/MilestoneProgress'
import MonthlyHeatmap from '../components/streak/MonthlyHeatmap'
import ConsistencyStats from '../components/streak/ConsistencyStats'

export default function Streaks() {
  const navigate = useNavigate()
  const { streakData, fetchStreak, loading } = useStreakStore()
  const { longestStreak, totalActiveDays, milestonesAchieved, freezesAvailable } = streakData

  useEffect(() => {
    fetchStreak()
  }, [fetchStreak])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-neutral-950/95 backdrop-blur-sm border-b border-neutral-800 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft size={20} className="text-neutral-400" />
          </button>
          <h1 className="text-xl font-bold text-white">Your Streak Journey</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Milestone Progress */}
        <section>
          <MilestoneProgress />
        </section>

        {/* Monthly Heatmap */}
        <section>
          <MonthlyHeatmap />
        </section>

        {/* Consistency Stats */}
        <section>
          <h3 className="text-lg font-semibold text-white mb-3">Patterns & Insights</h3>
          <ConsistencyStats />
        </section>

        {/* Stats Summary */}
        <section className="bg-neutral-900 rounded-xl p-4">
          <h3 className="text-sm font-medium text-neutral-400 mb-4">All-Time Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Trophy size={20} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{longestStreak}</p>
                <p className="text-xs text-neutral-500">Best Streak</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Calendar size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalActiveDays}</p>
                <p className="text-xs text-neutral-500">Active Days</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Star size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{milestonesAchieved.length}</p>
                <p className="text-xs text-neutral-500">Milestones</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Snowflake size={20} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{freezesAvailable}</p>
                <p className="text-xs text-neutral-500">Freezes Left</p>
              </div>
            </div>
          </div>
        </section>

        {/* Milestones Achieved */}
        {milestonesAchieved.length > 0 && (
          <section className="bg-neutral-900 rounded-xl p-4">
            <h3 className="text-sm font-medium text-neutral-400 mb-3">Milestones Achieved</h3>
            <div className="flex flex-wrap gap-2">
              {milestonesAchieved.sort((a, b) => a - b).map((milestone) => (
                <div
                  key={milestone}
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30"
                >
                  <span className="text-sm font-medium text-orange-300">{milestone} days</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
