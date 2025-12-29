/**
 * WorkerManager
 *
 * Manages background job workers for the application
 * Registers and starts all job workers with their respective schedules
 */

import QueueService from '#services/queue_service'
import FastingNotificationJob from '#jobs/fasting_notification_job'
import MealReminderJob from '#jobs/meal_reminder_job'
import DailyGoalCheckerJob from '#jobs/daily_goal_checker_job'
import logger from '@adonisjs/core/services/logger'

export default class WorkerManager {
  private static readonly QUEUE_NAMES = {
    FASTING_NOTIFICATIONS: 'fasting-notifications',
    MEAL_REMINDERS: 'meal-reminders',
    DAILY_GOAL_CHECKER: 'daily-goal-checker',
  }

  /**
   * Start all workers and schedulers
   */
  public static async start(): Promise<void> {
    logger.info('Starting all workers...')

    // Register schedulers (required for repeated jobs)
    QueueService.registerScheduler(this.QUEUE_NAMES.FASTING_NOTIFICATIONS)
    QueueService.registerScheduler(this.QUEUE_NAMES.MEAL_REMINDERS)
    QueueService.registerScheduler(this.QUEUE_NAMES.DAILY_GOAL_CHECKER)

    // Register workers
    this.registerFastingNotificationWorker()
    this.registerMealReminderWorker()
    this.registerDailyGoalCheckerWorker()

    // Schedule repeated jobs
    await this.scheduleRepeatedJobs()

    logger.info('All workers started successfully')
  }

  /**
   * Stop all workers and schedulers
   */
  public static async stop(): Promise<void> {
    logger.info('Stopping all workers...')
    await QueueService.closeAll()
    logger.info('All workers stopped successfully')
  }

  /**
   * Register fasting notification worker (runs every minute)
   */
  private static registerFastingNotificationWorker(): void {
    QueueService.registerWorker(
      this.QUEUE_NAMES.FASTING_NOTIFICATIONS,
      async () => {
        await FastingNotificationJob.process()
      },
      { concurrency: 1 }
    )
  }

  /**
   * Register meal reminder worker (runs every 5 minutes)
   */
  private static registerMealReminderWorker(): void {
    QueueService.registerWorker(
      this.QUEUE_NAMES.MEAL_REMINDERS,
      async () => {
        await MealReminderJob.process()
      },
      { concurrency: 1 }
    )
  }

  /**
   * Register daily goal checker worker (runs at :55 minutes of specific hours)
   */
  private static registerDailyGoalCheckerWorker(): void {
    QueueService.registerWorker(
      this.QUEUE_NAMES.DAILY_GOAL_CHECKER,
      async () => {
        await DailyGoalCheckerJob.process()
      },
      { concurrency: 1 }
    )
  }

  /**
   * Schedule all repeated jobs
   */
  private static async scheduleRepeatedJobs(): Promise<void> {
    // Fasting notifications: Every 1 minute
    const fastingQueue = QueueService.getQueue(this.QUEUE_NAMES.FASTING_NOTIFICATIONS)
    await fastingQueue.add(
      'process',
      {},
      {
        repeat: {
          pattern: '* * * * *', // Every minute
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    )

    // Meal reminders: Every 5 minutes
    const mealQueue = QueueService.getQueue(this.QUEUE_NAMES.MEAL_REMINDERS)
    await mealQueue.add(
      'process',
      {},
      {
        repeat: {
          pattern: '*/5 * * * *', // Every 5 minutes
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    )

    // Daily goal checker: At :55 minutes of hours 9, 14, and 20
    const dailyGoalQueue = QueueService.getQueue(this.QUEUE_NAMES.DAILY_GOAL_CHECKER)
    await dailyGoalQueue.add(
      'process',
      {},
      {
        repeat: {
          pattern: '55 9,14,20 * * *', // At 9:55 AM, 2:55 PM, 8:55 PM
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    )

    logger.info('All repeated jobs scheduled')
  }
}
