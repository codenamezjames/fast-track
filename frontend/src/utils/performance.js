/**
 * Performance Utilities
 * Collection of performance optimization functions
 */

import { shallowRef } from 'vue'

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Whether to execute immediately
 * @returns {Function} Debounced function
 */
export function debounce(func, wait, immediate = false) {
  let timeout

  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle

  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Memoize function results
 * @param {Function} func - Function to memoize
 * @param {Function} resolver - Cache key resolver
 * @returns {Function} Memoized function
 */
export function memoize(func, resolver = null) {
  const cache = new Map()

  return function memoizedFunction(...args) {
    const key = resolver ? resolver(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)
    }

    const result = func(...args)
    cache.set(key, result)
    return result
  }
}

/**
 * Create a shallow ref for large objects
 * @param {any} value - Initial value
 * @returns {import('vue').ShallowRef} Shallow ref
 */
export function createShallowRef(value) {
  return shallowRef(value)
}

/**
 * Batch DOM updates
 * @param {Function} callback - Function to execute in batch
 */
export function batchUpdate(callback) {
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    requestAnimationFrame(callback)
  } else {
    setTimeout(callback, 0)
  }
}

/**
 * Intersection Observer for lazy loading
 * @param {Element} element - Element to observe
 * @param {Function} callback - Callback when element is visible
 * @param {Object} options - Observer options
 * @returns {IntersectionObserver} Observer instance
 */
export function createIntersectionObserver(element, callback, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options,
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry)
        observer.unobserve(entry.target)
      }
    })
  }, defaultOptions)

  observer.observe(element)
  return observer
}

/**
 * Virtual scrolling helper (for custom implementations)
 * @param {Array} items - Array of items
 * @param {number} itemHeight - Height of each item
 * @param {number} containerHeight - Container height
 * @param {number} scrollTop - Current scroll position
 * @returns {Object} Visible items and offsets
 */
export function getVisibleItems(items, itemHeight, containerHeight, scrollTop) {
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(startIndex + Math.ceil(containerHeight / itemHeight) + 1, items.length)

  const visibleItems = items.slice(startIndex, endIndex)
  const startOffset = startIndex * itemHeight
  const endOffset = (items.length - endIndex) * itemHeight

  return {
    items: visibleItems,
    startOffset,
    endOffset,
    startIndex,
    endIndex,
  }
}

/**
 * Web Worker wrapper for heavy computations
 * @param {Function} workerFunction - Function to run in worker
 * @param {any} data - Data to pass to worker
 * @returns {Promise} Worker result
 */
export function runInWorker(workerFunction, data) {
  return new Promise((resolve, reject) => {
    const blob = new Blob(
      [
        `self.onmessage = function(e) {
        try {
          const result = (${workerFunction.toString()})(e.data)
          self.postMessage({ success: true, result })
        } catch (error) {
          self.postMessage({ success: false, error: error.message })
        }
      }`,
      ],
      { type: 'application/javascript' },
    )

    const worker = new Worker(URL.createObjectURL(blob))

    worker.onmessage = function (e) {
      if (e.data.success) {
        resolve(e.data.result)
      } else {
        reject(new Error(e.data.error))
      }
      worker.terminate()
    }

    worker.onerror = function (error) {
      reject(error)
      worker.terminate()
    }

    worker.postMessage(data)
  })
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.observers = []
  }

  /**
   * Start timing an operation
   * @param {string} name - Operation name
   */
  startTimer(name) {
    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null,
    })
  }

  /**
   * End timing an operation
   * @param {string} name - Operation name
   * @returns {number} Duration in milliseconds
   */
  endTimer(name) {
    const metric = this.metrics.get(name)
    if (!metric) return 0

    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime

    return metric.duration
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getMetrics() {
    const result = {}
    for (const [name, metric] of this.metrics) {
      result[name] = metric
    }
    return result
  }

  /**
   * Monitor long tasks
   * @param {Function} callback - Callback for long tasks
   */
  monitorLongTasks(callback) {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            // Tasks longer than 50ms
            callback(entry)
          }
        }
      })

      observer.observe({ entryTypes: ['longtask'] })
      this.observers.push(observer)
    }
  }

  /**
   * Monitor memory usage
   * @returns {Object} Memory information
   */
  getMemoryInfo() {
    if ('memory' in performance) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
      }
    }
    return null
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
  }
}

/**
 * Create a performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor()

/**
 * Lazy load component
 * @param {Function} importFn - Dynamic import function
 * @returns {Promise} Component promise
 */
export function lazyLoadComponent(importFn) {
  let component = null

  return async () => {
    if (!component) {
      component = await importFn()
    }
    return component
  }
}

/**
 * Preload critical resources
 * @param {Array} resources - Array of resource URLs
 */
export function preloadResources(resources) {
  resources.forEach((url) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url

    if (url.endsWith('.js')) {
      link.as = 'script'
    } else if (url.endsWith('.css')) {
      link.as = 'style'
    }

    document.head.appendChild(link)
  })
}

/**
 * Optimize images for mobile
 * @param {string} src - Image source
 * @param {number} width - Target width
 * @param {number} quality - Image quality (0-100)
 * @returns {string} Optimized image URL
 */
export function optimizeImage(src, width = 800, quality = 80) {
  // This is a placeholder - in a real app you'd use a CDN or image optimization service
  return `${src}?w=${width}&q=${quality}`
}

/**
 * Check if device is low-end
 * @returns {boolean} True if device is low-end
 */
export function isLowEndDevice() {
  if (typeof navigator === 'undefined') return false

  const memory = navigator.deviceMemory || 4
  const cores = navigator.hardwareConcurrency || 4

  return memory < 4 || cores < 4
}

/**
 * Apply performance optimizations based on device capabilities
 */
export function applyDeviceOptimizations() {
  const isLowEnd = isLowEndDevice()

  if (isLowEnd) {
    // Reduce animations and effects
    document.documentElement.style.setProperty('--animation-duration', '0.1s')
    document.documentElement.style.setProperty('--transition-duration', '0.1s')
  }

  return {
    isLowEnd,
    enableAnimations: !isLowEnd,
    enableEffects: !isLowEnd,
    maxDataPoints: isLowEnd ? 50 : 100,
  }
}
