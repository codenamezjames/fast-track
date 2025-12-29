import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'routines'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('name', 255).notNullable()
      table.jsonb('exercises').notNullable().defaultTo('[]')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index('user_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}