import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'streaks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('user_id').unsigned().notNullable().unique().references('id').inTable('users').onDelete('CASCADE')
      table.integer('current_streak').unsigned().notNullable().defaultTo(0)
      table.integer('longest_streak').unsigned().notNullable().defaultTo(0)
      table.integer('freezes_available').unsigned().notNullable().defaultTo(0)
      table.specificType('milestones_achieved', 'integer[]').notNullable().defaultTo('{}')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}