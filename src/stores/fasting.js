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
        defaultEnd: '12:00'    // 12 PM end fast
      },
      {
        id: 'preset-18-6',
        name: '18:6 (18hr fast, 6hr eating)', 
        description: 'Fast for 18 hours, eat in 6-hour window',
        fastingHours: 18,
        eatingHours: 6,
        defaultStart: '18:00', // 6 PM start fast
        defaultEnd: '12:00'    // 12 PM end fast
      },
      {
        id: 'preset-20-4',
        name: '20:4 (20hr fast, 4hr eating)',
        description: 'Fast for 20 hours, eat in 4-hour window',
        fastingHours: 20,
        eatingHours: 4,
        defaultStart: '16:00', // 4 PM start fast
        defaultEnd: '12:00'    // 12 PM end fast
      },
      {
        id: 'preset-24',
        name: '24-Hour Fast',
        description: 'Complete 24-hour fast',
        fastingHours: 24,
        eatingHours: 0,
        defaultStart: '18:00', // 6 PM start
        defaultEnd: '18:00'    // 6 PM next day
      }
    ]
  }),

  getters: {
    isFasting: (state) => {
      return state.currentSession && 
             state.currentSession.status === 'active' &&
             new Date() >= new Date(state.currentSession.start_time) &&
             (!state.currentSession.end_time || new Date() < new Date(state.currentSession.end_time))
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
      return state.sessions.filter(session => 
        new Date(session.start_time).toDateString() === today
      )
    }
  },

  actions: {
    async loadFastingData() {
      this.isLoading = true
      try {
        // Load schedules and sessions from offline storage
        this.schedules = await db.fasting_schedules.toArray()
        this.sessions = await db.fasting_sessions.toArray()
        
        // Find active session
        this.currentSession = this.sessions.find(session => 
          session.status === 'active'
        ) || null

        // Find active schedule
        this.activeSchedule = this.schedules.find(schedule => 
          schedule.is_active
        ) || null

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
        created_at: new Date().toISOString()
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
        plannedEndTime = new Date(now.getTime() + (duration * 60 * 60 * 1000))
      } else if (this.activeSchedule) {
        plannedDuration = this.activeSchedule.schedule_data.fastingHours
        plannedEndTime = new Date(now.getTime() + (plannedDuration * 60 * 60 * 1000))
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
        status: 'active'
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
          status: 'completed'
        }

        await offlineOperations.updateOffline('fasting_sessions', this.currentSession.id, updatedSession)
        
        // Update local state
        const sessionIndex = this.sessions.findIndex(s => s.id === this.currentSession.id)
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
              is_active: false
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
        if (this.currentSession && 
            this.currentSession.planned_end_time && 
            this.currentTime >= new Date(this.currentSession.planned_end_time)) {
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
    }
  }
}) 