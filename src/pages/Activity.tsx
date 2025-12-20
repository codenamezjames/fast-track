import { useEffect, useState } from 'react'
import { Play, Square, MapPin, Timer, Flame, PersonStanding, Bike, Pencil, Trash2 } from 'lucide-react'
import { useActivityStore, type ActivityType, type Activity } from '../stores/activityStore'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import EditActivityModal from '../components/activity/EditActivityModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const activityTypes: { type: ActivityType; label: string; icon: React.ReactNode }[] = [
  { type: 'run', label: 'Run', icon: <PersonStanding size={24} /> },
  { type: 'walk', label: 'Walk', icon: <PersonStanding size={24} /> },
  { type: 'bike', label: 'Bike', icon: <Bike size={24} /> },
]

function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs > 0) {
    return `${hrs}h ${mins}m`
  }
  return `${mins}m`
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
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

export default function Activity() {
  const {
    activities,
    activeSession,
    loading,
    startActivity,
    endActivity,
    cancelActivity,
    updateActivity,
    deleteActivity,
    subscribeToActivities,
    cleanup,
  } = useActivityStore()

  const [elapsedMs, setElapsedMs] = useState(0)
  const [endModalOpen, setEndModalOpen] = useState(false)
  const [distance, setDistance] = useState('')
  const [selectedType, setSelectedType] = useState<ActivityType>('run')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  useEffect(() => {
    subscribeToActivities()
    return () => cleanup()
  }, [])

  useEffect(() => {
    if (!activeSession) {
      setElapsedMs(0)
      return
    }

    const updateElapsed = () => {
      const now = new Date()
      setElapsedMs(now.getTime() - activeSession.startTime.getTime())
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)
    return () => clearInterval(interval)
  }, [activeSession])

  const handleStart = () => {
    startActivity(selectedType)
  }

  const handleStop = () => {
    setEndModalOpen(true)
  }

  const handleSaveActivity = async () => {
    const dist = parseFloat(distance) || 0
    await endActivity(dist)
    setDistance('')
    setEndModalOpen(false)
  }

  const handleCancel = () => {
    cancelActivity()
    setEndModalOpen(false)
  }

  const handleEditClick = (activity: Activity) => {
    setSelectedActivity(activity)
    setEditModalOpen(true)
  }

  const handleDeleteClick = (activity: Activity) => {
    setSelectedActivity(activity)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedActivity) {
      await deleteActivity(selectedActivity.id)
      setSelectedActivity(null)
    }
  }

  const isActive = !!activeSession
  const elapsedMinutes = Math.floor(elapsedMs / 60000)
  const estimatedCalories = isActive
    ? Math.round(elapsedMinutes * (activeSession.type === 'run' ? 10 : activeSession.type === 'bike' ? 8 : 4))
    : 0

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6">Activity</h1>

      <div className="bg-neutral-800 rounded-xl p-6 mb-6">
        {isActive ? (
          <>
            <div className="text-center mb-6">
              <div className="text-sm text-primary mb-2">
                {activeSession.type.charAt(0).toUpperCase() + activeSession.type.slice(1)} in progress
              </div>
              <div className="text-5xl font-bold font-mono">
                {formatElapsed(elapsedMs)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-neutral-700 rounded-xl p-3 text-center">
                <Timer size={20} className="mx-auto mb-1 text-primary" />
                <div className="text-xl font-semibold">{elapsedMinutes}</div>
                <div className="text-neutral-400 text-xs">minutes</div>
              </div>
              <div className="bg-neutral-700 rounded-xl p-3 text-center">
                <Flame size={20} className="mx-auto mb-1 text-orange-400" />
                <div className="text-xl font-semibold">{estimatedCalories}</div>
                <div className="text-neutral-400 text-xs">est. cal</div>
              </div>
            </div>

            <Button
              variant="danger"
              onClick={handleStop}
              className="w-full flex items-center justify-center gap-2"
            >
              <Square size={18} />
              Stop Activity
            </Button>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full mb-4">
                <MapPin size={36} className="text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Start Activity</h2>
              <p className="text-neutral-400 text-sm mt-1">
                Track your runs, walks, and bike rides
              </p>
            </div>

            <div className="flex gap-2 mb-6">
              {activityTypes.map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex-1 py-3 px-2 rounded-xl text-center transition-colors ${
                    selectedType === type
                      ? 'bg-primary text-white'
                      : 'bg-neutral-700 text-neutral-300'
                  }`}
                >
                  <div className="flex justify-center mb-1">{icon}</div>
                  <div className="text-sm">{label}</div>
                </button>
              ))}
            </div>

            <Button
              onClick={handleStart}
              className="w-full flex items-center justify-center gap-2"
            >
              <Play size={18} />
              Start {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
            </Button>
          </>
        )}
      </div>

      {/* Recent Activities */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Activities</h2>
        {activities.length === 0 ? (
          <div className="bg-neutral-800 rounded-xl p-4 text-center text-neutral-400">
            No activities recorded yet. Start your first activity!
          </div>
        ) : (
          <div className="space-y-2">
            {activities.slice(0, 10).map((activity) => (
              <div
                key={activity.id}
                className="bg-neutral-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium capitalize">{activity.type}</div>
                  <div className="text-sm text-neutral-400">
                    {formatTimeAgo(activity.startTime)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold">{activity.distance.toFixed(1)} km</div>
                    <div className="text-xs text-neutral-400">
                      {formatDuration(activity.duration)} | {activity.calories} cal
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditClick(activity)}
                      className="p-2 text-neutral-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(activity)}
                      className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* End Activity Modal */}
      <Modal
        isOpen={endModalOpen}
        onClose={() => setEndModalOpen(false)}
        title="Save Activity"
      >
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="text-sm text-neutral-400">Duration</div>
            <div className="text-3xl font-bold">{formatElapsed(elapsedMs)}</div>
          </div>

          <Input
            label="Distance (km)"
            type="number"
            step="0.1"
            placeholder="e.g., 5.0"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
          />

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={handleCancel} className="flex-1">
              Discard
            </Button>
            <Button onClick={handleSaveActivity} disabled={loading} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Activity Modal */}
      <EditActivityModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedActivity(null)
        }}
        activity={selectedActivity}
        onSave={updateActivity}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setSelectedActivity(null)
        }}
        title="Delete Activity"
        message="Are you sure you want to delete this activity? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </div>
  )
}
