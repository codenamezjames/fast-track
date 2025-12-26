import jwt, { SignOptions } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production'

export interface TokenPayload {
  userId: string
  email: string
}

export const generateTokens = (payload: TokenPayload) => {
  const accessOptions: SignOptions = { expiresIn: '15m' }
  const refreshOptions: SignOptions = { expiresIn: '7d' }

  const accessToken = jwt.sign(payload, JWT_SECRET, accessOptions)
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, refreshOptions)
  return { accessToken, refreshToken }
}

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload
}

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload
}
