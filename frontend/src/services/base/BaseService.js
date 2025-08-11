/**
 * Base Service Class
 * Provides common functionality for all services including:
 * - Error handling and retry logic
 * - Request/response interceptors
 * - Offline/online mode handling
 * - Logging and debugging
 *
 * @module BaseService
 * @example
 * ```javascript
 * import { BaseService } from './base/BaseService.js'
 *
 * class MyService extends BaseService {
 *   constructor() {
 *     super({
 *       retryAttempts: 3,
 *       timeout: 10000
 *     })
 *   }
 *
 *   async fetchData() {
 *     return this.executeWithRetry(async () => {
 *       // API call implementation
 *     })
 *   }
 * }
 * ```
 */

// import { useErrorHandling } from '../../composables/useErrorHandling.js'
// import { ERROR_MESSAGES } from '../../utils/constants.js'

export class BaseService {
  constructor(config = {}) {
    this.config = {
      retryAttempts: 3,
      retryDelay: 1000,
      timeout: 10000,
      enableLogging: true,
      ...config,
    }

    this.isOnline = true
    this.requestQueue = []
    this.responseInterceptors = []
    this.requestInterceptors = []
  }

  /**
   * Execute an operation with retry logic and error handling
   *
   * @method executeWithRetry
   * @memberof module:BaseService
   * @param {Function} operation - The operation to execute
   * @param {Object} [options={}] - Execution options
   * @param {number} [options.retryAttempts=3] - Number of retry attempts
   * @param {number} [options.retryDelay=1000] - Delay between retries in milliseconds
   * @param {number} [options.timeout=10000] - Operation timeout in milliseconds
   * @param {string} [options.errorMessage='Operation failed'] - Custom error message
   * @returns {Promise<*>} Operation result
   *
   * @description
   * Executes an operation with automatic retry logic, timeout handling,
   * and standardized error handling. Supports exponential backoff and
   * request/response interceptors.
   *
   * @example
   * ```javascript
   * const result = await this.executeWithRetry(async () => {
   *   const response = await fetch('/api/data')
   *   return response.json()
   * }, {
   *   retryAttempts: 3,
   *   timeout: 5000,
   *   errorMessage: 'Failed to fetch data'
   * })
   * ```
   *
   * @throws {Error} When all retry attempts fail
   */
  async executeWithRetry(operation, options = {}) {
    const {
      retryAttempts = this.config.retryAttempts,
      retryDelay = this.config.retryDelay,
      timeout = this.config.timeout,
      errorMessage = 'Operation failed',
    } = options

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        // Apply request interceptors
        const interceptedOperation = this._applyRequestInterceptors(operation)

        // Execute with timeout
        const result = await this._executeWithTimeout(interceptedOperation, timeout)

        // Apply response interceptors
        return this._applyResponseInterceptors(result)
      } catch (error) {
        // Error tracking disabled

        this._logError(`Attempt ${attempt} failed:`, error)

        if (attempt === retryAttempts) {
          this._logError(`All ${retryAttempts} attempts failed`)
          throw new Error(`${errorMessage}: ${error.message}`)
        }

        // Wait before retry
        await this._delay(retryDelay * attempt)
      }
    }
  }

  /**
   * Execute operation with timeout
   * @param {Function} operation - The operation to execute
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise} Operation result
   */
  async _executeWithTimeout(operation, timeout) {
    return Promise.race([
      operation(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), timeout),
      ),
    ])
  }

  /**
   * Add request interceptor
   * @param {Function} interceptor - Interceptor function
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * Add response interceptor
   * @param {Function} interceptor - Interceptor function
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor)
  }

  /**
   * Apply request interceptors
   * @param {Function} operation - Original operation
   * @returns {Function} Intercepted operation
   */
  _applyRequestInterceptors(operation) {
    return async (...args) => {
      let interceptedArgs = args

      for (const interceptor of this.requestInterceptors) {
        interceptedArgs = await interceptor(interceptedArgs)
      }

      return operation(...interceptedArgs)
    }
  }

  /**
   * Apply response interceptors
   * @param {*} response - Response data
   * @returns {*} Intercepted response
   */
  _applyResponseInterceptors(response) {
    let interceptedResponse = response

    for (const interceptor of this.responseInterceptors) {
      interceptedResponse = interceptor(interceptedResponse)
    }

    return interceptedResponse
  }

  /**
   * Queue operation for offline execution
   * @param {string} operationType - Type of operation
   * @param {Object} data - Operation data
   */
  queueOperation(operationType, data) {
    const queuedOperation = {
      id: Date.now() + Math.random(),
      type: operationType,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    }

    this.requestQueue.push(queuedOperation)
    this._saveQueue()

    this._log(`Operation queued: ${operationType}`)
  }

  /**
   * Process queued operations when online
   * @returns {Promise<Array>} Results of processed operations
   */
  async processQueue() {
    if (!this.isOnline || this.requestQueue.length === 0) {
      return []
    }

    const results = []
    const failedOperations = []

    for (const operation of this.requestQueue) {
      try {
        const result = await this._executeQueuedOperation(operation)
        results.push({ ...operation, success: true, result })
      } catch (error) {
        operation.retryCount++

        if (operation.retryCount >= this.config.retryAttempts) {
          failedOperations.push({ ...operation, error: error.message })
        } else {
          // Keep in queue for retry
          failedOperations.push(operation)
        }
      }
    }

    // Update queue with failed operations
    this.requestQueue = failedOperations
    this._saveQueue()

    this._log(`Processed ${results.length} operations, ${failedOperations.length} failed`)
    return results
  }

  /**
   * Execute a queued operation
   * @param {Object} operation - Queued operation
   * @returns {Promise} Operation result
   */
  async _executeQueuedOperation() {
    // This should be overridden by child classes
    throw new Error('Queued operation execution not implemented')
  }

  /**
   * Set online status
   * @param {boolean} isOnline - Online status
   */
  setOnlineStatus(isOnline) {
    this.isOnline = isOnline

    if (isOnline) {
      this.processQueue()
    }
  }

  /**
   * Handle network errors
   * @param {Error} error - Network error
   * @param {Function} fallback - Fallback operation
   * @returns {Promise} Fallback result
   */
  async handleNetworkError(error, fallback) {
    this._logError('Network error:', error)

    if (fallback) {
      this._log('Using fallback operation')
      return await fallback()
    }

    throw error
  }

  /**
   * Validate response data
   * @param {*} data - Response data
   * @param {Object} schema - Validation schema
   * @returns {boolean} Validation result
   */
  validateResponse(data, schema) {
    // Basic validation - can be extended with a proper validation library
    if (!data) return false

    for (const [key, required] of Object.entries(schema)) {
      if (required && !(key in data)) {
        this._logError(`Missing required field: ${key}`)
        return false
      }
    }

    return true
  }

  /**
   * Create standardized API response
   * @param {*} data - Response data
   * @param {boolean} success - Success status
   * @param {string} message - Response message
   * @returns {Object} Standardized response
   */
  createResponse(data = null, success = true, message = '') {
    return {
      success,
      data,
      message,
      timestamp: new Date().toISOString(),
      online: this.isOnline,
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - API error
   * @returns {Object} Error response
   */
  handleError(error) {
    const errorResponse = {
      success: false,
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString(),
    }

    this._logError('API Error:', errorResponse)
    return errorResponse
  }

  /**
   * Log message if logging is enabled
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments
   */
  _log(message, ...args) {
    if (this.config.enableLogging) {
      console.log(`[${this.constructor.name}] ${message}`, ...args)
    }
  }

  /**
   * Log error if logging is enabled
   * @param {string} message - Error message
   * @param {...any} args - Additional arguments
   */
  _logError(message, ...args) {
    if (this.config.enableLogging) {
      console.error(`[${this.constructor.name}] ${message}`, ...args)
    }
  }

  /**
   * Delay execution
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Delay promise
   */
  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Save queue to storage
   */
  _saveQueue() {
    try {
      localStorage.setItem(`${this.constructor.name}-queue`, JSON.stringify(this.requestQueue))
    } catch (error) {
      this._logError('Failed to save queue:', error)
    }
  }

  /**
   * Load queue from storage
   */
  _loadQueue() {
    try {
      const saved = localStorage.getItem(`${this.constructor.name}-queue`)
      if (saved) {
        this.requestQueue = JSON.parse(saved)
      }
    } catch (error) {
      this._logError('Failed to load queue:', error)
      this.requestQueue = []
    }
  }

  /**
   * Clear queue
   */
  clearQueue() {
    this.requestQueue = []
    this._saveQueue()
    this._log('Queue cleared')
  }

  /**
   * Get queue status
   * @returns {Object} Queue status
   */
  getQueueStatus() {
    return {
      length: this.requestQueue.length,
      operations: this.requestQueue.map((op) => ({
        type: op.type,
        timestamp: op.timestamp,
        retryCount: op.retryCount,
      })),
    }
  }

  /**
   * Initialize service
   * @returns {Promise}
   */
  async init() {
    this._loadQueue()
    this._log('Service initialized')
  }

  /**
   * Cleanup service
   * @returns {Promise}
   */
  async cleanup() {
    this._saveQueue()
    this._log('Service cleaned up')
  }
}
