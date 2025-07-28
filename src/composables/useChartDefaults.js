import { computed } from 'vue'
import { useThemeStore } from '../stores/theme.js'
import { CHART_CONFIG } from '../utils/constants.js'

/**
 * Reusable chart configuration composable
 * Provides consistent chart styling and configuration
 */
export function useChartDefaults() {
  const themeStore = useThemeStore()

  /**
   * Get chart colors based on current theme
   */
  const chartColors = computed(() => {
    return themeStore.isDarkMode ? CHART_CONFIG.DARK_MODE_COLORS : CHART_CONFIG.COLORS
  })

  /**
   * Get text color based on current theme
   */
  const textColor = computed(() => {
    return themeStore.isDarkMode ? '#FFFFFF' : '#000000'
  })

  /**
   * Get grid color based on current theme
   */
  const gridColor = computed(() => {
    return themeStore.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  })

  /**
   * Get background color based on current theme
   */
  const backgroundColor = computed(() => {
    return themeStore.isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)'
  })

  /**
   * Get border color based on current theme
   */
  const borderColor = computed(() => {
    return themeStore.isDarkMode ? '#60a5fa' : '#4f7cff'
  })

  /**
   * Get default chart options
   * @param {Object} customOptions - Additional options to merge
   * @returns {Object} - Chart.js options object
   */
  const getDefaultChartOptions = (customOptions = {}) => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: backgroundColor.value,
          titleColor: textColor.value,
          bodyColor: textColor.value,
          borderColor: borderColor.value,
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: false,
          ...customOptions.tooltip,
        },
      },
      scales: {
        x: {
          grid: {
            color: gridColor.value,
            borderColor: gridColor.value,
          },
          ticks: {
            color: textColor.value,
            font: {
              size: 12,
            },
            maxRotation: 45,
            minRotation: 0,
          },
        },
        y: {
          grid: {
            color: gridColor.value,
            borderColor: gridColor.value,
          },
          ticks: {
            color: textColor.value,
            font: {
              size: 12,
            },
          },
        },
      },
      elements: {
        point: {
          hoverRadius: 8,
        },
      },
      animation: {
        duration: CHART_CONFIG.ANIMATION_DURATION,
      },
      ...customOptions,
    }
  }

  /**
   * Get line chart dataset configuration
   * @param {string} label - Dataset label
   * @param {Array} data - Chart data
   * @param {string} color - Line color
   * @param {Object} customConfig - Additional configuration
   * @returns {Object} - Chart.js dataset object
   */
  const getLineDataset = (label, data, color, customConfig = {}) => {
    return {
      label,
      data,
      borderColor: color,
      backgroundColor: `${color}20`, // 20% opacity
      fill: true,
      tension: 0.4,
      pointBackgroundColor: color,
      pointBorderColor: color,
      pointHoverBackgroundColor: color,
      pointHoverBorderColor: '#FFFFFF',
      pointRadius: 5,
      pointHoverRadius: 7,
      borderWidth: 3,
      ...customConfig,
    }
  }

  /**
   * Get bar chart dataset configuration
   * @param {string} label - Dataset label
   * @param {Array} data - Chart data
   * @param {string} color - Bar color
   * @param {Object} customConfig - Additional configuration
   * @returns {Object} - Chart.js dataset object
   */
  const getBarDataset = (label, data, color, customConfig = {}) => {
    return {
      label,
      data,
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1,
      borderRadius: 4,
      ...customConfig,
    }
  }

  /**
   * Get pie/doughnut chart dataset configuration
   * @param {string} label - Dataset label
   * @param {Array} data - Chart data
   * @param {Array} colors - Array of colors for each segment
   * @param {Object} customConfig - Additional configuration
   * @returns {Object} - Chart.js dataset object
   */
  const getPieDataset = (label, data, colors, customConfig = {}) => {
    return {
      label,
      data,
      backgroundColor: colors,
      borderColor: colors.map((color) => `${color}80`), // 80% opacity
      borderWidth: 2,
      ...customConfig,
    }
  }

  /**
   * Get chart container styles
   * @param {number} height - Chart height in pixels
   * @returns {Object} - CSS styles object
   */
  const getChartContainerStyles = (height = 200) => {
    return {
      position: 'relative',
      width: '100%',
      minHeight: `${height}px`,
      borderRadius: '8px',
      border: `1px solid ${gridColor.value}`,
      background: 'var(--q-background)',
      padding: '16px',
    }
  }

  /**
   * Get loading state styles
   * @returns {Object} - CSS styles object
   */
  const getLoadingStyles = () => {
    return {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '220px',
      width: '100%',
    }
  }

  /**
   * Get no data state styles
   * @returns {Object} - CSS styles object
   */
  const getNoDataStyles = () => {
    return {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '220px',
      width: '100%',
      color: themeStore.isDarkMode ? '#9CA3AF' : '#6B7280',
    }
  }

  /**
   * Get responsive breakpoints for charts
   * @returns {Object} - Breakpoint configuration
   */
  const getResponsiveBreakpoints = () => {
    return CHART_CONFIG.RESPONSIVE_BREAKPOINTS
  }

  /**
   * Format number for chart tooltips
   * @param {number} value - Value to format
   * @param {string} unit - Unit to append
   * @returns {string} - Formatted value
   */
  const formatChartValue = (value, unit = '') => {
    if (typeof value !== 'number') return value
    return `${value.toLocaleString()}${unit}`
  }

  /**
   * Format date for chart labels
   * @param {string|Date} date - Date to format
   * @param {string} format - Format style ('short', 'medium', 'long')
   * @returns {string} - Formatted date
   */
  const formatChartDate = (date, format = 'short') => {
    const dateObj = new Date(date)
    const options = {
      short: { month: 'short', day: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' },
    }

    return dateObj.toLocaleDateString('en-US', options[format] || options.short)
  }

  return {
    // Theme-aware colors
    chartColors,
    textColor,
    gridColor,
    backgroundColor,
    borderColor,

    // Configuration functions
    getDefaultChartOptions,
    getLineDataset,
    getBarDataset,
    getPieDataset,

    // Style functions
    getChartContainerStyles,
    getLoadingStyles,
    getNoDataStyles,
    getResponsiveBreakpoints,

    // Utility functions
    formatChartValue,
    formatChartDate,
  }
}
