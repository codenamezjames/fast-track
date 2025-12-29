import type { HttpContext } from '@adonisjs/core/http'
import PushSubscription from '#models/push_subscription'
import { subscribePushValidator } from '#validators/push_subscription/subscribe'

export default class PushSubscriptionsController {
  /**
   * Get all push subscriptions for current user
   */
  async index({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const subscriptions = await PushSubscription.query()
      .where('userId', user.id)
      .orderBy('createdAt', 'desc')

    return response.ok({ subscriptions })
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(subscribePushValidator)

    // Check if subscription already exists for this endpoint
    const existing = await PushSubscription.query()
      .where('userId', user.id)
      .where('endpoint', payload.endpoint)
      .first()

    if (existing) {
      // Update existing subscription keys
      existing.p256dhKey = payload.p256dhKey
      existing.authKey = payload.authKey
      if (payload.userAgent) {
        existing.userAgent = payload.userAgent
      }
      await existing.save()

      return response.ok({ subscription: existing })
    }

    // Create new subscription
    const subscription = await PushSubscription.create({
      userId: user.id,
      endpoint: payload.endpoint,
      p256dhKey: payload.p256dhKey,
      authKey: payload.authKey,
      userAgent: payload.userAgent || null,
    })

    return response.created({ subscription })
  }

  /**
   * Unsubscribe from push notifications (delete subscription)
   */
  async unsubscribe({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const subscription = await PushSubscription.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    await subscription.delete()

    return response.ok({ message: 'Unsubscribed successfully' })
  }

  /**
   * Unsubscribe by endpoint (used when service worker gets unsubscribe event)
   */
  async unsubscribeByEndpoint({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { endpoint } = request.only(['endpoint'])

    if (!endpoint) {
      return response.badRequest({ message: 'Endpoint is required' })
    }

    const subscription = await PushSubscription.query()
      .where('userId', user.id)
      .where('endpoint', endpoint)
      .first()

    if (!subscription) {
      return response.notFound({ message: 'Subscription not found' })
    }

    await subscription.delete()

    return response.ok({ message: 'Unsubscribed successfully' })
  }
}
