import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'meals'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.date('date').notNullable()
      table.enum('type', ['breakfast', 'lunch', 'dinner', 'snack']).notNullable()
      table.jsonb('foods').notNullable().defaultTo('[]')
      table.integer('total_calories').unsigned().notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['user_id', 'date'], 'meals_user_id_date_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}