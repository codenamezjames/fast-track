/**
 * Meals Repository
 * Handles data access for meal records with offline/online support
 */

import { BaseRepository } from './BaseRepository.js'
import { db, offlineOperations } from '../services/offline.js'
import { appwriteHelpers, config } from '../services/appwrite.js'
import { Query } from 'appwrite'

export class MealsRepository extends BaseRepository {
  constructor() {
    super('meals', {
      cacheTimeout: 2 * 60 * 1000, // 2 minutes for meals
      retryAttempts: 3,
      retryDelay: 1000,
    })
  }

  /**
   * Create a meal record
   * @param {Object} data - Meal data
   * @param {Object} options - Creation options
   * @returns {Promise<Object>} Created meal
   */
  async _createRecord(data) {
    if (this.isOnline) {
      try {
        // Try Appwrite first
        const result = await appwriteHelpers.createDocument(config.collections.meals, data)
        return result
      } catch {
        // Fall back to offline storage
        this._log('Appwrite unavailable, using offline storage')
        return await this._createOfflineRecord(data)
      }
    } else {
      return await this._createOfflineRecord(data)
    }
  }

  /**
   * Create meal in offline storage
   * @param {Object} data - Meal data
   * @returns {Promise<Object>} Created meal
   */
  async _createOfflineRecord(data) {
    const id = await offlineOperations.addToOffline('meals', data)
    return { ...data, id, $id: id }
  }

  /**
   * Find meal records
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Found meals
   */
  async _findRecords(criteria = {}) {
    if (this.isOnline) {
      try {
        // Try Appwrite first
        const queries = this._buildQueries(criteria)
        const result = await appwriteHelpers.listDocuments(config.collections.meals, queries)
        return result.documents
      } catch {
        // Fall back to offline storage
        this._log('Appwrite unavailable, using offline storage')
        return await this._findOfflineRecords(criteria, {})
      }
    } else {
      return await this._findOfflineRecords(criteria, {})
    }
  }

  /**
   * Find meals in offline storage
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Found meals
   */
  async _findOfflineRecords(criteria, options = {}) {
    let meals = await db.meals.toArray()

    // Apply filters
    if (criteria.user_id) {
      meals = meals.filter((meal) => meal.user_id === criteria.user_id)
    }

    if (criteria.date) {
      const targetDate = new Date(criteria.date).toDateString()
      meals = meals.filter((meal) => new Date(meal.meal_time).toDateString() === targetDate)
    }

    if (criteria.dateRange) {
      const { start, end } = criteria.dateRange
      meals = meals.filter((meal) => {
        const mealDate = new Date(meal.meal_time)
        return mealDate >= new Date(start) && mealDate <= new Date(end)
      })
    }

    // Apply sorting
    if (options.sort) {
      meals.sort((a, b) => {
        const aDate = new Date(a.meal_time)
        const bDate = new Date(b.meal_time)
        return options.sort.order === 'desc' ? bDate - aDate : aDate - bDate
      })
    }

    // Apply pagination
    if (options.limit) {
      const offset = options.offset || 0
      meals = meals.slice(offset, offset + options.limit)
    }

    return meals
  }

  /**
   * Find meal by ID
   * @param {string} id - Meal ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Found meal
   */
  async _findRecordById(id) {
    if (this.isOnline) {
      try {
        // Try Appwrite first
        const result = await appwriteHelpers.getDocument(config.collections.meals, id)
        return result
      } catch {
        // Fall back to offline storage
        this._log('Appwrite unavailable, using offline storage')
        return await this._findOfflineRecordById(id)
      }
    } else {
      return await this._findOfflineRecordById(id)
    }
  }

  /**
   * Find meal by ID in offline storage
   * @param {string} id - Meal ID
   * @returns {Promise<Object>} Found meal
   */
  async _findOfflineRecordById(id) {
    return await db.meals.get(parseInt(id))
  }

  /**
   * Update meal record
   * @param {string} id - Meal ID
   * @param {Object} data - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Updated meal
   */
  async _updateRecord(id, data) {
    if (this.isOnline) {
      try {
        // Try Appwrite first
        const result = await appwriteHelpers.updateDocument(config.collections.meals, id, data)
        return result
      } catch {
        // Fall back to offline storage
        this._log('Appwrite unavailable, using offline storage')
        return await this._updateOfflineRecord(id, data)
      }
    } else {
      return await this._updateOfflineRecord(id, data)
    }
  }

  /**
   * Update meal in offline storage
   * @param {string} id - Meal ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated meal
   */
  async _updateOfflineRecord(id, data) {
    await offlineOperations.updateOffline('meals', parseInt(id), data)
    return { ...data, id: parseInt(id), $id: id }
  }

