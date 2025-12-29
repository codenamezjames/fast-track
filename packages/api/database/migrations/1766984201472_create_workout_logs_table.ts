import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'workout_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.integer('routine_id').unsigned().nullable().references('id').inTable('routines').onDelete('SET NULL')
      table.timestamp('start_time').notNullable()
      table.timestamp('end_time').nullable()
      table.integer('duration').unsigned().notNullable().comment('Duration in minutes')
      table.integer('exercises_completed').unsigned().notNullable().defaultTo(0)
      table.boolean('is_completed').notNullable().defaultTo(false)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['user_id', 'start_time'], 'workout_logs_user_id_start_time_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}