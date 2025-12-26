import { Router, Response } from 'express'
import Measurement from '../models/Measurement.js'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/measurements?limit=30
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 30

    const measurements = await Measurement.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(limit)

    res.json(measurements)
  } catch (error) {
    console.error('Get measurements error:', error)
    res.status(500).json({ error: 'Failed to fetch measurements' })
  }
})

// POST /api/measurements
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { weight, height, bodyFat, date } = req.body

    if (weight === undefined && height === undefined && bodyFat === undefined) {
      res.status(400).json({ error: 'At least one of weight, height, or bodyFat required' })
      return
    }

    const measurement = await Measurement.create({
      userId: req.userId,
      date: date ? new Date(date) : new Date(),
      weight,
      height,
      bodyFat,
    })

    res.status(201).json(measurement)
  } catch (error) {
    console.error('Create measurement error:', error)
    res.status(500).json({ error: 'Failed to create measurement' })
  }
})

// PUT /api/measurements/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { weight, height, bodyFat } = req.body

    const measurement = await Measurement.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $set: { weight, height, bodyFat } },
      { new: true }
    )

    if (!measurement) {
      res.status(404).json({ error: 'Measurement not found' })
      return
    }

    res.json(measurement)
  } catch (error) {
    console.error('Update measurement error:', error)
    res.status(500).json({ error: 'Failed to update measurement' })
  }
})

// DELETE /api/measurements/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const measurement = await Measurement.findOneAndDelete({ _id: id, userId: req.userId })

    if (!measurement) {
      res.status(404).json({ error: 'Measurement not found' })
      return
    }

    res.json({ message: 'Measurement deleted' })
  } catch (error) {
    console.error('Delete measurement error:', error)
    res.status(500).json({ error: 'Failed to delete measurement' })
  }
})

export default router
