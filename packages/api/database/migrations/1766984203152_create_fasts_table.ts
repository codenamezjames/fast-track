import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fasts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.timestamp('start_time').notNullable()
      table.timestamp('end_time').nullable()
      table.integer('goal_hours').unsigned().notNullable()
      table.boolean('is_completed').notNullable().defaultTo(false)
      table.boolean('notified_80_percent').notNullable().defaultTo(false)
      table.boolean('notified_complete').notNullable().defaultTo(false)
      table.text('notes').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['user_id', 'start_time'], 'fasts_user_id_start_time_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}