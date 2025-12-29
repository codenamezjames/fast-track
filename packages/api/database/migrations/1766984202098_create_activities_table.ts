import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'activities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.enum('type', ['run', 'walk', 'bike', 'other']).notNullable()
      table.timestamp('start_time').notNullable()
      table.timestamp('end_time').nullable()
      table.integer('duration').unsigned().notNullable().comment('Duration in minutes')
      table.decimal('distance', 8, 2).unsigned().notNullable().comment('Distance in kilometers')
      table.integer('calories').unsigned().notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['user_id', 'start_time'], 'activities_user_id_start_time_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}