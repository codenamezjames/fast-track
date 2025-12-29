import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Routine from '#models/routine'

export default class WorkoutLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare routineId: number | null

  @column.dateTime()
  declare startTime: DateTime

  @column.dateTime()
  declare endTime: DateTime | null

  @column()
  declare duration: number

  @column()
  declare exercisesCompleted: number

  @column()
  declare isCompleted: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Routine)
  declare routine: BelongsTo<typeof Routine>
}