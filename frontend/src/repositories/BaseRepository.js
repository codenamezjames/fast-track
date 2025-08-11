/**
 * Base Repository Class
 * Provides data access abstraction layer with:
 * - CRUD operations
 * - Query building
 * - Data validation
 * - Caching
 */

import { BaseService } from '../services/base/BaseService.js'

export class BaseRepository extends BaseService {
  constructor(collectionName, config = {}) {
    super(config)

    this.collectionName = collectionName
    this.cache = new Map()
    this.cacheTimeout = config.cacheTimeout || 5 * 60 * 1000 // 5 minutes
  }

  /**
   * Create a new record
   * @param {Object} data - Record data
   * @param {Object} options - Creation options
   * @returns {Promise<Object>} Created record
   */
  async create(data, options = {}) {
    return this.executeWithRetry(
      async () => {
        const validatedData = this.validateData(data, 'create')
        const record = await this._createRecord(validatedData, options)

        // Clear cache for this collection
        this._clearCache()

        return this.createResponse(record, true, 'Record created successfully')
      },
      {
        errorMessage: 'Failed to create record',
      },
    )
  }

  /**
   * Find records by criteria
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Found records
   */
  async find(criteria = {}, options = {}) {
    const cacheKey = this._generateCacheKey('find', criteria, options)

    // Check cache first
    const cached = this._getFromCache(cacheKey)
    if (cached) {
      return this.createResponse(cached, true, 'Records retrieved from cache')
    }

    return this.executeWithRetry(
      async () => {
        const records = await this._findRecords(criteria, options)

        // Cache the result
        this._setCache(cacheKey, records)

        return this.createResponse(records, true, 'Records found')
      },
      {
        errorMessage: 'Failed to find records',
      },
    )
  }

  /**
   * Find a single record by ID
   * @param {string} id - Record ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Found record
   */
  async findById(id, options = {}) {
    const cacheKey = this._generateCacheKey('findById', id, options)

    // Check cache first
    const cached = this._getFromCache(cacheKey)
    if (cached) {
      return this.createResponse(cached, true, 'Record retrieved from cache')
    }

    return this.executeWithRetry(
      async () => {
        const record = await this._findRecordById(id, options)

        if (!record) {
          throw new Error('Record not found')
        }

        // Cache the result
        this._setCache(cacheKey, record)

        return this.createResponse(record, true, 'Record found')
      },
      {
        errorMessage: 'Failed to find record',
      },
    )
  }

  /**
   * Update a record
   * @param {string} id - Record ID
   * @param {Object} data - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Updated record
   */
  async update(id, data, options = {}) {
    return this.executeWithRetry(
      async () => {
        const validatedData = this.validateData(data, 'update')
        const record = await this._updateRecord(id, validatedData, options)

        // Clear cache for this collection
        this._clearCache()

        return this.createResponse(record, true, 'Record updated successfully')
      },
      {
        errorMessage: 'Failed to update record',
      },
    )
  }

  /**
   * Delete a record
   * @param {string} id - Record ID
   * @param {Object} options - Delete options
   * @returns {Promise<Object>} Deletion result
   */
  async delete(id, options = {}) {
    return this.executeWithRetry(
      async () => {
        await this._deleteRecord(id, options)

        // Clear cache for this collection
        this._clearCache()

        return this.createResponse(null, true, 'Record deleted successfully')
      },
      {
        errorMessage: 'Failed to delete record',
      },
    )
  }

  /**
   * Count records by criteria
   * @param {Object} criteria - Search criteria
   * @returns {Promise<number>} Record count
   */
  async count(criteria = {}) {
    return this.executeWithRetry(
      async () => {
        const count = await this._countRecords(criteria)
        return this.createResponse(count, true, 'Count retrieved')
      },
      {
        errorMessage: 'Failed to count records',
      },
    )
  }

