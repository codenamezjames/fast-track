import mongoose, { Document, Types } from 'mongoose'

export interface IStreak extends Document {
  userId: Types.ObjectId
  currentStreak: number
  longestStreak: number
  freezesAvailable: number
  freezesUsed: number
  lastActiveDate: string | null // YYYY-MM-DD
  milestonesAchieved: number[]
  totalActiveDays: number
}

const streakSchema = new mongoose.Schema<IStreak>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  freezesAvailable: {
    type: Number,
    default: 1,
  },
  freezesUsed: {
    type: Number,
    default: 0,
  },
  lastActiveDate: {
    type: String,
    default: null,
  },
  milestonesAchieved: {
    type: [Number],
    default: [],
  },
  totalActiveDays: {
    type: Number,
    default: 0,
  },
})

export default mongoose.model<IStreak>('Streak', streakSchema)
