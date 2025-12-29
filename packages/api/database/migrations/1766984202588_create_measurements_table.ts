import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'measurements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.date('date').notNullable()
      table.decimal('weight', 5, 2).unsigned().nullable().comment('Weight in kilograms')
      table.decimal('height', 5, 2).unsigned().nullable().comment('Height in centimeters')
      table.decimal('body_fat', 4, 2).unsigned().nullable().comment('Body fat percentage')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['user_id', 'date'], 'measurements_user_id_date_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}