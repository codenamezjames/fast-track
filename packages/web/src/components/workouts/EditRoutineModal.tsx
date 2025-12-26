import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import IconButton from '../ui/IconButton'
import AddItemButton from '../ui/AddItemButton'
import ModalFooter from '../ui/ModalFooter'
import { Trash2 } from 'lucide-react'
import { useListForm } from '../../hooks/useListForm'
import type { Exercise, WorkoutRoutine } from '../../stores/workoutsStore'

interface EditRoutineModalProps {
  isOpen: boolean
  onClose: () => void
  routine: WorkoutRoutine | null
  onSave: (id: string, name: string, exercises: Exercise[]) => Promise<void>
}

const createDefaultExercise = (): Exercise => ({
  id: `ex-${Date.now()}`,
  name: '',
  sets: 3,
  reps: 10,
})

export default function EditRoutineModal({
  isOpen,
  onClose,
  routine,
  onSave,
}: EditRoutineModalProps) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const exerciseList = useListForm<Exercise>({
    initialItems: [],
    defaultItem: createDefaultExercise(),
    minItems: 1,
    validateItem: (e) => e.name.trim().length > 0,
  })

  useEffect(() => {
    if (routine) {
      setName(routine.name)
      exerciseList.setItems([...routine.exercises])
    }
  }, [routine])

  const handleSave = async () => {
    if (!routine || !name.trim()) return
    const validExercises = exerciseList.getValidItems()
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
    exerciseList.resetItems([])
    onClose()
  }

  const handleAddExercise = () => {
    exerciseList.addItem(createDefaultExercise())
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

          {exerciseList.items.map((exercise, index) => (
            <div key={exercise.id} className="bg-neutral-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">
                  Exercise #{index + 1}
                </span>
                {exerciseList.items.length > 1 && (
                  <IconButton
                    icon={<Trash2 size={16} />}
                    onClick={() => exerciseList.removeItem(index)}
                    variant="red"
                    appearance="ghost"
                    size="sm"
                  />
                )}
              </div>

              <Input
                placeholder="Exercise name"
                value={exercise.name}
                onChange={(e) =>
                  exerciseList.updateItem(index, 'name', e.target.value)
                }
              />

              <div className="grid grid-cols-3 gap-3">
                <Input
                  type="number"
                  placeholder="Sets"
                  value={exercise.sets}
                  onChange={(e) =>
                    exerciseList.updateItem(index, 'sets', Number.parseInt(e.target.value) || 0)
                  }
                />
                <Input
                  type="number"
                  placeholder="Reps"
                  value={exercise.reps}
                  onChange={(e) =>
                    exerciseList.updateItem(index, 'reps', Number.parseInt(e.target.value) || 0)
                  }
                />
                <Input
                  type="number"
                  placeholder="Weight"
                  value={exercise.weight || ''}
                  onChange={(e) =>
                    exerciseList.updateItem(index, 'weight', Number.parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          ))}

          <AddItemButton
            label="Add Exercise"
            onClick={handleAddExercise}
          />
        </div>

        <div className="pt-4">
          <ModalFooter
            onCancel={handleClose}
            onSave={handleSave}
            saveLabel="Save Changes"
            loading={saving}
          />
        </div>
      </div>
    </Modal>
  )
}
