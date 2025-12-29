import { Router, Response } from 'express'
import Streak from '../models/Streak.js'
import DailyActivity from '../models/DailyActivity.js'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/streaks - Get user's streak data
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    let streak = await Streak.findOne({ userId: req.userId })

    // Create default streak if none exists
    if (!streak) {
      streak = await Streak.create({ userId: req.userId })
    }

    res.json(streak)
  } catch (error) {
    console.error('Get streak error:', error)
    res.status(500).json({ error: 'Failed to fetch streak' })
  }
})

// PUT /api/streaks - Update streak data
router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body

    const streak = await Streak.findOneAndUpdate(
      { userId: req.userId },
      { $set: updates },
      { new: true, upsert: true }
    )

    res.json(streak)
  } catch (error) {
    console.error('Update streak error:', error)
    res.status(500).json({ error: 'Failed to update streak' })
  }
})

// GET /api/daily-activities?dates=YYYY-MM-DD,YYYY-MM-DD
router.get('/daily-activities', async (req: AuthRequest, res: Response) => {
  try {
    const { dates } = req.query

    if (!dates || typeof dates !== 'string') {
      res.status(400).json({ error: 'dates query parameter required (comma-separated YYYY-MM-DD)' })
      return
    }

    const dateList = dates.split(',')

    const activities = await DailyActivity.find({
      userId: req.userId,
      date: { $in: dateList },
    })

    res.json(activities)
  } catch (error) {
    console.error('Get daily activities error:', error)
    res.status(500).json({ error: 'Failed to fetch daily activities' })
  }
})

// GET /api/streaks/history - Get historical activity data with stats
router.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query

    if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
      res.status(400).json({ error: 'startDate and endDate query parameters required (YYYY-MM-DD)' })
      return
    }

    // Fetch activities in date range
    const activities = await DailyActivity.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 })

    // Calculate statistics
    const totalDays = activities.length
    const activeDays = activities.filter((a) => a.streakMaintained).length
    const completionRate = totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0

    // Day of week breakdown (0 = Sunday, 6 = Saturday)
    const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0]
    activities.forEach((a) => {
      if (a.streakMaintained) {
        const dayOfWeek = new Date(a.date).getDay()
        dayOfWeekCounts[dayOfWeek]++
      }
    })

    const dayOfWeekBreakdown = dayOfWeekCounts.map((count, day) => ({ day, count }))
    const bestDayOfWeek = dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts))

    // Activity type breakdown
    const activityBreakdown = {
      fasting: activities.filter((a) => a.fastCompleted).length,
      meals: activities.filter((a) => a.mealsLogged).length,
      workouts: activities.filter((a) => a.workoutCompleted).length,
    }

    res.json({
      activities,
      stats: {
        totalDays,
        activeDays,
        completionRate,
        bestDayOfWeek,
        dayOfWeekBreakdown,
        activityBreakdown,
      },
    })
  } catch (error) {
    console.error('Get streak history error:', error)
    res.status(500).json({ error: 'Failed to fetch streak history' })
  }
})

// PUT /api/daily-activities/:date - Upsert daily activity for date
router.put('/daily-activities/:date', async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.params
    const { fastCompleted, mealsLogged, workoutCompleted, streakMaintained } = req.body

    const updates: Record<string, any> = {}
    if (fastCompleted !== undefined) updates.fastCompleted = fastCompleted
    if (mealsLogged !== undefined) updates.mealsLogged = mealsLogged
    if (workoutCompleted !== undefined) updates.workoutCompleted = workoutCompleted
    if (streakMaintained !== undefined) updates.streakMaintained = streakMaintained

    const activity = await DailyActivity.findOneAndUpdate(
      { userId: req.userId, date },
      { $set: updates },
      { new: true, upsert: true }
    )

    res.json(activity)
  } catch (error) {
    console.error('Update daily activity error:', error)
    res.status(500).json({ error: 'Failed to update daily activity' })
  }
})

export default router