  /**
   * Find records with pagination
   * @param {Object} criteria - Search criteria
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Paginated results
   */
  async findWithPagination(criteria = {}, pagination = {}) {
    const { page = 1, limit = 10, sort = {} } = pagination

    return this.executeWithRetry(
      async () => {
        const offset = (page - 1) * limit

        const [records, total] = await Promise.all([
          this._findRecords(criteria, { limit, offset, sort }),
          this._countRecords(criteria),
        ])

        const result = {
          records,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
        }

        return this.createResponse(result, true, 'Paginated records found')
      },
      {
        errorMessage: 'Failed to find paginated records',
      },
    )
  }

  /**
   * Bulk operations
   * @param {Array} operations - Array of operations
   * @returns {Promise<Array>} Operation results
   */
  async bulk(operations) {
    return this.executeWithRetry(
      async () => {
        const results = []

        for (const operation of operations) {
          try {
            const result = await this._executeBulkOperation(operation)
            results.push({ ...operation, success: true, result })
          } catch (error) {
            results.push({ ...operation, success: false, error: error.message })
          }
        }

        // Clear cache after bulk operations
        this._clearCache()

        return this.createResponse(results, true, 'Bulk operations completed')
      },
      {
        errorMessage: 'Failed to execute bulk operations',
      },
    )
  }

  /**
   * Validate data before operations
   * @param {Object} data - Data to validate
   * @param {string} operation - Operation type
   * @returns {Object} Validated data
   */
  validateData(data, operation) {
    // Basic validation - can be extended by child classes
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data provided')
    }

    // Add timestamps
    const validatedData = { ...data }

    if (operation === 'create') {
      validatedData.created_at = new Date().toISOString()
      validatedData.updated_at = new Date().toISOString()
    } else if (operation === 'update') {
      validatedData.updated_at = new Date().toISOString()
    }

    return validatedData
  }

  /**
   * Generate cache key
   * @param {string} operation - Operation name
   * @param {...any} params - Operation parameters
   * @returns {string} Cache key
   */
  _generateCacheKey(operation, ...params) {
    return `${this.collectionName}:${operation}:${JSON.stringify(params)}`
  }

  /**
   * Get data from cache
   * @param {string} key - Cache key
   * @returns {*} Cached data or null
   */
  _getFromCache(key) {
    const cached = this.cache.get(key)

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    if (cached) {
      this.cache.delete(key)
    }

    return null
  }

  /**
   * Set data in cache
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   */
  _setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * Clear cache for this collection
   */
  _clearCache() {
    for (const [key] of this.cache) {
      if (key.startsWith(`${this.collectionName}:`)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    const stats = {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      hitRate: 0, // Would need to track hits/misses
    }

    return stats
  }

  // Abstract methods that must be implemented by child classes

  /**
   * Create a record (to be implemented by child classes)
   * @param {Object} data - Record data
   * @param {Object} options - Creation options
   * @returns {Promise<Object>} Created record
   */
  async _createRecord() {
    throw new Error('_createRecord must be implemented by child class')
  }

  /**
   * Find records (to be implemented by child classes)
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Found records
   */
  async _findRecords() {
    throw new Error('_findRecords must be implemented by child class')
  }

  /**
   * Find record by ID (to be implemented by child classes)
   * @param {string} id - Record ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Found record
   */
  async _findRecordById() {
    throw new Error('_findRecordById must be implemented by child class')
  }

  /**
   * Update record (to be implemented by child classes)
   * @param {string} id - Record ID
   * @param {Object} data - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Updated record
   */
  async _updateRecord() {
    throw new Error('_updateRecord must be implemented by child class')
  }

  /**
   * Delete record (to be implemented by child classes)
   * @param {string} id - Record ID
   * @param {Object} options - Delete options
   * @returns {Promise<void>}
   */
  async _deleteRecord() {
    throw new Error('_deleteRecord must be implemented by child class')
  }

  /**
   * Count records (to be implemented by child classes)
   * @param {Object} criteria - Search criteria
   * @returns {Promise<number>} Record count
   */
  async _countRecords() {
    throw new Error('_countRecords must be implemented by child class')
  }

  /**
   * Execute bulk operation (to be implemented by child classes)
   * @param {Object} operation - Bulk operation
   * @returns {Promise<Object>} Operation result
   */
  async _executeBulkOperation() {
    throw new Error('_executeBulkOperation must be implemented by child class')
  }
}
