import mongoose, { Document, Types } from 'mongoose'

export interface IWorkoutLog extends Document {
  userId: Types.ObjectId
  routineId: Types.ObjectId
  routineName: string
  date: Date
  duration: number // minutes
  completed: boolean
  exercisesCompleted: number
}

const workoutLogSchema = new mongoose.Schema<IWorkoutLog>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  routineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Routine',
    required: true,
  },
  routineName: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  completed: {
    type: Boolean,
    required: true,
  },
  exercisesCompleted: {
    type: Number,
    required: true,
  },
})

workoutLogSchema.index({ userId: 1, date: -1 })

export default mongoose.model<IWorkoutLog>('WorkoutLog', workoutLogSchema)
