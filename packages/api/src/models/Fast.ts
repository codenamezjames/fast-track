import mongoose, { Document, Types } from 'mongoose'

export interface IFast extends Document {
  userId: Types.ObjectId
  startTime: Date
  endTime?: Date
  goalHours: number
  completed: boolean
  notes?: string
}

const fastSchema = new mongoose.Schema<IFast>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  startTime: {
    type: Date,
    required: true,
    index: true,
  },
  endTime: Date,
  goalHours: {
    type: Number,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  notes: String,
})

fastSchema.index({ userId: 1, startTime: -1 })

export default mongoose.model<IFast>('Fast', fastSchema)
