import { useEffect, useState } from 'react'
import { Plus, Dumbbell, Clock, Play, Trash2, Check, Pencil } from 'lucide-react'
import IconButton from '../components/ui/IconButton'
import { useWorkoutsStore, type Exercise, type WorkoutRoutine, type WorkoutLog } from '../stores/workoutsStore'
import { formatTimeAgo } from '../lib/dateUtils'
import CreateRoutineModal from '../components/workouts/CreateRoutineModal'
import EditRoutineModal from '../components/workouts/EditRoutineModal'
import EditWorkoutLogModal from '../components/workouts/EditWorkoutLogModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Button from '../components/ui/Button'
import SuccessCelebration from '../components/ui/SuccessCelebration'

export default function Workouts() {
  const {
    routines,
    logs,
    activeWorkout,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    startWorkout,
    endWorkout,
    updateWorkoutLog,
    deleteWorkoutLog,
    fetchData,
  } = useWorkoutsStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editLogModalOpen, setEditLogModalOpen] = useState(false)
  const [deleteLogDialogOpen, setDeleteLogDialogOpen] = useState(false)
  const [selectedRoutine, setSelectedRoutine] = useState<WorkoutRoutine | null>(null)
  const [selectedLog, setSelectedLog] = useState<WorkoutLog | null>(null)
  const [exercisesCompleted, setExercisesCompleted] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreateRoutine = async (
    name: string,
    exercises: Omit<Exercise, 'id'>[]
  ) => {
    await createRoutine(name, exercises)
  }

  const handleStartWorkout = (routineId: string) => {
    setExercisesCompleted(0)
    startWorkout(routineId)
  }

  const handleEditRoutine = (routine: WorkoutRoutine) => {
    setSelectedRoutine(routine)
    setEditModalOpen(true)
  }

  const handleEndWorkout = async (completed: boolean) => {
    await endWorkout(completed, exercisesCompleted)
    if (completed) {
      setShowCelebration(true)
    }
  }

  const handleEditLog = (log: WorkoutLog) => {
    setSelectedLog(log)
    setEditLogModalOpen(true)
  }

  const handleDeleteLogClick = (log: WorkoutLog) => {
    setSelectedLog(log)
    setDeleteLogDialogOpen(true)
  }

  const handleConfirmDeleteLog = async () => {
    if (selectedLog) {
      await deleteWorkoutLog(selectedLog.id)
      setSelectedLog(null)
    }
  }

  const activeRoutine = activeWorkout
    ? routines.find((r) => r.id === activeWorkout.routineId)
    : null

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Workouts</h1>
        <IconButton
          icon={<Plus size={24} />}
          onClick={() => setModalOpen(true)}
          variant="red"
          size="lg"
        />
      </div>

      {/* Active Workout */}
      {activeWorkout && activeRoutine && (
        <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-red-400">Active Workout</div>
              <div className="text-xl font-bold">{activeRoutine.name}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono">
                {exercisesCompleted}/{activeRoutine.exercises.length}
              </div>
              <div className="text-xs text-neutral-400">exercises</div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {activeRoutine.exercises.map((exercise, index) => (
              <button
                key={exercise.id}
                onClick={() =>
                  setExercisesCompleted(Math.max(exercisesCompleted, index + 1))
                }
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  index < exercisesCompleted
                    ? 'bg-red-500/30 text-red-400'
                    : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    index < exercisesCompleted
                      ? 'border-red-500 bg-red-500'
                      : 'border-neutral-600'
                  }`}
                >
                  {index < exercisesCompleted && <Check size={14} />}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{exercise.name}</div>
                  <div className="text-xs text-neutral-400">
                    {exercise.sets} x {exercise.reps}
                    {exercise.weight && ` @ ${exercise.weight}kg`}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={() => handleEndWorkout(false)}
              className="flex-1"
            >
              End Early
            </Button>
            <Button
              variant="red"
              onClick={() => handleEndWorkout(true)}
              className="flex-1"
              disabled={exercisesCompleted < activeRoutine.exercises.length}
            >
              Complete
            </Button>
          </div>
        </div>
      )}

      {/* My Routines */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">My Routines</h2>
        {routines.length === 0 ? (
          <div className="bg-neutral-800 rounded-xl p-4 text-center text-neutral-400">
            No routines yet. Create your first workout routine!
          </div>
        ) : (
          <div className="space-y-3">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className="bg-neutral-800 rounded-xl p-4 flex items-center gap-4"
              >
                <div className="bg-red-500/20 p-3 rounded-xl">
                  <Dumbbell size={24} className="text-red-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{routine.name}</div>
                  <div className="text-neutral-400 text-sm">
                    {routine.exercises.length} exercises
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!activeWorkout && (
                    <IconButton
                      icon={<Play size={18} />}
                      onClick={() => handleStartWorkout(routine.id)}
                      variant="red"
                    />
                  )}
                  <IconButton
                    icon={<Pencil size={18} />}
                    onClick={() => handleEditRoutine(routine)}
                    variant="red"
                    appearance="ghost"
                  />
                  <IconButton
                    icon={<Trash2 size={18} />}
                    onClick={() => deleteRoutine(routine.id)}
                    variant="red"
                    appearance="ghost"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Workouts */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Workouts</h2>
        {logs.length === 0 ? (
          <div className="bg-neutral-800 rounded-xl p-4 text-center text-neutral-400">
            No workouts logged yet. Start a routine to track your progress!
          </div>
        ) : (
          <div className="space-y-2">
            {logs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="bg-neutral-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">
                    {log.routineName}
                    {log.completed && (
                      <span className="ml-2 text-xs text-green-400">
                        Completed
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-neutral-400">
                    {formatTimeAgo(log.date)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-neutral-400">
                    <Clock size={14} />
                    <span>{log.duration} min</span>
                  </div>
                  <div className="flex gap-1">
                    <IconButton
                      icon={<Pencil size={16} />}
                      onClick={() => handleEditLog(log)}
                      variant="red"
                      appearance="ghost"
                    />
                    <IconButton
                      icon={<Trash2 size={16} />}
                      onClick={() => handleDeleteLogClick(log)}
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

      <CreateRoutineModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreateRoutine}
      />

      <EditRoutineModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedRoutine(null)
        }}
        routine={selectedRoutine}
        onSave={updateRoutine}
      />

      <EditWorkoutLogModal
        isOpen={editLogModalOpen}
        onClose={() => {
          setEditLogModalOpen(false)
          setSelectedLog(null)
        }}
        workoutLog={selectedLog}
        onSave={updateWorkoutLog}
      />

      <ConfirmDialog
        isOpen={deleteLogDialogOpen}
        onClose={() => {
          setDeleteLogDialogOpen(false)
          setSelectedLog(null)
        }}
        title="Delete Workout"
        message="Are you sure you want to delete this workout log? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDeleteLog}
        variant="danger"
      />

      {showCelebration && (
        <SuccessCelebration
          type="workout"
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </div>
  )
}
