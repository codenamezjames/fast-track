import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'push_subscriptions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.text('endpoint').notNullable().unique()
      table.string('p256dh_key', 255).notNullable()
      table.string('auth_key', 255).notNullable()
      table.string('user_agent', 500).nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index('user_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}