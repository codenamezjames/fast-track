/**
 * Custom Error Types for FastTrack Application
 * Provides consistent error handling across the application
 */

/**
 * Base error class for all application errors
 * @extends {Error}
 */
export class FastTrackError extends Error {
  /**
   * Create a new FastTrackError
   * @param {string} message - Error message
   * @param {string} code - Error code for identification
   * @param {Object} [details] - Additional error details
   */
  constructor(message, code = 'UNKNOWN_ERROR', details = {}) {
    super(message)
    this.name = 'FastTrackError'
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

/**
 * Validation error for invalid data
 * @extends {FastTrackError}
 */
export class ValidationError extends FastTrackError {
  /**
   * Create a new ValidationError
   * @param {string} field - Field that failed validation
   * @param {string} message - Validation error message
   * @param {Object} [details] - Additional validation details
   */
  constructor(field, message, details = {}) {
    super(message, 'VALIDATION_ERROR', { field, ...details })
    this.name = 'ValidationError'
    this.field = field
  }
}

/**
 * Network error for API communication issues
 * @extends {FastTrackError}
 */
export class NetworkError extends FastTrackError {
  /**
   * Create a new NetworkError
   * @param {string} message - Network error message
   * @param {number} [statusCode] - HTTP status code
   * @param {string} [url] - Request URL that failed
   * @param {Object} [details] - Additional network details
   */
  constructor(message, statusCode = null, url = null, details = {}) {
    super(message, 'NETWORK_ERROR', { statusCode, url, ...details })
    this.name = 'NetworkError'
    this.statusCode = statusCode
    this.url = url
  }
}

/**
 * Authentication error for user auth issues
 * @extends {FastTrackError}
 */
export class AuthError extends FastTrackError {
  /**
   * Create a new AuthError
   * @param {string} message - Authentication error message
   * @param {string} [action] - Action that failed authentication
   * @param {Object} [details] - Additional auth details
   */
  constructor(message, action = null, details = {}) {
    super(message, 'AUTH_ERROR', { action, ...details })
    this.name = 'AuthError'
    this.action = action
  }
}

/**
 * Storage error for local data issues
 * @extends {FastTrackError}
 */
export class StorageError extends FastTrackError {
  /**
   * Create a new StorageError
   * @param {string} message - Storage error message
   * @param {string} [operation] - Storage operation that failed
   * @param {string} [key] - Storage key that failed
   * @param {Object} [details] - Additional storage details
   */
  constructor(message, operation = null, key = null, details = {}) {
    super(message, 'STORAGE_ERROR', { operation, key, ...details })
    this.name = 'StorageError'
    this.operation = operation
    this.key = key
  }
}

/**
 * Sync error for data synchronization issues
 * @extends {FastTrackError}
 */
export class SyncError extends FastTrackError {
  /**
   * Create a new SyncError
   * @param {string} message - Sync error message
   * @param {string} [direction] - Sync direction (upload/download)
   * @param {string} [entity] - Entity that failed to sync
   * @param {Object} [details] - Additional sync details
   */
  constructor(message, direction = null, entity = null, details = {}) {
    super(message, 'SYNC_ERROR', { direction, entity, ...details })
    this.name = 'SyncError'
    this.direction = direction
    this.entity = entity
  }
}

/**
 * Performance error for performance-related issues
 * @extends {FastTrackError}
 */
export class PerformanceError extends FastTrackError {
  /**
   * Create a new PerformanceError
   * @param {string} message - Performance error message
   * @param {string} [operation] - Operation that caused performance issue
   * @param {number} [duration] - Duration of the slow operation
   * @param {Object} [details] - Additional performance details
   */
  constructor(message, operation = null, duration = null, details = {}) {
    super(message, 'PERFORMANCE_ERROR', { operation, duration, ...details })
    this.name = 'PerformanceError'
    this.operation = operation
    this.duration = duration
  }
}

/**
 * Error factory for creating typed errors
 */
export class ErrorFactory {
  /**
   * Create a validation error
   * @param {string} field - Field that failed validation
   * @param {string} message - Validation message
   * @param {Object} [details] - Additional details
   * @returns {ValidationError} Validation error instance
   */
  static validation(field, message, details = {}) {
    return new ValidationError(field, message, details)
  }

  /**
   * Create a network error
   * @param {string} message - Network error message
   * @param {number} [statusCode] - HTTP status code
   * @param {string} [url] - Request URL
   * @param {Object} [details] - Additional details
   * @returns {NetworkError} Network error instance
   */
  static network(message, statusCode = null, url = null, details = {}) {
    return new NetworkError(message, statusCode, url, details)
  }

  /**
   * Create an authentication error
   * @param {string} message - Auth error message
   * @param {string} [action] - Failed action
   * @param {Object} [details] - Additional details
   * @returns {AuthError} Authentication error instance
   */
  static auth(message, action = null, details = {}) {
    return new AuthError(message, action, details)
  }

  /**
   * Create a storage error
   * @param {string} message - Storage error message
   * @param {string} [operation] - Failed operation
   * @param {string} [key] - Storage key
   * @param {Object} [details] - Additional details
   * @returns {StorageError} Storage error instance
   */
  static storage(message, operation = null, key = null, details = {}) {
    return new StorageError(message, operation, key, details)
  }

  /**
   * Create a sync error
   * @param {string} message - Sync error message
   * @param {string} [direction] - Sync direction
   * @param {string} [entity] - Failed entity
   * @param {Object} [details] - Additional details
   * @returns {SyncError} Sync error instance
   */
  static sync(message, direction = null, entity = null, details = {}) {
    return new SyncError(message, direction, entity, details)
  }

  /**
   * Create a performance error
   * @param {string} message - Performance error message
   * @param {string} [operation] - Slow operation
   * @param {number} [duration] - Operation duration
   * @param {Object} [details] - Additional details
   * @returns {PerformanceError} Performance error instance
   */
  static performance(message, operation = null, duration = null, details = {}) {
    return new PerformanceError(message, operation, duration, details)
  }
}

/**
 * Error utilities for common error handling patterns
 */
export class ErrorUtils {
  /**
   * Check if an error is a specific type
   * @param {Error} error - Error to check
   * @param {string} type - Error type name
   * @returns {boolean} True if error is of specified type
   */
  static isType(error, type) {
    return error instanceof FastTrackError && error.name === type
  }

  /**
   * Get user-friendly error message
   * @param {Error} error - Error to get message for
   * @returns {string} User-friendly error message
   */
  static getUserMessage(error) {
    if (error instanceof FastTrackError) {
      return error.message
    }
    return 'An unexpected error occurred. Please try again.'
  }

  /**
   * Log error with context
   * @param {Error} error - Error to log
   * @param {string} context - Error context
   * @param {Object} [additionalData] - Additional data to log
   */
  static logError(error, context, additionalData = {}) {
    const logData = {
      error: {
        name: error.name,
        message: error.message,
        code: error.code || 'UNKNOWN',
        stack: error.stack,
      },
      context,
      timestamp: new Date().toISOString(),
      ...additionalData,
    }

    console.error('FastTrack Error:', logData)

    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: logData })
    }
  }

  /**
   * Handle error with fallback
   * @param {Error} error - Error to handle
   * @param {Function} fallback - Fallback function
   * @param {string} context - Error context
   * @returns {*} Result of fallback function
   */
  static handleWithFallback(error, fallback, context) {
    this.logError(error, context)
    return fallback()
  }
}
