import mongoose, { Document, Types } from 'mongoose'

export interface IMeasurement extends Document {
  userId: Types.ObjectId
  date: Date
  weight?: number // kg
  height?: number // cm
  bodyFat?: number // percentage
}

const measurementSchema = new mongoose.Schema<IMeasurement>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  weight: Number,
  height: Number,
  bodyFat: Number,
})

measurementSchema.index({ userId: 1, date: -1 })

export default mongoose.model<IMeasurement>('Measurement', measurementSchema)
