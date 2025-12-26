import mongoose, { Document, Types } from 'mongoose'

export interface IDailyActivity extends Document {
  userId: Types.ObjectId
  date: string // YYYY-MM-DD
  fastCompleted: boolean
  mealsLogged: boolean
  workoutCompleted: boolean
  streakMaintained: boolean
}

const dailyActivitySchema = new mongoose.Schema<IDailyActivity>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: String,
    required: true,
  },
  fastCompleted: {
    type: Boolean,
    default: false,
  },
  mealsLogged: {
    type: Boolean,
    default: false,
  },
  workoutCompleted: {
    type: Boolean,
    default: false,
  },
  streakMaintained: {
    type: Boolean,
    default: false,
  },
})

dailyActivitySchema.index({ userId: 1, date: 1 }, { unique: true })

export default mongoose.model<IDailyActivity>('DailyActivity', dailyActivitySchema)
