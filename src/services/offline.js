import Dexie from 'dexie'

// Define the database schema
class FastTrackDB extends Dexie {
  constructor() {
    super('FastTrackDB')

    this.version(1).stores({
      meals: '++id, user_id, calories, meal_time, notes, synced',
      fasting_sessions:
        '++id, user_id, start_time, end_time, planned_duration, actual_duration, session_type, synced',
      fasting_schedules: '++id, user_id, name, schedule_data, is_active, created_at',
      weight_entries: '++id, user_id, weight, date, synced',
      sync_queue: '++id, table_name, record_id, action, data, timestamp',
    })
  }
}

export const db = new FastTrackDB()

// Helper functions for offline operations
export const offlineOperations = {
  // Add item to offline storage and sync queue
  async addToOffline(tableName, data) {
    try {
      const record = { ...data, synced: false }
      const id = await db[tableName].add(record)

      // Skip sync queue for now (pure offline mode)
      // TODO: Re-enable when Appwrite sync is implemented
      // await db.sync_queue.add({
      //   table_name: tableName,
      //   record_id: id,
      //   action: 'create',
      //   data: record,
      //   timestamp: new Date().toISOString()
      // })

      return id
    } catch (error) {
      console.error(`Error adding to ${tableName}:`, error)
      throw error
    }
  },

  // Update item in offline storage
  async updateOffline(tableName, id, data) {
    try {
      const updatedData = { ...data, synced: false }
      await db[tableName].update(id, updatedData)

      // Skip sync queue for now (pure offline mode)
      // TODO: Re-enable when Appwrite sync is implemented
      // await db.sync_queue.add({
      //   table_name: tableName,
      //   record_id: id,
      //   action: 'update',
      //   data: updatedData,
      //   timestamp: new Date().toISOString()
      // })
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error)
      throw error
    }
  },

  // Delete item from offline storage
  async deleteOffline(tableName, id) {
    try {
      await db[tableName].delete(id)

      // Skip sync queue for now (pure offline mode)
      // TODO: Re-enable when Appwrite sync is implemented
      // await db.sync_queue.add({
      //   table_name: tableName,
      //   record_id: id,
      //   action: 'delete',
      //   data: null,
      //   timestamp: new Date().toISOString()
      // })
    } catch (error) {
      console.error(`Error deleting from ${tableName}:`, error)
      throw error
    }
  },

  // Get all unsynced items
  async getUnsyncedItems(tableName) {
    try {
      return await db[tableName].where('synced').equals(false).toArray()
    } catch (error) {
      console.log(`Table ${tableName} not found or empty, returning empty array`)
      console.log(error)
      return []
    }
  },

  // Mark items as synced
  async markAsSynced(tableName, ids) {
    await db[tableName].where('id').anyOf(ids).modify({ synced: true })
  },
}
