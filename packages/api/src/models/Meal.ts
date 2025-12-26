import mongoose, { Document, Types } from 'mongoose'

export interface IFoodItem {
  name: string
  calories: number
  protein?: number
  carbs?: number
  fat?: number
  servingSize?: string
}

export interface IMeal extends Document {
  userId: Types.ObjectId
  date: Date
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foods: IFoodItem[]
  totalCalories: number
}

const foodItemSchema = new mongoose.Schema<IFoodItem>(
  {
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: Number,
    carbs: Number,
    fat: Number,
    servingSize: String,
  },
  { _id: false }
)

const mealSchema = new mongoose.Schema<IMeal>({
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
  type: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true,
  },
  foods: [foodItemSchema],
  totalCalories: {
    type: Number,
    required: true,
  },
})

mealSchema.index({ userId: 1, date: 1 })

export default mongoose.model<IMeal>('Meal', mealSchema)
