import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useDateUtils } from '../useDateUtils'

describe('useDateUtils', () => {
  let dateUtils: ReturnType<typeof useDateUtils>

  beforeEach(() => {
    // Set a fixed date for testing: 2025-01-15 12:00:00
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'))
    dateUtils = useDateUtils()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getDateString', () => {
    it('should format current date as YYYY-MM-DD', () => {
      const result = dateUtils.getDateString()
      expect(result).toBe('2025-01-15')
    })

    it('should format provided date as YYYY-MM-DD', () => {
      const date = new Date('2024-12-25T10:30:00Z')
      const result = dateUtils.getDateString(date)
      expect(result).toBe('2024-12-25')
    })

    it('should handle string dates', () => {
      const result = dateUtils.getDateString('2024-06-15T08:00:00Z')
      expect(result).toBe('2024-06-15')
    })
  })

  describe('isToday', () => {
    it('should return true for today\'s date', () => {
      const today = new Date('2025-01-15T18:00:00Z')
      expect(dateUtils.isToday(today)).toBe(true)
    })

    it('should return true for current date string', () => {
      // Use ISO string with time to avoid timezone issues
      expect(dateUtils.isToday('2025-01-15T12:00:00Z')).toBe(true)
    })

    it('should return false for yesterday', () => {
      const yesterday = new Date('2025-01-14T12:00:00Z')
      expect(dateUtils.isToday(yesterday)).toBe(false)
    })

    it('should return false for tomorrow', () => {
      const tomorrow = new Date('2025-01-16T12:00:00Z')
      expect(dateUtils.isToday(tomorrow)).toBe(false)
    })
  })

  describe('formatTimeAgo', () => {
    it('should return "Just now" for recent times', () => {
      const recent = new Date('2025-01-15T11:59:30Z')
      expect(dateUtils.formatTimeAgo(recent)).toBe('Just now')
    })

    it('should return minutes ago for times under 1 hour', () => {
      const thirtyMinsAgo = new Date('2025-01-15T11:30:00Z')
      expect(dateUtils.formatTimeAgo(thirtyMinsAgo)).toBe('30m ago')
    })

    it('should return hours ago for times under 24 hours', () => {
      const fiveHoursAgo = new Date('2025-01-15T07:00:00Z')
      expect(dateUtils.formatTimeAgo(fiveHoursAgo)).toBe('5h ago')
    })

    it('should return days ago for times 1-6 days', () => {
      const yesterday = new Date('2025-01-14T10:00:00Z')
      expect(dateUtils.formatTimeAgo(yesterday)).toBe('1d ago')
    })

    it('should return date string for times over 7 days', () => {
      const weekAgo = new Date('2025-01-07T12:00:00Z')
      expect(dateUtils.formatTimeAgo(weekAgo)).toBe('2025-01-07')
    })

    it('should handle string dates', () => {
      const result = dateUtils.formatTimeAgo('2025-01-15T11:00:00Z')
      expect(result).toBe('1h ago')
    })
  })

  describe('formatDuration', () => {
    it('should format minutes only', () => {
      expect(dateUtils.formatDuration(45)).toBe('45m')
    })

    it('should format hours and minutes', () => {
      expect(dateUtils.formatDuration(125)).toBe('2h 5m')
    })

    it('should handle exact hours', () => {
      expect(dateUtils.formatDuration(120)).toBe('2h')
    })

    it('should handle zero minutes', () => {
      expect(dateUtils.formatDuration(0)).toBe('0m')
    })

    it('should handle large durations', () => {
      expect(dateUtils.formatDuration(1500)).toBe('25h')
    })
  })

  describe('formatElapsedTime', () => {
    it('should format seconds only', () => {
      expect(dateUtils.formatElapsedTime(45000)).toBe('0:45')
    })

    it('should format minutes and seconds', () => {
      expect(dateUtils.formatElapsedTime(325000)).toBe('5:25')
    })

    it('should format hours, minutes, and seconds', () => {
      expect(dateUtils.formatElapsedTime(7385000)).toBe('2:03:05')
    })

    it('should pad single digit values', () => {
      expect(dateUtils.formatElapsedTime(65000)).toBe('1:05')
      expect(dateUtils.formatElapsedTime(3605000)).toBe('1:00:05')
    })

    it('should handle zero time', () => {
      expect(dateUtils.formatElapsedTime(0)).toBe('0:00')
    })
  })
})
