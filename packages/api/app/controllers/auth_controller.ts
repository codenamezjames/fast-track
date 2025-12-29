import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator } from '#validators/auth/register'
import { loginValidator } from '#validators/auth/login'

export default class AuthController {
  /**
   * Register a new user
   */
  async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)

    // Check if user already exists
    const existingUser = await User.findBy('email', payload.email)
    if (existingUser) {
      return response.conflict({ message: 'Email already registered' })
    }

    // Create user
    const user = await User.create({
      email: payload.email,
      password: payload.password,
      notificationPreferences: {},
    })

    // Create access token
    const token = await User.accessTokens.create(user)

    return response.created({
      user: {
        id: user.id,
        email: user.email,
      },
      token: {
        type: 'bearer',
        value: token.value!.release(),
      },
    })
  }

  /**
   * Login user
   */
  async login({ request, response }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)

    // Verify credentials
    const user = await User.verifyCredentials(payload.email, payload.password)

    // Create access token
    const token = await User.accessTokens.create(user)

    return response.ok({
      user: {
        id: user.id,
        email: user.email,
      },
      token: {
        type: 'bearer',
        value: token.value!.release(),
      },
    })
  }

  /**
   * Logout user (delete access token)
   */
  async logout({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    return response.ok({ message: 'Logged out successfully' })
  }

  /**
   * Get current user
   */
  async me({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    return response.ok({
      user: {
        id: user.id,
        email: user.email,
        notificationPreferences: user.notificationPreferences,
      },
    })
  }
}