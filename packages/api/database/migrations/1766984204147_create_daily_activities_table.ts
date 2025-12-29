import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'daily_activities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.date('date').notNullable()
      table.boolean('fast_completed').notNullable().defaultTo(false)
      table.boolean('meals_logged').notNullable().defaultTo(false)
      table.boolean('workout_completed').notNullable().defaultTo(false)
      table.boolean('streak_maintained').notNullable().defaultTo(false)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['user_id', 'date'], {indexName: 'daily_activities_user_id_date_unique'})
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}