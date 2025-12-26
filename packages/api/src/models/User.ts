import mongoose, { Document } from 'mongoose'
import bcrypt from 'bcrypt'

export interface INotificationPreferences {
  enabled: boolean
  fasting: {
    enabled: boolean
    alertAt80Percent: boolean
    alertAtGoal: boolean
  }
  meals: {
    enabled: boolean
    breakfastTime: string | null
    lunchTime: string | null
    dinnerTime: string | null
  }
  dailyGoal: {
    enabled: boolean
    reminderTime: string
  }
}

export interface IUser extends Document {
  email: string
  password: string
  createdAt: Date
  notificationPreferences: INotificationPreferences
  comparePassword(candidate: string): Promise<boolean>
}

const notificationPreferencesSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    fasting: {
      enabled: { type: Boolean, default: true },
      alertAt80Percent: { type: Boolean, default: true },
      alertAtGoal: { type: Boolean, default: true },
    },
    meals: {
      enabled: { type: Boolean, default: false },
      breakfastTime: { type: String, default: null },
      lunchTime: { type: String, default: null },
      dinnerTime: { type: String, default: null },
    },
    dailyGoal: {
      enabled: { type: Boolean, default: true },
      reminderTime: { type: String, default: '20:00' },
    },
  },
  { _id: false }
)

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  notificationPreferences: {
    type: notificationPreferencesSchema,
    default: () => ({}),
  },
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password)
}

export default mongoose.model<IUser>('User', userSchema)
