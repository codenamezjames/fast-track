export function useDateUtils() {
  /**
   * Get start of day (midnight) for a given date
   */
  function getStartOfDay(date: Date = new Date()): Date {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
  }

  /**
   * Get end of day (23:59:59.999) for a given date
   */
  function getEndOfDay(date: Date = new Date()): Date {
    const d = new Date(date)
    d.setHours(23, 59, 59, 999)
    return d
  }

  /**
   * Format date as YYYY-MM-DD
   */
  function getDateString(date: Date = new Date()): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * Get array of last N days as date strings
   */
  function getLastNDays(n: number): string[] {
    const dates: string[] = []
    const today = new Date()

    for (let i = n - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(getDateString(date))
    }

    return dates
  }

  /**
   * Format time ago (e.g., "2h ago", "3d ago", "Just now")
   */
  function formatTimeAgo(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSeconds < 60) {
      return 'Just now'
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return getDateString(d)
    }
  }

  /**
   * Format duration in minutes to human-readable string
   */
  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)

    if (hours === 0) {
      return `${mins}m`
    } else if (mins === 0) {
      return `${hours}h`
    } else {
      return `${hours}h ${mins}m`
    }
  }

  /**
   * Format elapsed time in milliseconds to H:MM:SS or M:SS
   */
  function formatElapsedTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const mm = String(minutes).padStart(2, '0')
    const ss = String(seconds).padStart(2, '0')

    if (hours > 0) {
      return `${hours}:${mm}:${ss}`
    } else {
      return `${minutes}:${ss}`
    }
  }

  /**
   * Format time as HH:MM AM/PM
   */
  function formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const hours = d.getHours()
    const minutes = d.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    const mm = String(minutes).padStart(2, '0')

    return `${displayHours}:${mm} ${ampm}`
  }

  /**
   * Format date as "Mon, Jan 1"
   */
  function formatShortDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const dayName = dayNames[d.getDay()]
    const monthName = monthNames[d.getMonth()]
    const day = d.getDate()

    return `${dayName}, ${monthName} ${day}`
  }

  /**
   * Check if date is today
   */
  function isToday(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date
    const today = new Date()
    return getDateString(d) === getDateString(today)
  }

  /**
   * Check if date is yesterday
   */
  function isYesterday(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return getDateString(d) === getDateString(yesterday)
  }

  return {
    getStartOfDay,
    getEndOfDay,
    getDateString,
    getLastNDays,
    formatTimeAgo,
    formatDuration,
    formatElapsedTime,
    formatTime,
    formatShortDate,
    isToday,
    isYesterday,
  }
}
