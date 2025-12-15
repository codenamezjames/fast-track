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

    // Version 2: Add body measurements and user profile
    this.version(2).stores({
      meals: '++id, user_id, calories, meal_time, notes, synced',
      fasting_sessions:
        '++id, user_id, start_time, end_time, planned_duration, actual_duration, session_type, synced',
      fasting_schedules: '++id, user_id, name, schedule_data, is_active, created_at',
      weight_entries: '++id, user_id, weight, date, synced',
      body_measurements: '++id, user_id, date, waist, chest, neck, arms, thighs, synced',
      user_profile: '++id, user_id, height, height_unit, gender',
      sync_queue: '++id, table_name, record_id, action, data, timestamp',
    })

    // Version 3: Add user settings for goals and preferences
    this.version(3).stores({
      meals: '++id, user_id, calories, meal_time, notes, synced',
      fasting_sessions:
        '++id, user_id, start_time, end_time, planned_duration, actual_duration, session_type, synced',
      fasting_schedules: '++id, user_id, name, schedule_data, is_active, created_at',
      weight_entries: '++id, user_id, weight, date, synced',
      body_measurements: '++id, user_id, date, waist, chest, neck, arms, thighs, synced',
      user_profile: '++id, user_id, height, height_unit, gender',
      user_settings:
        '++id, user_id, calorie_goal, weight_goal, weekly_fasting_goal, weight_unit, height_unit',
      sync_queue: '++id, table_name, record_id, action, data, timestamp',
    })
  }
}

export const db = new FastTrackDB()

// Helper functions for offline operations
export const offlineOperations = {
  // Add item to offline storage and sync queue
  async addToOffline(tableName, data) {
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
  },

  // Update item in offline storage
  async updateOffline(tableName, id, data) {
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
  },

  // Delete item from offline storage
  async deleteOffline(tableName, id) {
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
  },

  // Get all unsynced items
  async getUnsyncedItems(tableName) {
    try {
      return await db[tableName].where('synced').equals(false).toArray()
    } catch {
      return []
    }
  },

  // Mark items as synced
  async markAsSynced(tableName, ids) {
    await db[tableName].where('id').anyOf(ids).modify({ synced: true })
  },
}
