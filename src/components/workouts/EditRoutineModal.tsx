import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import type { Exercise, WorkoutRoutine } from '../../stores/workoutsStore'

interface EditRoutineModalProps {
  isOpen: boolean
  onClose: () => void
  routine: WorkoutRoutine | null
  onSave: (id: string, name: string, exercises: Exercise[]) => Promise<void>
}

export default function EditRoutineModal({
  isOpen,
  onClose,
  routine,
  onSave,
}: EditRoutineModalProps) {
  const [name, setName] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (routine) {
      setName(routine.name)
      setExercises([...routine.exercises])
    }
  }, [routine])

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      { id: `ex-${Date.now()}`, name: '', sets: 3, reps: 10 },
    ])
  }

  const handleRemoveExercise = (index: number) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index))
    }
  }

  const handleExerciseChange = (
    index: number,
    field: keyof Exercise,
    value: string | number
  ) => {
    const updated = [...exercises]
    updated[index] = { ...updated[index], [field]: value }
    setExercises(updated)
  }

  const handleSave = async () => {
    if (!routine || !name.trim()) return
    const validExercises = exercises.filter((e) => e.name.trim())
    if (validExercises.length === 0) return

    setSaving(true)
    try {
      await onSave(routine.id, name.trim(), validExercises)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setName('')
    setExercises([])
    onClose()
  }

  if (!routine) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Routine">
      <div className="space-y-4">
        <Input
          label="Routine Name"
          placeholder="e.g., Push Day, Leg Day"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="space-y-3">
          <label className="block text-sm font-medium text-neutral-300">
            Exercises
          </label>

          {exercises.map((exercise, index) => (
            <div key={exercise.id} className="bg-neutral-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">
                  Exercise #{index + 1}
                </span>
                {exercises.length > 1 && (
                  <button
                    onClick={() => handleRemoveExercise(index)}
                    className="p-1 text-red-400 hover:bg-red-400/10 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <Input
                placeholder="Exercise name"
                value={exercise.name}
                onChange={(e) =>
                  handleExerciseChange(index, 'name', e.target.value)
                }
              />

              <div className="grid grid-cols-3 gap-3">
                <Input
                  type="number"
                  placeholder="Sets"
                  value={exercise.sets}
                  onChange={(e) =>
                    handleExerciseChange(index, 'sets', parseInt(e.target.value) || 0)
                  }
                />
                <Input
                  type="number"
                  placeholder="Reps"
                  value={exercise.reps}
                  onChange={(e) =>
                    handleExerciseChange(index, 'reps', parseInt(e.target.value) || 0)
                  }
                />
                <Input
                  type="number"
                  placeholder="Weight"
                  value={exercise.weight || ''}
                  onChange={(e) =>
                    handleExerciseChange(index, 'weight', parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          ))}

          <button
            onClick={handleAddExercise}
            className="w-full py-3 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Exercise
          </button>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1" disabled={saving}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  )
}
