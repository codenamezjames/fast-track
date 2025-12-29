/**
 * QueueService
 *
 * Centralized service for managing BullMQ queues and workers
 */

import { Queue, Worker, QueueScheduler } from 'bullmq'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

export interface QueueConnection {
  host: string
  port: number
  password?: string
}

export default class QueueService {
  private static queues = new Map<string, Queue>()
  private static workers = new Map<string, Worker>()
  private static schedulers = new Map<string, QueueScheduler>()

  private static connection: QueueConnection = {
    host: env.get('REDIS_HOST'),
    port: env.get('REDIS_PORT'),
    password: env.get('REDIS_PASSWORD'),
  }

  /**
   * Get or create a queue
   */
  public static getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: this.connection,
      })
      this.queues.set(name, queue)
      logger.info({ queue: name }, 'Queue created')
    }

    return this.queues.get(name)!
  }

  /**
   * Register a worker for a queue
   */
  public static registerWorker(
    queueName: string,
    processor: (job: any) => Promise<void>,
    options: { concurrency?: number } = {}
  ): Worker {
    const worker = new Worker(queueName, processor, {
      connection: this.connection,
      concurrency: options.concurrency || 1,
    })

    worker.on('completed', (job) => {
      logger.info({ job: job.id, queue: queueName }, 'Job completed')
    })

    worker.on('failed', (job, err) => {
      logger.error({ job: job?.id, queue: queueName, error: err.message }, 'Job failed')
    })

    this.workers.set(queueName, worker)
    logger.info({ queue: queueName }, 'Worker registered')

    return worker
  }

  /**
   * Register a scheduler for a queue (required for delayed/repeated jobs)
   */
  public static registerScheduler(queueName: string): QueueScheduler {
    const scheduler = new QueueScheduler(queueName, {
      connection: this.connection,
    })

    this.schedulers.set(queueName, scheduler)
    logger.info({ queue: queueName }, 'Scheduler registered')

    return scheduler
  }

  /**
   * Gracefully close all queues, workers, and schedulers
   */
  public static async closeAll(): Promise<void> {
    const promises: Promise<void>[] = []

    for (const [name, worker] of this.workers) {
      logger.info({ worker: name }, 'Closing worker')
      promises.push(worker.close())
    }

    for (const [name, scheduler] of this.schedulers) {
      logger.info({ scheduler: name }, 'Closing scheduler')
      promises.push(scheduler.close())
    }

    for (const [name, queue] of this.queues) {
      logger.info({ queue: name }, 'Closing queue')
      promises.push(queue.close())
    }

    await Promise.all(promises)

    this.workers.clear()
    this.schedulers.clear()
    this.queues.clear()

    logger.info('All queues, workers, and schedulers closed')
  }
}
