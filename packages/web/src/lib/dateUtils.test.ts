import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getStartOfDay,
  getEndOfDay,
  getDateString,
  getWeekDates,
  isToday,
  daysAgo,
  formatTimeAgo,
  formatDuration,
  formatElapsedTime,
} from './dateUtils'

describe('dateUtils', () => {
  describe('getStartOfDay', () => {
    it('should set time to 00:00:00.000', () => {
      const date = new Date('2024-01-15T14:30:45.123')
      const result = getStartOfDay(date)

      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
    })

    it('should use current date when no argument provided', () => {
      const result = getStartOfDay()
      expect(result).toBeInstanceOf(Date)
      expect(result.getHours()).toBe(0)
    })
  })

  describe('getEndOfDay', () => {
    it('should set time to 23:59:59.999', () => {
      const date = new Date('2024-01-15T14:30:45.123')
      const result = getEndOfDay(date)

      expect(result.getHours()).toBe(23)
      expect(result.getMinutes()).toBe(59)
      expect(result.getSeconds()).toBe(59)
      expect(result.getMilliseconds()).toBe(999)
    })
  })

  describe('getDateString', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T14:30:45.123Z')
      const result = getDateString(date)

      expect(result).toBe('2024-01-15')
    })

    it('should pad single-digit months and days', () => {
      const date = new Date('2024-03-05T00:00:00.000Z')
      const result = getDateString(date)

      expect(result).toBe('2024-03-05')
    })
  })

  describe('getWeekDates', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return 7 dates ending with today', () => {
      const today = new Date('2024-01-15')
      vi.setSystemTime(today)

      const result = getWeekDates()

      expect(result).toHaveLength(7)
      expect(result[6]).toBe('2024-01-15') // Today
      expect(result[0]).toBe('2024-01-09') // 6 days ago
    })
  })

  describe('isToday', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return true for current date', () => {
      const today = new Date('2024-01-15T10:30:00')
      vi.setSystemTime(today)

      const testDate = new Date('2024-01-15T18:45:00')
      expect(isToday(testDate)).toBe(true)
    })

    it('should return false for yesterday', () => {
      const today = new Date('2024-01-15')
      vi.setSystemTime(today)

      const yesterday = new Date('2024-01-14')
      expect(isToday(yesterday)).toBe(false)
    })

    it('should return false for tomorrow', () => {
      const today = new Date('2024-01-15')
      vi.setSystemTime(today)

      const tomorrow = new Date('2024-01-16')
      expect(isToday(tomorrow)).toBe(false)
    })
  })

  describe('daysAgo', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should calculate days difference', () => {
      const today = new Date('2024-01-15')
      vi.setSystemTime(today)

      const pastDate = new Date('2024-01-10')
      expect(daysAgo(pastDate)).toBe(5)
    })

    it('should return 0 for today', () => {
      const today = new Date('2024-01-15T14:30:00')
      vi.setSystemTime(today)

      const sameDay = new Date('2024-01-15T08:00:00')
      expect(daysAgo(sameDay)).toBe(0)
    })
  })

  describe('formatTimeAgo', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return "Just now" for recent times', () => {
      const now = new Date('2024-01-15T14:30:00')
      vi.setSystemTime(now)

      const recent = new Date('2024-01-15T14:29:30')
      expect(formatTimeAgo(recent)).toBe('Just now')
    })

    it('should return hours ago', () => {
      const now = new Date('2024-01-15T14:30:00')
      vi.setSystemTime(now)

      const hoursAgo = new Date('2024-01-15T10:30:00')
      expect(formatTimeAgo(hoursAgo)).toBe('4h ago')
    })

    it('should return days ago', () => {
      const now = new Date('2024-01-15T14:30:00')
      vi.setSystemTime(now)

      const daysAgo = new Date('2024-01-12T14:30:00')
      expect(formatTimeAgo(daysAgo)).toBe('3d ago')
    })
  })

  describe('formatDuration', () => {
    it('should format minutes only', () => {
      expect(formatDuration(45)).toBe('45m')
    })

    it('should format hours and minutes', () => {
      expect(formatDuration(90)).toBe('1h 30m')
    })

    it('should handle zero minutes', () => {
      expect(formatDuration(60)).toBe('1h 0m')
    })
  })

  describe('formatElapsedTime', () => {
    it('should format seconds only', () => {
      expect(formatElapsedTime(45000)).toBe('0:45')
    })

    it('should format minutes and seconds', () => {
      expect(formatElapsedTime(125000)).toBe('2:05')
    })

    it('should format hours, minutes, and seconds', () => {
      expect(formatElapsedTime(3665000)).toBe('1:01:05')
    })

    it('should pad single-digit values', () => {
      expect(formatElapsedTime(305000)).toBe('5:05')
      expect(formatElapsedTime(3605000)).toBe('1:00:05')
    })
  })
})
