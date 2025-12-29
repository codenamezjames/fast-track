import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface FoodItem {
  name: string
  calories: number
  protein?: number
  carbs?: number
  fat?: number
  serving?: string
  brand?: string
}

export default class Meal extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column.date()
  declare date: DateTime

  @column()
  declare type: MealType

  @column({
    prepare: (value: FoodItem[]) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare foods: FoodItem[]

  @column()
  declare totalCalories: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}