import { useEffect, useState } from 'react'
import { Play, Square, Flame, Clock, Trophy, Trash2 } from 'lucide-react'
import { useFastingStore, type FastingSession } from '../stores/fastingStore'
import FastingTimeline from '../components/fasting/FastingTimeline'
import FastingPresets from '../components/fasting/FastingPresets'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import SuccessCelebration from '../components/ui/SuccessCelebration'

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  return 'Just now'
}

export default function Fasting() {
  const {
    currentFast,
    history,
    selectedPreset,
    loading,
    setPreset,
    startFast,
    endFast,
    deleteFast,
    subscribeToFasts,
    cleanup,
    getStreak,
  } = useFastingStore()

  const [elapsedMs, setElapsedMs] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedFast, setSelectedFast] = useState<FastingSession | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  // Subscribe to fasts on mount
  useEffect(() => {
    subscribeToFasts()
    return () => cleanup()
  }, [])

  // Update elapsed time every second when fasting
  useEffect(() => {
    if (!currentFast) {
      setElapsedMs(0)
      return
    }

    const updateElapsed = () => {
      const now = new Date()
      const elapsed = now.getTime() - currentFast.startTime.getTime()
      setElapsedMs(elapsed)
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)
    return () => clearInterval(interval)
  }, [currentFast])

  const isFasting = !!currentFast
  const progress = currentFast
    ? Math.min(100, (elapsedMs / (currentFast.goalHours * 60 * 60 * 1000)) * 100)
    : 0
  const isComplete = progress >= 100
  const streak = getStreak()

  const handleToggleFast = async () => {
    if (isFasting) {
      await endFast(isComplete)
      if (isComplete) {
        setShowCelebration(true)
      }
    } else {
      await startFast()
    }
  }

  const handleDeleteClick = (fast: FastingSession) => {
    setSelectedFast(fast)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedFast) {
      await deleteFast(selectedFast.id)
      setSelectedFast(null)
    }
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6">Fasting</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-neutral-800 rounded-xl p-3 text-center">
          <Flame size={20} className="mx-auto mb-1 text-orange-400" />
          <div className="text-xl font-semibold">{streak}</div>
          <div className="text-neutral-400 text-xs">Day Streak</div>
        </div>
        <div className="bg-neutral-800 rounded-xl p-3 text-center">
          <Clock size={20} className="mx-auto mb-1 text-violet-400" />
          <div className="text-xl font-semibold">{history.length}</div>
          <div className="text-neutral-400 text-xs">Total Fasts</div>
        </div>
        <div className="bg-neutral-800 rounded-xl p-3 text-center">
          <Trophy size={20} className="mx-auto mb-1 text-yellow-400" />
          <div className="text-xl font-semibold">
            {history.filter((f) => f.completed).length}
          </div>
          <div className="text-neutral-400 text-xs">Completed</div>
        </div>
      </div>

      {/* Main fasting card */}
      <div className="bg-neutral-800 rounded-xl p-6 mb-6">
        {isFasting ? (
          <>
            {/* Timer display */}
            <div className="text-center mb-6">
              <div className="text-5xl font-bold font-mono mb-2">
                {formatDuration(elapsedMs)}
              </div>
              <div className="text-neutral-400">
                {isComplete ? (
                  <span className="text-violet-400">Goal reached!</span>
                ) : (
                  `${currentFast.goalHours}h goal`
                )}
              </div>
            </div>

            {/* Timeline */}
            <FastingTimeline
              elapsedMs={elapsedMs}
              goalHours={currentFast.goalHours}
            />

            {/* End fast button */}
            <Button
              onClick={handleToggleFast}
              variant={isComplete ? 'purple' : 'danger'}
              className="w-full mt-6 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Square size={18} />
              {isComplete ? 'Complete Fast' : 'End Fast Early'}
            </Button>
          </>
        ) : (
          <>
            {/* Preset selector */}
            <div className="mb-6">
              <div className="text-sm text-neutral-400 mb-3">Choose your fasting window</div>
              <FastingPresets
                selected={selectedPreset}
                onSelect={setPreset}
              />
            </div>

            {/* Start fast button */}
            <Button
              onClick={handleToggleFast}
              variant="purple"
              className="w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Play size={18} />
              Start {selectedPreset.name} Fast
            </Button>
          </>
        )}
      </div>

      {/* History */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Fasts</h2>
        {history.length === 0 ? (
          <div className="bg-neutral-800 rounded-xl p-4 text-center text-neutral-400">
            No fasting history yet. Start your first fast!
          </div>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 5).map((fast) => {
              const duration = fast.endTime
                ? fast.endTime.getTime() - fast.startTime.getTime()
                : 0

              return (
                <div
                  key={fast.id}
                  className="bg-neutral-800 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">
                      {fast.goalHours}h fast
                      {fast.completed && (
                        <span className="ml-2 text-xs text-green-400">Completed</span>
                      )}
                    </div>
                    <div className="text-sm text-neutral-400">
                      {formatTimeAgo(fast.startTime)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-mono">{formatDuration(duration)}</div>
                      <div className="text-xs text-neutral-400">duration</div>
                    </div>
                    <button
                      onClick={() => handleDeleteClick(fast)}
                      className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setSelectedFast(null)
        }}
        title="Delete Fast"
        message="Are you sure you want to delete this fasting record? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />

      {showCelebration && (
        <SuccessCelebration
          type="fast"
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </div>
  )
}
