import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import { authMiddleware } from './middleware/auth.js'

// Routes
import authRoutes from './routes/auth.js'
import mealsRoutes from './routes/meals.js'
import routinesRoutes from './routes/routines.js'
import workoutLogsRoutes from './routes/workoutLogs.js'
import activitiesRoutes from './routes/activities.js'
import measurementsRoutes from './routes/measurements.js'
import fastsRoutes from './routes/fasts.js'
import streaksRoutes from './routes/streaks.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN?.split(',') || [
  'http://localhost:5173',
  'http://localhost:4173',
]

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
)

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

// Start server
const start = async () => {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
