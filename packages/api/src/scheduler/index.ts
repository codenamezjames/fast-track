import cron from 'node-cron'
import { checkFastingProgress } from './fastingChecker.js'
import { checkMealReminders } from './mealReminder.js'
import { checkDailyGoals } from './dailyGoalChecker.js'
import { isWebPushConfigured } from '../config/webPush.js'

export const initScheduler = (): void => {
  if (!isWebPushConfigured()) {
    console.log('Web push not configured - scheduler disabled')
    return
  }

  console.log('Initializing notification scheduler...')

  // Check fasting progress every minute
  cron.schedule('* * * * *', async () => {
    try {
      await checkFastingProgress()
    } catch (error) {
      console.error('Fasting checker error:', error)
    }
  })

  // Check meal reminders every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      await checkMealReminders()
    } catch (error) {
      console.error('Meal reminder error:', error)
    }
  })

  // Check daily goals at the 55th minute of every hour (catches hourly reminder times)
  cron.schedule('55 * * * *', async () => {
    try {
      await checkDailyGoals()
    } catch (error) {
      console.error('Daily goal checker error:', error)
    }
  })

  console.log('Notification scheduler initialized')
}
