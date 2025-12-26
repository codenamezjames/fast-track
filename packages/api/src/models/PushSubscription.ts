import mongoose, { Document, Types } from 'mongoose'

export interface IPushSubscription extends Document {
  userId: Types.ObjectId
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  createdAt: Date
  lastUsed: Date
  userAgent?: string
}

const pushSubscriptionSchema = new mongoose.Schema<IPushSubscription>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  endpoint: {
    type: String,
    required: true,
    unique: true,
  },
  keys: {
    p256dh: {
      type: String,
      required: true,
    },
    auth: {
      type: String,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUsed: {
    type: Date,
    default: Date.now,
  },
  userAgent: String,
})

pushSubscriptionSchema.index({ userId: 1, endpoint: 1 })

export default mongoose.model<IPushSubscription>('PushSubscription', pushSubscriptionSchema)
