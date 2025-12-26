import mongoose, { Document, Types } from 'mongoose'

export interface IExercise {
  id: string
  name: string
  sets: number
  reps: number
  weight?: number
}

export interface IRoutine extends Document {
  userId: Types.ObjectId
  name: string
  exercises: IExercise[]
  createdAt: Date
}

const exerciseSchema = new mongoose.Schema<IExercise>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: Number, required: true },
    weight: Number,
  },
  { _id: false }
)

const routineSchema = new mongoose.Schema<IRoutine>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  exercises: [exerciseSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model<IRoutine>('Routine', routineSchema)
