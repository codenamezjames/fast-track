import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import type { WorkoutLog } from '../../stores/workoutsStore'

interface EditWorkoutLogModalProps {
  isOpen: boolean
  onClose: () => void
  workoutLog: WorkoutLog | null
  onSave: (id: string, data: { duration: number; completed: boolean }) => Promise<void>
}

export default function EditWorkoutLogModal({
  isOpen,
  onClose,
  workoutLog,
  onSave,
}: EditWorkoutLogModalProps) {
  const [duration, setDuration] = useState('')
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (workoutLog) {
      setDuration(workoutLog.duration.toString())
      setCompleted(workoutLog.completed)
    }
  }, [workoutLog])

  const handleSave = async () => {
    if (!workoutLog) return

    setSaving(true)
    try {
      await onSave(workoutLog.id, {
        duration: parseInt(duration) || 0,
        completed,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setDuration('')
    setCompleted(false)
    onClose()
  }

  if (!workoutLog) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Workout">
      <div className="space-y-4">
        <div className="bg-neutral-700 rounded-xl p-3 text-center">
          <div className="font-medium">{workoutLog.routineName}</div>
          <div className="text-sm text-neutral-400">
            {workoutLog.date.toLocaleDateString()}
          </div>
        </div>

        <Input
          label="Duration (minutes)"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCompleted(!completed)}
            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-colors ${
              completed
                ? 'border-green-500 bg-green-500/20 text-green-400'
                : 'border-neutral-600 text-neutral-400'
            }`}
          >
            {completed ? 'Completed' : 'Not Completed'}
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  )
}
