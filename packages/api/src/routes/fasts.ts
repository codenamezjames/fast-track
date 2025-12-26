import { Router, Response } from 'express'
import Fast from '../models/Fast.js'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/fasts
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const fasts = await Fast.find({ userId: req.userId }).sort({ startTime: -1 })
    res.json(fasts)
  } catch (error) {
    console.error('Get fasts error:', error)
    res.status(500).json({ error: 'Failed to fetch fasts' })
  }
})

// GET /api/fasts/current - Get active fast
router.get('/current', async (req: AuthRequest, res: Response) => {
  try {
    const activeFast = await Fast.findOne({
      userId: req.userId,
      endTime: { $exists: false },
    })

    res.json(activeFast)
  } catch (error) {
    console.error('Get current fast error:', error)
    res.status(500).json({ error: 'Failed to fetch current fast' })
  }
})

// POST /api/fasts - Start a new fast
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { goalHours, startTime } = req.body

    if (!goalHours) {
      res.status(400).json({ error: 'goalHours required' })
      return
    }

    // Check for existing active fast
    const activeFast = await Fast.findOne({
      userId: req.userId,
      endTime: { $exists: false },
    })

    if (activeFast) {
      res.status(400).json({ error: 'Already have an active fast' })
      return
    }

    const fast = await Fast.create({
      userId: req.userId,
      startTime: startTime ? new Date(startTime) : new Date(),
      goalHours,
    })

    res.status(201).json(fast)
  } catch (error) {
    console.error('Create fast error:', error)
    res.status(500).json({ error: 'Failed to create fast' })
  }
})

// PUT /api/fasts/:id - End or update fast
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { endTime, completed, notes } = req.body

    const updates: Record<string, any> = {}
    if (endTime !== undefined) updates.endTime = new Date(endTime)
    if (completed !== undefined) updates.completed = completed
    if (notes !== undefined) updates.notes = notes

    const fast = await Fast.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $set: updates },
      { new: true }
    )

    if (!fast) {
      res.status(404).json({ error: 'Fast not found' })
      return
    }

    res.json(fast)
  } catch (error) {
    console.error('Update fast error:', error)
    res.status(500).json({ error: 'Failed to update fast' })
  }
})

// DELETE /api/fasts/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const fast = await Fast.findOneAndDelete({ _id: id, userId: req.userId })

    if (!fast) {
      res.status(404).json({ error: 'Fast not found' })
      return
    }

    res.json({ message: 'Fast deleted' })
  } catch (error) {
    console.error('Delete fast error:', error)
    res.status(500).json({ error: 'Failed to delete fast' })
  }
})

export default router
