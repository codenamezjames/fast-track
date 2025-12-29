import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Meal from '#models/meal'
import Routine from '#models/routine'
import WorkoutLog from '#models/workout_log'
import Activity from '#models/activity'
import Measurement from '#models/measurement'
import Fast from '#models/fast'
import Streak from '#models/streak'
import DailyActivity from '#models/daily_activity'
import PushSubscription from '#models/push_subscription'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column({
    prepare: (value: Record<string, any>) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare notificationPreferences: Record<string, any>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @hasMany(() => Meal)
  declare meals: HasMany<typeof Meal>

  @hasMany(() => Routine)
  declare routines: HasMany<typeof Routine>

  @hasMany(() => WorkoutLog)
  declare workoutLogs: HasMany<typeof WorkoutLog>

  @hasMany(() => Activity)
  declare activities: HasMany<typeof Activity>

  @hasMany(() => Measurement)
  declare measurements: HasMany<typeof Measurement>

  @hasMany(() => Fast)
  declare fasts: HasMany<typeof Fast>

  @hasOne(() => Streak)
  declare streak: HasOne<typeof Streak>

  @hasMany(() => DailyActivity)
  declare dailyActivities: HasMany<typeof DailyActivity>

  @hasMany(() => PushSubscription)
  declare pushSubscriptions: HasMany<typeof PushSubscription>

  static accessTokens = DbAccessTokensProvider.forModel(User)
}