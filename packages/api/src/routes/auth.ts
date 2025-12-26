import { Router, Request, Response } from 'express'
import User from '../models/User.js'
import Streak from '../models/Streak.js'
import { generateTokens, verifyRefreshToken } from '../config/jwt.js'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' })
      return
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' })
      return
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' })
      return
    }

    const user = await User.create({ email, password })

    // Create initial streak document for new user
    await Streak.create({ userId: user._id })

    const tokens = generateTokens({ userId: user._id.toString(), email: user.email })

    res.status(201).json({
      user: { id: user._id, email: user.email },
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' })
      return
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const tokens = generateTokens({ userId: user._id.toString(), email: user.email })

    res.json({
      user: { id: user._id, email: user.email },
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token required' })
      return
    }

    const payload = verifyRefreshToken(refreshToken)
    const user = await User.findById(payload.userId)

    if (!user) {
      res.status(401).json({ error: 'User not found' })
      return
    }

    const tokens = generateTokens({ userId: user._id.toString(), email: user.email })

    res.json({
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' })
  }
})

export default router
