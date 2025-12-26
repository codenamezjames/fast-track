import { Router, Response } from 'express'
import Routine from '../models/Routine.js'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/routines
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const routines = await Routine.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json(routines)
  } catch (error) {
    console.error('Get routines error:', error)
    res.status(500).json({ error: 'Failed to fetch routines' })
  }
})

// GET /api/routines/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const routine = await Routine.findOne({ _id: req.params.id, userId: req.userId })

    if (!routine) {
      res.status(404).json({ error: 'Routine not found' })
      return
    }

    res.json(routine)
  } catch (error) {
    console.error('Get routine error:', error)
    res.status(500).json({ error: 'Failed to fetch routine' })
  }
})

// POST /api/routines
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, exercises } = req.body

    if (!name || !exercises) {
      res.status(400).json({ error: 'name and exercises required' })
      return
    }

    const routine = await Routine.create({
      userId: req.userId,
      name,
      exercises,
    })

    res.status(201).json(routine)
  } catch (error) {
    console.error('Create routine error:', error)
    res.status(500).json({ error: 'Failed to create routine' })
  }
})

// PUT /api/routines/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { name, exercises } = req.body

    const routine = await Routine.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $set: { name, exercises } },
      { new: true }
    )

    if (!routine) {
      res.status(404).json({ error: 'Routine not found' })
      return
    }

    res.json(routine)
  } catch (error) {
    console.error('Update routine error:', error)
    res.status(500).json({ error: 'Failed to update routine' })
  }
})

// DELETE /api/routines/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const routine = await Routine.findOneAndDelete({ _id: id, userId: req.userId })

    if (!routine) {
      res.status(404).json({ error: 'Routine not found' })
      return
    }

    res.json({ message: 'Routine deleted' })
  } catch (error) {
    console.error('Delete routine error:', error)
    res.status(500).json({ error: 'Failed to delete routine' })
  }
})

export default router
