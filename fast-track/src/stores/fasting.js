import { defineStore } from 'pinia'
import { db, offlineOperations } from '../services/offline.js'
import { useAuthStore } from './auth.js'
import { useNotificationsStore } from './notifications.js'

export const useFastingStore = defineStore('fasting', {
  state: () => ({
    currentSession: null,
    activeSchedule: null,
    schedules: [],
    sessions: [],
    isLoading: false,
    error: null,

    // Timer state
    timerInterval: null,
    currentTime: new Date(),

    // Preset schedules
    presetSchedules: [
      {
        id: 'preset-16-8',
        name: '16:8 (16hr fast, 8hr eating)',
        description: 'Fast for 16 hours, eat in 8-hour window',
        fastingHours: 16,
        eatingHours: 8,
        defaultStart: '20:00', // 8 PM start fast
        defaultEnd: '12:00', // 12 PM end fast
      },
      {
        id: 'preset-18-6',
        name: '18:6 (18hr fast, 6hr eating)',
        description: 'Fast for 18 hours, eat in 6-hour window',
        fastingHours: 18,
        eatingHours: 6,
        defaultStart: '18:00', // 6 PM start fast
        defaultEnd: '12:00', // 12 PM end fast
      },
      {
        id: 'preset-20-4',
        name: '20:4 (20hr fast, 4hr eating)',
        description: 'Fast for 20 hours, eat in 4-hour window',
        fastingHours: 20,
        eatingHours: 4,
        defaultStart: '16:00', // 4 PM start fast
        defaultEnd: '12:00', // 12 PM end fast
      },
      {
        id: 'preset-24',
        name: '24-Hour Fast',
        description: 'Complete 24-hour fast',
        fastingHours: 24,
        eatingHours: 0,
        defaultStart: '18:00', // 6 PM start
        defaultEnd: '18:00', // 6 PM next day
      },
    ],
  }),

  getters: {
    isFasting: (state) => {
      if (!state.currentSession) return false

      return (
        state.currentSession.status === 'active' &&
        new Date() >= new Date(state.currentSession.start_time) &&
        (!state.currentSession.end_time || new Date() < new Date(state.currentSession.end_time))
      )
    },

    fastingTimeRemaining: (state) => {
      if (!state.currentSession || state.currentSession.status !== 'active') return 0

      const now = new Date()
      const endTime = new Date(state.currentSession.planned_end_time)
      const remaining = endTime.getTime() - now.getTime()

      return Math.max(0, remaining)
    },

    fastingTimeElapsed: (state) => {
      if (!state.currentSession || state.currentSession.status !== 'active') return 0

      const now = new Date()
      const startTime = new Date(state.currentSession.start_time)
      const elapsed = now.getTime() - startTime.getTime()

      return Math.max(0, elapsed)
    },

    fastingProgress: (state) => {
      if (!state.currentSession || state.currentSession.status !== 'active') return 0

      const totalDuration = state.currentSession.planned_duration * 60 * 60 * 1000 // hours to ms
      const elapsed = state.fastingTimeElapsed

      return Math.min(100, (elapsed / totalDuration) * 100)
    },

    todaysSessions: (state) => {
      const today = new Date().toDateString()
      return state.sessions.filter(
        (session) => new Date(session.start_time).toDateString() === today,
      )
    },

    // New getters for analytics and charts
    completedSessions: (state) => {
      return state.sessions.filter((session) => session.status === 'completed')
    },

    fastingStreak: (state) => {
      const completedSessions = state.sessions
        .filter((session) => session.status === 'completed')
        .sort((a, b) => new Date(b.start_time) - new Date(a.start_time))

      if (completedSessions.length === 0) return 0

      let streak = 0
      let currentDate = new Date()
      currentDate.setHours(0, 0, 0, 0)

      for (const session of completedSessions) {
        const sessionDate = new Date(session.start_time)
        sessionDate.setHours(0, 0, 0, 0)

        const daysDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24))

        if (daysDiff === streak) {
          streak++
          currentDate.setDate(currentDate.getDate() - 1)
        } else if (daysDiff > streak) {
          break
        }
      }

      return streak
    },

    totalFastingHours: (state) => {
      return state.sessions
        .filter((session) => session.status === 'completed' && session.actual_duration)
        .reduce((total, session) => total + session.actual_duration, 0)
    },

    averageFastingDuration: (state) => {
      const completed = state.sessions.filter(
        (session) => session.status === 'completed' && session.actual_duration,
      )

      if (completed.length === 0) return 0

      const total = completed.reduce((sum, session) => sum + session.actual_duration, 0)
      return Math.round((total / completed.length) * 10) / 10 // Round to 1 decimal
    },

    fastingSessionsByDate: (state) => {
      return (days = 7) => {
        const now = new Date()
        const data = []

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          const dateString = date.toDateString()

          const daySessions = state.sessions.filter(
            (session) =>
              new Date(session.start_time).toDateString() === dateString &&
              session.status === 'completed',
          )

          const totalHours = daySessions.reduce(
            (total, session) => total + (session.actual_duration || 0),
            0,
          )

          data.push({
            date: date.toISOString().split('T')[0],
            label: date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            }),
            sessions: daySessions.length,
            hours: Math.round(totalHours * 10) / 10,
            completed: daySessions.length > 0,
          })
        }

        return data
      }
    },

    weeklyFastingData: (state) => {
      return (weeks = 4) => {
        const now = new Date()
        const data = []

        for (let i = weeks - 1; i >= 0; i--) {
          const weekStart = new Date(now.getTime() - (i * 7 + now.getDay()) * 24 * 60 * 60 * 1000)
          const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)

          const weekSessions = state.sessions.filter((session) => {
            const sessionDate = new Date(session.start_time)
            return (
              sessionDate >= weekStart && sessionDate <= weekEnd && session.status === 'completed'
            )
          })

          const totalHours = weekSessions.reduce(
            (total, session) => total + (session.actual_duration || 0),
            0,
          )

          data.push({
            week: `Week ${weeks - i}`,
            label: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            sessions: weekSessions.length,
            hours: Math.round(totalHours * 10) / 10,
          })
        }

        return data
      }
    },

    monthlyFastingData: (state) => {
      return (months = 6) => {
        const now = new Date()
        const data = []

        for (let i = months - 1; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
          const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

          const monthSessions = state.sessions.filter((session) => {
            const sessionDate = new Date(session.start_time)
            return (
              sessionDate >= monthStart && sessionDate <= monthEnd && session.status === 'completed'
            )
          })

          const totalHours = monthSessions.reduce(
            (total, session) => total + (session.actual_duration || 0),
            0,
          )

          data.push({
            month: monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
            label: monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
            sessions: monthSessions.length,
            hours: Math.round(totalHours * 10) / 10,
          })
        }

        return data
      }
    },

    fastingSuccessRate: (state) => {
      return (days = 30) => {
        const now = new Date()
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

        const recentSessions = state.sessions.filter(
          (session) => new Date(session.start_time) >= startDate,
        )

        if (recentSessions.length === 0) return 0

        const completed = recentSessions.filter((session) => session.status === 'completed')
        return Math.round((completed.length / recentSessions.length) * 100)
      }
    },
  },

  actions: {
    async loadFastingData() {
      this.isLoading = true
      try {
        // Load schedules and sessions from offline storage
        this.schedules = await db.fasting_schedules.toArray()
        this.sessions = await db.fasting_sessions.toArray()

        // Find active session
        this.currentSession = this.sessions.find((session) => session.status === 'active') || null

        // Find active schedule
        this.activeSchedule = this.schedules.find((schedule) => schedule.is_active) || null

        // Start timer if we have an active session
        if (this.currentSession) {
          this.startTimer()
        }
      } catch (error) {
        console.error('Error loading fasting data:', error)
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async createSchedule(scheduleData) {
      const authStore = useAuthStore()
      const schedule = {
        user_id: authStore.userId,
        name: scheduleData.name,
        schedule_data: scheduleData,
        is_active: scheduleData.setAsActive || false,
        created_at: new Date().toISOString(),
      }

      try {
        // If setting as active, deactivate others first
        if (schedule.is_active) {
          await this.deactivateAllSchedules()
        }

        const id = await offlineOperations.addToOffline('fasting_schedules', schedule)
        const newSchedule = { id, ...schedule, synced: false }

        this.schedules.push(newSchedule)

        if (schedule.is_active) {
          this.activeSchedule = newSchedule
        }

        return newSchedule
      } catch (error) {
        console.error('Error creating schedule:', error)
        this.error = error.message
        throw error
      }
    },

    async startFast(duration = null, customEndTime = null) {
      const authStore = useAuthStore()
      const notificationsStore = useNotificationsStore()
      const now = new Date()

      // Calculate end time based on active schedule or custom duration
      let plannedEndTime
      let plannedDuration

      if (customEndTime) {
        plannedEndTime = new Date(customEndTime)
        plannedDuration = (plannedEndTime.getTime() - now.getTime()) / (1000 * 60 * 60) // hours
      } else if (duration) {
        plannedDuration = duration
        plannedEndTime = new Date(now.getTime() + duration * 60 * 60 * 1000)
      } else if (this.activeSchedule) {
        plannedDuration = this.activeSchedule.schedule_data.fastingHours
        plannedEndTime = new Date(now.getTime() + plannedDuration * 60 * 60 * 1000)
      } else {
        throw new Error('No duration specified and no active schedule')
      }

      // End any current session
      if (this.currentSession && this.currentSession.status === 'active') {
        await this.endFast()
      }

      const session = {
        user_id: authStore.userId,
        start_time: now.toISOString(),
        planned_end_time: plannedEndTime.toISOString(),
        planned_duration: plannedDuration,
        session_type: 'regular',
        status: 'active',
      }

      try {
        const id = await offlineOperations.addToOffline('fasting_sessions', session)
        const newSession = { id, ...session, synced: false }

        this.sessions.push(newSession)
        this.currentSession = newSession

        // Schedule fasting notifications
        if (notificationsStore.isFastingNotificationsEnabled) {
          await notificationsStore.scheduleFastingNotifications(now, plannedDuration)

          // Send immediate start notification
          await notificationsStore.notifyFastingStart(plannedDuration)
        }

        this.startTimer()

        return newSession
      } catch (error) {
        console.error('Error starting fast:', error)
        this.error = error.message
        throw error
      }
    },

    async endFast() {
      if (!this.currentSession || this.currentSession.status !== 'active') {
        throw new Error('No active fasting session')
      }

      const notificationsStore = useNotificationsStore()
      const endTime = new Date()
      const startTime = new Date(this.currentSession.start_time)
      const actualDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) // hours

      try {
        // Update session
        const updatedSession = {
          ...this.currentSession,
          end_time: endTime.toISOString(),
          actual_duration: actualDuration,
          status: 'completed',
        }

        await offlineOperations.updateOffline(
          'fasting_sessions',
          this.currentSession.id,
          updatedSession,
        )

        // Update local state
        const sessionIndex = this.sessions.findIndex((s) => s.id === this.currentSession.id)
        if (sessionIndex !== -1) {
          this.sessions[sessionIndex] = { ...updatedSession, synced: false }
        }

        // Clear scheduled fasting notifications
        notificationsStore.clearFastingNotifications()

        // Send fast completion notification
        if (notificationsStore.isFastingNotificationsEnabled) {
          await notificationsStore.notifyFastingEnd(this.currentSession.planned_duration)
        }

        this.currentSession = null
        this.stopTimer()

        return updatedSession
      } catch (error) {
        console.error('Error ending fast:', error)
        this.error = error.message
        throw error
      }
    },

    async deactivateAllSchedules() {
      try {
        for (const schedule of this.schedules) {
          if (schedule.is_active) {
            await offlineOperations.updateOffline('fasting_schedules', schedule.id, {
              ...schedule,
              is_active: false,
            })
            schedule.is_active = false
          }
        }
        this.activeSchedule = null
      } catch (error) {
        console.error('Error deactivating schedules:', error)
        throw error
      }
    },

    startTimer() {
      this.stopTimer() // Clear any existing timer

      this.timerInterval = setInterval(() => {
        this.currentTime = new Date()

        // Check if fast should auto-end
        if (
          this.currentSession &&
          this.currentSession.planned_end_time &&
          this.currentTime >= new Date(this.currentSession.planned_end_time)
        ) {
          this.endFast()
        }
      }, 1000)
    },

    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    },

    updateCurrentTime() {
      this.currentTime = new Date()
    },

    formatDuration(milliseconds) {
      const hours = Math.floor(milliseconds / (1000 * 60 * 60))
      const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)

      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`
      } else {
        return `${seconds}s`
      }
    },

    clearError() {
      this.error = null
    },

    async clearAllData() {
      this.isLoading = true
      try {
        // Clear from offline storage
        await db.fasting_sessions.clear()
        await db.fasting_schedules.clear()
        
        // Clear local state
        this.sessions = []
        this.schedules = []
        this.currentSession = null
        this.activeSchedule = null
        
        // Stop timer if running
        this.stopTimer()
        
        // Clear any errors
        this.error = null
      } catch (error) {
        console.error('Error clearing all fasting data:', error)
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },
  },
})
