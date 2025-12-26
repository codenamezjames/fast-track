import { useEffect, useState } from 'react'
import { Play, Square, MapPin, Timer, Flame, PersonStanding, Bike, Pencil, Trash2 } from 'lucide-react'
import IconButton from '../components/ui/IconButton'
import SelectionButton from '../components/ui/SelectionButton'
import { useActivityStore, type ActivityType, type Activity } from '../stores/activityStore'
import { formatDuration, formatElapsedTime, formatTimeAgo } from '../lib/dateUtils'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import EditActivityModal from '../components/activity/EditActivityModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import SuccessCelebration from '../components/ui/SuccessCelebration'

const activityTypes: { type: ActivityType; label: string; icon: React.ReactNode }[] = [
  { type: 'run', label: 'Run', icon: <PersonStanding size={24} /> },
  { type: 'walk', label: 'Walk', icon: <PersonStanding size={24} /> },
  { type: 'bike', label: 'Bike', icon: <Bike size={24} /> },
]

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
    fetchActivities,
  } = useActivityStore()

  const [elapsedMs, setElapsedMs] = useState(0)
  const [endModalOpen, setEndModalOpen] = useState(false)
  const [distance, setDistance] = useState('')
  const [selectedType, setSelectedType] = useState<ActivityType>('run')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

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
    setShowCelebration(true)
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
              <div className="text-sm text-blue-400 mb-2">
                {activeSession.type.charAt(0).toUpperCase() + activeSession.type.slice(1)} in progress
              </div>
              <div className="text-5xl font-bold font-mono">
                {formatElapsedTime(elapsedMs)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-neutral-700 rounded-xl p-3 text-center">
                <Timer size={20} className="mx-auto mb-1 text-blue-400" />
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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full mb-4">
                <MapPin size={36} className="text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold">Start Activity</h2>
              <p className="text-neutral-400 text-sm mt-1">
                Track your runs, walks, and bike rides
              </p>
            </div>

            <div className="flex gap-2 mb-6">
              {activityTypes.map(({ type, label, icon }) => (
                <SelectionButton
                  key={type}
                  selected={selectedType === type}
                  onClick={() => setSelectedType(type)}
                  variant="blue"
                >
                  <div className="flex justify-center mb-1">{icon}</div>
                  <div className="text-sm">{label}</div>
                </SelectionButton>
              ))}
            </div>

            <Button
              onClick={handleStart}
              variant="blue"
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
                    <IconButton
                      icon={<Pencil size={16} />}
                      onClick={() => handleEditClick(activity)}
                      variant="blue"
                      appearance="ghost"
                    />
                    <IconButton
                      icon={<Trash2 size={16} />}
                      onClick={() => handleDeleteClick(activity)}
                      variant="red"
                      appearance="ghost"
                    />
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
            <div className="text-3xl font-bold">{formatElapsedTime(elapsedMs)}</div>
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
            <Button variant="blue" onClick={handleSaveActivity} disabled={loading} className="flex-1">
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

      {showCelebration && (
        <SuccessCelebration
          type="activity"
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </div>
  )
}
