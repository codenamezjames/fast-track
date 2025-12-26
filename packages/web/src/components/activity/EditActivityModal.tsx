import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import ModalFooter from '../ui/ModalFooter'
import type { Activity } from '../../stores/activityStore'

interface EditActivityModalProps {
  isOpen: boolean
  onClose: () => void
  activity: Activity | null
  onSave: (id: string, data: { distance: number; duration: number }) => Promise<void>
}

export default function EditActivityModal({
  isOpen,
  onClose,
  activity,
  onSave,
}: EditActivityModalProps) {
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (activity) {
      setDistance(activity.distance.toString())
      setDuration(activity.duration.toString())
    }
  }, [activity])

  const handleSave = async () => {
    if (!activity) return

    setSaving(true)
    try {
      await onSave(activity.id, {
        distance: parseFloat(distance) || 0,
        duration: parseInt(duration) || 0,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setDistance('')
    setDuration('')
    onClose()
  }

  if (!activity) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Activity">
      <div className="space-y-4">
        <div className="bg-neutral-700 rounded-xl p-3 text-center mb-2">
          <span className="capitalize font-medium">{activity.type}</span>
          <span className="text-neutral-400 ml-2">
            {activity.startTime.toLocaleDateString()}
          </span>
        </div>

        <Input
          label="Distance (km)"
          type="number"
          step="0.1"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
        />

        <Input
          label="Duration (minutes)"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />

        <div className="text-sm text-neutral-400 text-center">
          Calories will be recalculated based on duration
        </div>

        <div className="pt-2">
          <ModalFooter
            onCancel={handleClose}
            onSave={handleSave}
            saveLabel="Save Changes"
            saveDisabled={!distance || !duration}
            loading={saving}
          />
        </div>
      </div>
    </Modal>
  )
}
