import mongoose, { Document, Types } from 'mongoose'

export interface IActivity extends Document {
  userId: Types.ObjectId
  type: 'run' | 'walk' | 'bike' | 'other'
  startTime: Date
  endTime: Date
  duration: number // minutes
  distance: number // km
  calories: number
}

const activitySchema = new mongoose.Schema<IActivity>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['run', 'walk', 'bike', 'other'],
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
    index: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  distance: {
    type: Number,
    required: true,
  },
  calories: {
    type: Number,
    required: true,
  },
})

activitySchema.index({ userId: 1, startTime: -1 })

export default mongoose.model<IActivity>('Activity', activitySchema)
