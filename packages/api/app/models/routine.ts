import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import WorkoutLog from '#models/workout_log'

export interface Exercise {
  name: string
  sets: number
  reps: number
  weight?: number
}

export default class Routine extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column({
    prepare: (value: Exercise[]) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare exercises: Exercise[]

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => WorkoutLog)
  declare workoutLogs: HasMany<typeof WorkoutLog>
}