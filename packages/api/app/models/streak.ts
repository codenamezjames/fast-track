import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Streak extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare currentStreak: number

  @column()
  declare longestStreak: number

  @column()
  declare freezesAvailable: number

  @column({
    prepare: (value: number[]) => `{${value.join(',')}}`,
    consume: (value: string) => value.replace(/[{}]/g, '').split(',').filter(Boolean).map(Number),
  })
  declare milestonesAchieved: number[]

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}