import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export type ActivityType = 'run' | 'walk' | 'bike' | 'other'

export default class Activity extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare type: ActivityType

  @column.dateTime()
  declare startTime: DateTime

  @column.dateTime()
  declare endTime: DateTime | null

  @column()
  declare duration: number

  @column()
  declare distance: number

  @column()
  declare calories: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
