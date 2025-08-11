import { ref } from 'vue'
import { Notify } from 'quasar'
import { ERROR_MESSAGES } from '../utils/constants.js'

/**
 * Reusable error handling composable
 * Provides consistent error handling across the application
 */
export function useErrorHandling() {
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Handle errors with consistent notification and logging
   * @param {Error|string} error - The error to handle
   * @param {string} defaultMessage - Default message if error doesn't have one
   * @param {Object} options - Additional options for notification
   */
  const handleError = (err, defaultMessage = ERROR_MESSAGES.UNKNOWN_ERROR, options = {}) => {
    const message = err?.message || err || defaultMessage
    error.value = message

    console.error('Error occurred:', err)

    Notify.create({
      type: 'negative',
      message,
      position: 'top',
      timeout: 3000,
      ...options,
    })

    return message
  }

  /**
   * Handle success with consistent notification
   * @param {string} message - Success message
   * @param {Object} options - Additional options for notification
   */
  const handleSuccess = (message, options = {}) => {
    error.value = null

    Notify.create({
      type: 'positive',
      message,
      position: 'top',
      timeout: 2000,
      ...options,
    })
  }

  /**
   * Handle info messages
   * @param {string} message - Info message
   * @param {Object} options - Additional options for notification
   */
  const handleInfo = (message, options = {}) => {
    Notify.create({
      type: 'info',
      message,
      position: 'top',
      timeout: 3000,
      ...options,
    })
  }

  /**
   * Handle warnings
   * @param {string} message - Warning message
   * @param {Object} options - Additional options for notification
   */
  const handleWarning = (message, options = {}) => {
    Notify.create({
      type: 'warning',
      message,
      position: 'top',
      timeout: 4000,
      ...options,
    })
  }

  /**
   * Clear current error
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Execute async operation with error handling
   * @param {Function} operation - Async operation to execute
   * @param {string} errorMessage - Error message if operation fails
   * @param {string} successMessage - Success message if operation succeeds
   * @returns {Promise<any>} - Result of the operation
   */
  const executeWithErrorHandling = async (
    operation,
    errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR,
    successMessage = null,
  ) => {
    isLoading.value = true
    clearError()

    try {
      const result = await operation()

      if (successMessage) {
        handleSuccess(successMessage)
      }

      return result
    } catch (err) {
      handleError(err, errorMessage)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Validate required fields
   * @param {Object} fields - Object with field names and values
   * @param {Array} requiredFields - Array of required field names
   * @returns {boolean} - True if all required fields are present
   */
  const validateRequiredFields = (fields, requiredFields) => {
    for (const field of requiredFields) {
      if (!fields[field] || fields[field].toString().trim() === '') {
        handleError(ERROR_MESSAGES.REQUIRED_FIELD.replace('{field}', field))
        return false
      }
    }
    return true
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - True if email is valid
   */
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      handleError(ERROR_MESSAGES.INVALID_EMAIL)
      return false
    }
    return true
  }

  /**
   * Validate number range
   * @param {number} value - Value to validate
   * @param {number} min - Minimum allowed value
   * @param {number} max - Maximum allowed value
   * @param {string} fieldName - Name of the field for error message
   * @returns {boolean} - True if value is within range
   */
  const validateNumberRange = (value, min, max, fieldName) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue < min || numValue > max) {
      handleError(`${fieldName} must be between ${min} and ${max}`)
      return false
    }
    return true
  }

  return {
    // State
    isLoading,
    error,

    // Methods
    handleError,
    handleSuccess,
    handleInfo,
    handleWarning,
    clearError,
    executeWithErrorHandling,
    validateRequiredFields,
    validateEmail,
    validateNumberRange,
  }
}
