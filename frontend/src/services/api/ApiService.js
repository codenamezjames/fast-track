/**
 * Unified API Service
 * Provides consistent API handling with interceptors and offline queue
 */

import { BaseService } from '../base/BaseService.js'
import { MealsRepository } from '../../repositories/MealsRepository.js'

export class ApiService extends BaseService {
  constructor() {
    super({
      retryAttempts: 3,
      retryDelay: 1000,
      timeout: 15000,
      enableLogging: true,
    })

    this.repositories = {
      meals: new MealsRepository(),
    }

    this._setupInterceptors()
  }

  /**
   * Set up request and response interceptors
   */
  _setupInterceptors() {
    // Request interceptor - add authentication headers
    this.addRequestInterceptor(async (args) => {
      const [endpoint, options = {}] = args

      // Add auth headers if available
      const token = localStorage.getItem('fasttrack-token')
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        }
      }

      // Add request ID for tracking
      options.headers = {
        ...options.headers,
        'X-Request-ID': this._generateRequestId(),
      }

      return [endpoint, options]
    })

    // Response interceptor - handle common responses
    this.addResponseInterceptor((response) => {
      // Log response for debugging
      this._log('API Response:', response)

      // Handle common error patterns
      if (response && response.error) {
        this._handleApiError(response.error)
      }

      return response
    })
  }

  /**
   * Generate unique request ID
   * @returns {string} Request ID
   */
  _generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Handle API errors
   * @param {Object} error - API error
   */
  _handleApiError(error) {
    switch (error.code) {
      case 'UNAUTHORIZED':
        this._handleAuthError()
        break
      case 'RATE_LIMITED':
        this._handleRateLimitError()
        break
      case 'NETWORK_ERROR':
        this._handleNetworkError()
        break
      default:
        this._logError('API Error:', error)
    }
  }

  /**
   * Handle authentication errors
   */
  _handleAuthError() {
    this._log('Authentication error - redirecting to login')
    // Clear auth data and redirect to login
    localStorage.removeItem('fasttrack-token')
    localStorage.removeItem('fasttrack-user')
    window.location.href = '/login'
  }

  /**
   * Handle rate limit errors
   */
  _handleRateLimitError() {
    this._log('Rate limit exceeded - implementing backoff')
    // Implement exponential backoff
    this.config.retryDelay *= 2
  }

  /**
   * Handle network errors
   */
  _handleNetworkError() {
    this._log('Network error - switching to offline mode')
    this.setOnlineStatus(false)
  }

  /**
   * Execute queued operation
   * @param {Object} operation - Queued operation
   * @returns {Promise} Operation result
   */
  async _executeQueuedOperation(operation) {
    const { type, data } = operation

    switch (type) {
      case 'CREATE_MEAL':
        return await this.repositories.meals.create(data)
      case 'UPDATE_MEAL':
        return await this.repositories.meals.update(data.id, data)
      case 'DELETE_MEAL':
        return await this.repositories.meals.delete(data.id)
      default:
        throw new Error(`Unknown operation type: ${type}`)
    }
  }

  /**
   * Get repository by name
   * @param {string} name - Repository name
   * @returns {BaseRepository} Repository instance
   */
  getRepository(name) {
    if (!this.repositories[name]) {
      throw new Error(`Repository not found: ${name}`)
    }
    return this.repositories[name]
  }

  /**
   * Health check
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    return this.executeWithRetry(
      async () => {
        const status = {
          online: this.isOnline,
          repositories: {},
          queue: this.getQueueStatus(),
        }

        // Check each repository
        for (const [name, repo] of Object.entries(this.repositories)) {
          try {
            await repo.count()
            status.repositories[name] = { status: 'healthy' }
          } catch (error) {
            status.repositories[name] = {
              status: 'error',
              error: error.message,
            }
          }
        }

        return status
      },
      {
        errorMessage: 'Health check failed',
      },
    )
  }

  /**
   * Sync all data
   * @returns {Promise<Object>} Sync results
   */
  async syncAll() {
    return this.executeWithRetry(
      async () => {
        const results = {}

        for (const [name, repo] of Object.entries(this.repositories)) {
          try {
            const result = await repo.processQueue()
            results[name] = { success: true, synced: result.length }
          } catch (error) {
            results[name] = { success: false, error: error.message }
          }
        }

        return results
      },
      {
        errorMessage: 'Sync failed',
      },
    )
  }

  /**
   * Export all data
   * @returns {Promise<Object>} All data
   */
  async exportAll() {
    return this.executeWithRetry(
      async () => {
        const data = {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
        }

        // Export from each repository
        for (const [name, repo] of Object.entries(this.repositories)) {
          try {
            const result = await repo.find()
            data[name] = result
          } catch (error) {
            data[name] = { error: error.message }
          }
        }

        return data
      },
      {
        errorMessage: 'Export failed',
      },
    )
  }

  /**
   * Import all data
   * @param {Object} data - Data to import
   * @returns {Promise<Object>} Import results
   */
  async importAll(data) {
    return this.executeWithRetry(
      async () => {
        const results = {}

        for (const [name, repo] of Object.entries(this.repositories)) {
          if (data[name] && Array.isArray(data[name])) {
            try {
              // Clear existing data
              await repo.clearAllData()

              // Import new data
              const imported = []
              for (const item of data[name]) {
                const result = await repo.create(item)
                imported.push(result)
              }

              results[name] = {
                success: true,
                imported: imported.length,
              }
            } catch (error) {
              results[name] = {
                success: false,
                error: error.message,
              }
            }
          }
        }

        return results
      },
      {
        errorMessage: 'Import failed',
      },
    )
  }

  /**
   * Get service statistics
   * @returns {Object} Service statistics
   */
  getStats() {
    const stats = {
      online: this.isOnline,
      queue: this.getQueueStatus(),
      repositories: {},
    }

    for (const [name, repo] of Object.entries(this.repositories)) {
      stats.repositories[name] = {
        cache: repo.getCacheStats(),
        queue: repo.getQueueStatus(),
      }
    }

    return stats
  }

  /**
   * Initialize API service
   * @returns {Promise}
   */
  async init() {
    await super.init()

    // Initialize all repositories
    for (const repo of Object.values(this.repositories)) {
      await repo.init()
    }

    this._log('API Service initialized')
  }

  /**
   * Cleanup API service
   * @returns {Promise}
   */
  async cleanup() {
    await super.cleanup()

    // Cleanup all repositories
    for (const repo of Object.values(this.repositories)) {
      await repo.cleanup()
    }

    this._log('API Service cleaned up')
  }
}
