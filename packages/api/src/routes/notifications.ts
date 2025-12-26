import { Router, Response } from 'express'
import { AuthRequest, authMiddleware } from '../middleware/auth.js'
import PushSubscription from '../models/PushSubscription.js'
import User from '../models/User.js'
import { getVapidPublicKey, isWebPushConfigured } from '../config/webPush.js'
import { sendToUser } from '../services/notificationService.js'

const router = Router()

// Get VAPID public key (public endpoint)
router.get('/vapid-public-key', (_req, res: Response) => {
  const key = getVapidPublicKey()
  if (!key) {
    return res.status(503).json({ error: 'Web push not configured' })
  }
  res.json({ publicKey: key })
})

// Subscribe to push notifications (protected)
router.post('/subscribe', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { endpoint, keys } = req.body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'Invalid subscription data' })
    }

    if (!isWebPushConfigured()) {
      return res.status(503).json({ error: 'Web push not configured' })
    }

    // Upsert subscription
    await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        userId: req.userId,
        endpoint,
        keys,
        userAgent: req.headers['user-agent'],
        lastUsed: new Date(),
      },
      { upsert: true, new: true }
    )

    res.json({ success: true })
  } catch (error) {
    console.error('Subscribe error:', error)
    res.status(500).json({ error: 'Failed to subscribe' })
  }
})

// Unsubscribe from push notifications (protected)
router.delete('/unsubscribe', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { endpoint } = req.body

    if (endpoint) {
      await PushSubscription.deleteOne({ userId: req.userId, endpoint })
    } else {
      // Delete all subscriptions for user
      await PushSubscription.deleteMany({ userId: req.userId })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Unsubscribe error:', error)
    res.status(500).json({ error: 'Failed to unsubscribe' })
  }
})

// Get notification preferences (protected)
router.get('/preferences', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ preferences: user.notificationPreferences })
  } catch (error) {
    console.error('Get preferences error:', error)
    res.status(500).json({ error: 'Failed to get preferences' })
  }
})

// Update notification preferences (protected)
router.put('/preferences', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { preferences } = req.body

    const user = await User.findByIdAndUpdate(
      req.userId,
      { notificationPreferences: preferences },
      { new: true }
    )

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ preferences: user.notificationPreferences })
  } catch (error) {
    console.error('Update preferences error:', error)
    res.status(500).json({ error: 'Failed to update preferences' })
  }
})

// Send test notification (protected)
router.post('/test', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!isWebPushConfigured()) {
      return res.status(503).json({ error: 'Web push not configured' })
    }

    const result = await sendToUser(req.userId!, {
      title: 'Test Notification',
      body: 'Push notifications are working!',
      tag: 'test',
      actionUrl: '/#/',
      icon: '/pwa-192x192.png',
    })

    res.json({ success: true, ...result })
  } catch (error) {
    console.error('Test notification error:', error)
    res.status(500).json({ error: 'Failed to send test notification' })
  }
})

export default router
