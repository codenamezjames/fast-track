import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../config/jwt.js'

export interface AuthRequest extends Request {
  userId?: string
  userEmail?: string
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' })
    return
  }

  const token = authHeader.substring(7)

  try {
    const payload = verifyAccessToken(token)
    req.userId = payload.userId
    req.userEmail = payload.email
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
