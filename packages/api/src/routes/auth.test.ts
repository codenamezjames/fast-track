import request from 'supertest'
import { createTestApp } from '../test/testApp'
import { connectTestDB, clearTestDB, disconnectTestDB } from '../test/setup'
import User from '../models/User'

const app = createTestApp()

describe('Auth Routes', () => {
  beforeAll(async () => {
    await connectTestDB()
  })

  afterEach(async () => {
    await clearTestDB()
  })

  afterAll(async () => {
    await disconnectTestDB()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201)

      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('refreshToken')
      expect(response.body.user.email).toBe('test@example.com')
      expect(response.body.user.id).toBeDefined()
    })

    it('should create user in database', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })

      const user = await User.findOne({ email: 'test@example.com' })
      expect(user).toBeDefined()
      expect(user?.email).toBe('test@example.com')
    })

    it('should reject registration without email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          password: 'password123',
        })
        .expect(400)

      expect(response.body.error).toBe('Email and password required')
    })

    it('should reject registration without password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
        })
        .expect(400)

      expect(response.body.error).toBe('Email and password required')
    })

    it('should reject password shorter than 6 characters', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '12345',
        })
        .expect(400)

      expect(response.body.error).toBe('Password must be at least 6 characters')
    })

    it('should reject duplicate email registration', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })

      // Try to register again with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password456',
        })
        .expect(400)

      expect(response.body.error).toBe('Email already registered')
    })

    it('should be case-insensitive for email duplicates', async () => {
      // Register with lowercase
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })

      // Try to register with uppercase
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: 'password456',
        })
        .expect(400)

      expect(response.body.error).toBe('Email already registered')
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200)

      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('refreshToken')
      expect(response.body.user.email).toBe('test@example.com')
    })

    it('should be case-insensitive for email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: 'password123',
        })
        .expect(200)

      expect(response.body.user.email).toBe('test@example.com')
    })

    it('should reject login without email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123',
        })
        .expect(400)

      expect(response.body.error).toBe('Email and password required')
    })

    it('should reject login without password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400)

      expect(response.body.error).toBe('Email and password required')
    })

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401)

      expect(response.body.error).toBe('Invalid credentials')
    })

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401)

      expect(response.body.error).toBe('Invalid credentials')
    })
  })

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string

    beforeEach(async () => {
      // Register and get refresh token
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
      })
      refreshToken = response.body.refreshToken
    })

    it('should refresh tokens with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200)

      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('refreshToken')
      expect(response.body.token).not.toBe(refreshToken)
    })

    it('should reject refresh without token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400)

      expect(response.body.error).toBe('Refresh token required')
    })

    it('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401)

      expect(response.body.error).toBe('Invalid refresh token')
    })
  })
})
