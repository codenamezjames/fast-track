import { useErrorHandling } from './useErrorHandling.js'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js'

/**
 * Reusable data export composable
 * Handles CSV and JSON export functionality
 */
export function useDataExport() {
  const { handleError, handleSuccess, executeWithErrorHandling } = useErrorHandling()

  /**
   * Convert data to CSV format
   * @param {Array} data - Array of objects to convert
   * @param {Array} fields - Array of field names to include
   * @param {Object} fieldMappings - Optional mapping of field names to display names
   * @returns {string} - CSV string
   */
  const generateCSV = (data, fields, fieldMappings = {}) => {
    if (!data || data.length === 0) {
      throw new Error('No data to export')
    }

    // Create header row
    const headers = fields.map((field) => fieldMappings[field] || field)
    const csvRows = [headers.join(',')]

    // Create data rows
    data.forEach((item) => {
      const row = fields.map((field) => {
        let value = item[field]

        // Handle different data types
        if (value === null || value === undefined) {
          value = ''
        } else if (typeof value === 'object') {
          value = JSON.stringify(value)
        } else if (typeof value === 'string' && value.includes(',')) {
          // Escape commas in strings
          value = `"${value}"`
        }

        return value
      })
      csvRows.push(row.join(','))
    })

    return csvRows.join('\n')
  }

  /**
   * Download data as CSV file
   * @param {string} csvContent - CSV content to download
   * @param {string} filename - Name of the file
   */
  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  /**
   * Export data as JSON
   * @param {Array} data - Data to export
   * @param {string} filename - Name of the file
   */
  const exportJSON = (data, filename) => {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  /**
   * Export meals data
   * @param {Array} meals - Array of meal objects
   * @returns {Promise<void>}
   */
  const exportMealsData = async (meals) => {
    return executeWithErrorHandling(
      async () => {
        const fields = ['meal_time', 'calories', 'notes']
        const fieldMappings = {
          meal_time: 'Date & Time',
          calories: 'Calories',
          notes: 'Notes',
        }

        const csvContent = generateCSV(meals, fields, fieldMappings)
        downloadCSV(csvContent, 'meals-data.csv')
      },
      ERROR_MESSAGES.SAVE_FAILED,
      SUCCESS_MESSAGES.DATA_EXPORTED,
    )
  }

  /**
   * Export fasting sessions data
   * @param {Array} sessions - Array of fasting session objects
   * @returns {Promise<void>}
   */
  const exportFastingData = async (sessions) => {
    return executeWithErrorHandling(
      async () => {
        const fields = ['start_time', 'end_time', 'planned_duration', 'actual_duration', 'status']
        const fieldMappings = {
          start_time: 'Start Time',
          end_time: 'End Time',
          planned_duration: 'Planned Duration (hours)',
          actual_duration: 'Actual Duration (hours)',
          status: 'Status',
        }

        const csvContent = generateCSV(sessions, fields, fieldMappings)
        downloadCSV(csvContent, 'fasting-sessions.csv')
      },
      ERROR_MESSAGES.SAVE_FAILED,
      SUCCESS_MESSAGES.DATA_EXPORTED,
    )
  }

  /**
   * Export weight entries data
   * @param {Array} entries - Array of weight entry objects
   * @returns {Promise<void>}
   */
  const exportWeightData = async (entries) => {
    return executeWithErrorHandling(
      async () => {
        const fields = ['date', 'weight']
        const fieldMappings = {
          date: 'Date',
          weight: 'Weight',
        }

        const csvContent = generateCSV(entries, fields, fieldMappings)
        downloadCSV(csvContent, 'weight-entries.csv')
      },
      ERROR_MESSAGES.SAVE_FAILED,
      SUCCESS_MESSAGES.DATA_EXPORTED,
    )
  }

  /**
   * Export all data as JSON
   * @param {Object} allData - Object containing all data types
   * @returns {Promise<void>}
   */
  const exportAllData = async (allData) => {
    return executeWithErrorHandling(
      async () => {
        const exportData = {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          data: allData,
        }

        exportJSON(exportData, 'fasttrack-data-export.json')
      },
      ERROR_MESSAGES.SAVE_FAILED,
      SUCCESS_MESSAGES.DATA_EXPORTED,
    )
  }

  /**
   * Share data via Web Share API (mobile)
   * @param {string} title - Title of the share
   * @param {string} text - Text content
   * @param {string} url - URL to share (optional)
   */
  const shareData = async (title, text, url = null) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        })
        handleSuccess('Data shared successfully')
      } catch (error) {
        if (error.name !== 'AbortError') {
          handleError(error, 'Failed to share data')
        }
      }
    } else {
      // Fallback for browsers without Web Share API
      // Assuming handleInfo is available from useErrorHandling or a global function
      // If not, this line would cause an error. For now, commenting out as per original file.
      // handleInfo('Sharing not supported in this browser')
    }
  }

  /**
   * Print data (for reports)
   * @param {string} content - HTML content to print
   * @param {string} title - Title for the print window
   */
  const printData = (content, title = 'FastTrack Report') => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 20px; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          ${content}
          <div class="footer">
            <p>FastTrack Energy Tracker - Health & Fitness Data</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return {
    // Core export functions
    generateCSV,
    downloadCSV,
    exportJSON,

    // Specific data exports
    exportMealsData,
    exportFastingData,
    exportWeightData,
    exportAllData,

    // Sharing and printing
    shareData,
    printData,
  }
}
