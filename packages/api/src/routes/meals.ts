import { Router, Response } from 'express'
import Meal from '../models/Meal.js'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/meals?date=YYYY-MM-DD
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query

    if (!date || typeof date !== 'string') {
      res.status(400).json({ error: 'Date query parameter required (YYYY-MM-DD)' })
      return
    }

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const meals = await Meal.find({
      userId: req.userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ date: -1 })

    res.json(meals)
  } catch (error) {
    console.error('Get meals error:', error)
    res.status(500).json({ error: 'Failed to fetch meals' })
  }
})

// POST /api/meals
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { type, foods, totalCalories, date } = req.body

    if (!type || !foods || totalCalories === undefined) {
      res.status(400).json({ error: 'type, foods, and totalCalories required' })
      return
    }

    const meal = await Meal.create({
      userId: req.userId,
      date: date ? new Date(date) : new Date(),
      type,
      foods,
      totalCalories,
    })

    res.status(201).json(meal)
  } catch (error) {
    console.error('Create meal error:', error)
    res.status(500).json({ error: 'Failed to create meal' })
  }
})

// PUT /api/meals/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { foods, totalCalories, type } = req.body

    const meal = await Meal.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $set: { foods, totalCalories, type } },
      { new: true }
    )

    if (!meal) {
      res.status(404).json({ error: 'Meal not found' })
      return
    }

    res.json(meal)
  } catch (error) {
    console.error('Update meal error:', error)
    res.status(500).json({ error: 'Failed to update meal' })
  }
})

// DELETE /api/meals/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const meal = await Meal.findOneAndDelete({ _id: id, userId: req.userId })

    if (!meal) {
      res.status(404).json({ error: 'Meal not found' })
      return
    }

    res.json({ message: 'Meal deleted' })
  } catch (error) {
    console.error('Delete meal error:', error)
    res.status(500).json({ error: 'Failed to delete meal' })
  }
})

export default router
