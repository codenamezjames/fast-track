import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import type { Exercise } from '../../stores/workoutsStore'

interface CreateRoutineModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, exercises: Omit<Exercise, 'id'>[]) => void
}

export default function CreateRoutineModal({
  isOpen,
  onClose,
  onSave,
}: CreateRoutineModalProps) {
  const [name, setName] = useState('')
  const [exercises, setExercises] = useState<Omit<Exercise, 'id'>[]>([
    { name: '', sets: 3, reps: 10 },
  ])

  const handleAddExercise = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: 10 }])
  }

  const handleRemoveExercise = (index: number) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index))
    }
  }

  const handleExerciseChange = (
    index: number,
    field: keyof Omit<Exercise, 'id'>,
    value: string | number
  ) => {
    const updated = [...exercises]
    updated[index] = { ...updated[index], [field]: value }
    setExercises(updated)
  }

  const handleSave = () => {
    if (!name.trim()) return
    const validExercises = exercises.filter((e) => e.name.trim())
    if (validExercises.length === 0) return

    onSave(name.trim(), validExercises)
    setName('')
    setExercises([{ name: '', sets: 3, reps: 10 }])
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Routine">
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
            <div key={index} className="bg-neutral-800 rounded-xl p-4 space-y-3">
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
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Create Routine
          </Button>
        </div>
      </div>
    </Modal>
  )
}
