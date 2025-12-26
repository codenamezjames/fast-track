import { Router, Response } from 'express'
import Activity from '../models/Activity.js'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/activities?days=30
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const activities = await Activity.find({
      userId: req.userId,
      startTime: { $gte: startDate },
    }).sort({ startTime: -1 })

    res.json(activities)
  } catch (error) {
    console.error('Get activities error:', error)
    res.status(500).json({ error: 'Failed to fetch activities' })
  }
})

// POST /api/activities
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { type, startTime, endTime, duration, distance, calories } = req.body

    if (!type || !startTime || !endTime || duration === undefined || distance === undefined) {
      res.status(400).json({ error: 'type, startTime, endTime, duration, and distance required' })
      return
    }

    // Calculate calories if not provided
    const calorieRates: Record<string, number> = {
      run: 10,
      walk: 4,
      bike: 8,
      other: 5,
    }
    const calculatedCalories = calories ?? Math.round(duration * (calorieRates[type] || 5))

    const activity = await Activity.create({
      userId: req.userId,
      type,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
      distance,
      calories: calculatedCalories,
    })

    res.status(201).json(activity)
  } catch (error) {
    console.error('Create activity error:', error)
    res.status(500).json({ error: 'Failed to create activity' })
  }
})

// PUT /api/activities/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { distance, duration, type } = req.body

    // Recalculate calories if duration or type changed
    let updates: Record<string, any> = { distance, duration }
    if (duration !== undefined && type) {
      const calorieRates: Record<string, number> = {
        run: 10,
        walk: 4,
        bike: 8,
        other: 5,
      }
      updates.calories = Math.round(duration * (calorieRates[type] || 5))
    }

    const activity = await Activity.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $set: updates },
      { new: true }
    )

    if (!activity) {
      res.status(404).json({ error: 'Activity not found' })
      return
    }

    res.json(activity)
  } catch (error) {
    console.error('Update activity error:', error)
    res.status(500).json({ error: 'Failed to update activity' })
  }
})

// DELETE /api/activities/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const activity = await Activity.findOneAndDelete({ _id: id, userId: req.userId })

    if (!activity) {
      res.status(404).json({ error: 'Activity not found' })
      return
    }

    res.json({ message: 'Activity deleted' })
  } catch (error) {
    console.error('Delete activity error:', error)
    res.status(500).json({ error: 'Failed to delete activity' })
  }
})

export default router
