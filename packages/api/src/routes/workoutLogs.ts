import { Router, Response } from 'express'
import WorkoutLog from '../models/WorkoutLog.js'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/workout-logs?days=30
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const logs = await WorkoutLog.find({
      userId: req.userId,
      date: { $gte: startDate },
    }).sort({ date: -1 })

    res.json(logs)
  } catch (error) {
    console.error('Get workout logs error:', error)
    res.status(500).json({ error: 'Failed to fetch workout logs' })
  }
})

// POST /api/workout-logs
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { routineId, routineName, date, duration, completed, exercisesCompleted } = req.body

    if (!routineId || !routineName || duration === undefined || completed === undefined) {
      res.status(400).json({ error: 'routineId, routineName, duration, and completed required' })
      return
    }

    const log = await WorkoutLog.create({
      userId: req.userId,
      routineId,
      routineName,
      date: date ? new Date(date) : new Date(),
      duration,
      completed,
      exercisesCompleted: exercisesCompleted || 0,
    })

    res.status(201).json(log)
  } catch (error) {
    console.error('Create workout log error:', error)
    res.status(500).json({ error: 'Failed to create workout log' })
  }
})

// PUT /api/workout-logs/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body

    const log = await WorkoutLog.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $set: updates },
      { new: true }
    )

    if (!log) {
      res.status(404).json({ error: 'Workout log not found' })
      return
    }

    res.json(log)
  } catch (error) {
    console.error('Update workout log error:', error)
    res.status(500).json({ error: 'Failed to update workout log' })
  }
})

// DELETE /api/workout-logs/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const log = await WorkoutLog.findOneAndDelete({ _id: id, userId: req.userId })

    if (!log) {
      res.status(404).json({ error: 'Workout log not found' })
      return
    }

    res.json({ message: 'Workout log deleted' })
  } catch (error) {
    console.error('Delete workout log error:', error)
    res.status(500).json({ error: 'Failed to delete workout log' })
  }
})

export default router
