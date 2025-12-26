import mongoose, { Document, Types } from 'mongoose'

export interface IFast extends Document {
  userId: Types.ObjectId
  startTime: Date
  endTime?: Date
  goalHours: number
  completed: boolean
  notes?: string
  notified80Percent: boolean
  notifiedComplete: boolean
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
  notified80Percent: {
    type: Boolean,
    default: false,
  },
  notifiedComplete: {
    type: Boolean,
    default: false,
  },
})

fastSchema.index({ userId: 1, startTime: -1 })

export default mongoose.model<IFast>('Fast', fastSchema)
