import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import WorkerManager from '#services/worker_manager'

export default class StartWorkers extends BaseCommand {
  static commandName = 'workers:start'
  static description = 'Start all background job workers'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Starting background workers...')

    // Start all workers
    await WorkerManager.start()

    this.logger.success('Workers started successfully')

    // Keep the process running
    await new Promise(() => {})
  }
}
