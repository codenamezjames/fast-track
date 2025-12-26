import express from 'express'
import authRoutes from '../routes/auth'
import mealsRoutes from '../routes/meals'
import routinesRoutes from '../routes/routines'
import workoutLogsRoutes from '../routes/workoutLogs'
import activitiesRoutes from '../routes/activities'
import measurementsRoutes from '../routes/measurements'
import fastsRoutes from '../routes/fasts'
import streaksRoutes from '../routes/streaks'
import { authMiddleware } from '../middleware/auth'

// Create Express app for testing (without server start)
export function createTestApp() {
  const app = express()

  app.use(express.json())

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // Public routes
  app.use('/api/auth', authRoutes)

  // Protected routes
  app.use('/api/meals', authMiddleware, mealsRoutes)
  app.use('/api/routines', authMiddleware, routinesRoutes)
  app.use('/api/workout-logs', authMiddleware, workoutLogsRoutes)
  app.use('/api/activities', authMiddleware, activitiesRoutes)
  app.use('/api/measurements', authMiddleware, measurementsRoutes)
  app.use('/api/fasts', authMiddleware, fastsRoutes)
  app.use('/api/streaks', authMiddleware, streaksRoutes)

  // Error handler
  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error('Unhandled error:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  )

  return app
}