  /**
   * Delete meal record
   * @param {string} id - Meal ID
   * @param {Object} options - Delete options
   * @returns {Promise<void>}
   */
  async _deleteRecord(id) {
    if (this.isOnline) {
      try {
        // Try Appwrite first
        await appwriteHelpers.deleteDocument(config.collections.meals, id)
      } catch {
        // Fall back to offline storage
        this._log('Appwrite unavailable, using offline storage')
        await this._deleteOfflineRecord(id)
      }
    } else {
      await this._deleteOfflineRecord(id)
    }
  }

  /**
   * Delete meal from offline storage
   * @param {string} id - Meal ID
   * @returns {Promise<void>}
   */
  async _deleteOfflineRecord(id) {
    await offlineOperations.deleteOffline('meals', parseInt(id))
  }

  /**
   * Count meal records
   * @param {Object} criteria - Search criteria
   * @returns {Promise<number>} Meal count
   */
  async _countRecords(criteria = {}) {
    if (this.isOnline) {
      try {
        // Try Appwrite first
        const queries = this._buildQueries(criteria)
        const result = await appwriteHelpers.listDocuments(config.collections.meals, queries)
        return result.total
      } catch {
        // Fall back to offline storage
        this._log('Appwrite unavailable, using offline storage')
        return await this._countOfflineRecords(criteria)
      }
    } else {
      return await this._countOfflineRecords(criteria)
    }
  }

  /**
   * Count meals in offline storage
   * @param {Object} criteria - Search criteria
   * @returns {Promise<number>} Meal count
   */
  async _countOfflineRecords(criteria) {
    const meals = await this._findOfflineRecords(criteria, {})
    return meals.length
  }

  /**
   * Execute bulk operation
   * @param {Object} operation - Bulk operation
   * @returns {Promise<Object>} Operation result
   */
  async _executeBulkOperation(operation) {
    switch (operation.type) {
      case 'create':
        return await this._createRecord(operation.data)
      case 'update':
        return await this._updateRecord(operation.id, operation.data)
      case 'delete':
        return await this._deleteRecord(operation.id)
      default:
        throw new Error(`Unknown bulk operation type: ${operation.type}`)
    }
  }

  /**
   * Build Appwrite queries from criteria
   * @param {Object} criteria - Search criteria
   * @returns {Array} Appwrite queries
   */
  _buildQueries(criteria) {
    const queries = []

    if (criteria.user_id) {
      queries.push(Query.equal('user_id', criteria.user_id))
    }

    if (criteria.date) {
      const startOfDay = new Date(criteria.date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(criteria.date)
      endOfDay.setHours(23, 59, 59, 999)

      queries.push(Query.greaterThanEqual('meal_time', startOfDay.toISOString()))
      queries.push(Query.lessThanEqual('meal_time', endOfDay.toISOString()))
    }

    if (criteria.dateRange) {
      const { start, end } = criteria.dateRange
      queries.push(Query.greaterThanEqual('meal_time', start))
      queries.push(Query.lessThanEqual('meal_time', end))
    }

    return queries
  }

  /**
   * Get meals by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Meals in date range
   */
  async findByDateRange(startDate, endDate, options = {}) {
    return this.find(
      {
        dateRange: { start: startDate.toISOString(), end: endDate.toISOString() },
      },
      options,
    )
  }

  /**
   * Get meals for today
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Today's meals
   */
  async findToday(options = {}) {
    const today = new Date().toISOString().split('T')[0]
    return this.find({ date: today }, options)
  }

  /**
   * Get meals for a specific week
   * @param {Date} weekStart - Start of week
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Week's meals
   */
  async findByWeek(weekStart, options = {}) {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    return this.findByDateRange(weekStart, weekEnd, options)
  }

  /**
   * Get calorie statistics for a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>} Calorie statistics
   */
  async getCalorieStats(startDate, endDate) {
    const meals = await this.findByDateRange(startDate, endDate)

    if (meals.length === 0) {
      return {
        totalCalories: 0,
        averageCalories: 0,
        totalMeals: 0,
        daysWithMeals: 0,
      }
    }

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0)
    const uniqueDays = new Set(meals.map((meal) => new Date(meal.meal_time).toDateString())).size

    return {
      totalCalories,
      averageCalories: Math.round(totalCalories / meals.length),
      totalMeals: meals.length,
      daysWithMeals: uniqueDays,
    }
  }

  /**
   * Get recent meals
   * @param {number} limit - Number of meals to return
   * @returns {Promise<Array>} Recent meals
   */
  async findRecent(limit = 10) {
    return this.find(
      {},
      {
        sort: { order: 'desc' },
        limit,
      },
    )
  }

  /**
   * Validate meal data
   * @param {Object} data - Meal data
   * @param {string} operation - Operation type
   * @returns {Object} Validated meal data
   */
  validateData(data, operation) {
    const validatedData = super.validateData(data, operation)

    // Meal-specific validation
    if (operation === 'create') {
      if (!validatedData.calories || validatedData.calories <= 0) {
        throw new Error('Calories must be a positive number')
      }

      if (!validatedData.meal_time) {
        validatedData.meal_time = new Date().toISOString()
      }
    }

    return validatedData
  }
}
