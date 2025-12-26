import User from './User'
import { connectTestDB, clearTestDB, disconnectTestDB } from '../test/setup'

describe('User Model', () => {
  beforeAll(async () => {
    await connectTestDB()
  })

  afterEach(async () => {
    await clearTestDB()
  })

  afterAll(async () => {
    await disconnectTestDB()
  })

  describe('User creation', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      }

      const user = await User.create(userData)

      expect(user).toBeDefined()
      expect(user.email).toBe('test@example.com')
      expect(user.password).not.toBe('password123') // Should be hashed
      expect(user.createdAt).toBeInstanceOf(Date)
    })

    it('should convert email to lowercase', async () => {
      const userData = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      }

      const user = await User.create(userData)

      expect(user.email).toBe('test@example.com')
    })

    it('should trim whitespace from email', async () => {
      const userData = {
        email: '  test@example.com  ',
        password: 'password123',
      }

      const user = await User.create(userData)

      expect(user.email).toBe('test@example.com')
    })

    it('should hash password before saving', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      }

      const user = await User.create(userData)

      expect(user.password).not.toBe('password123')
      expect(user.password.length).toBeGreaterThan(20) // Bcrypt hash length
      expect(user.password).toMatch(/^\$2[aby]\$/) // Bcrypt format
    })

    it('should not allow duplicate emails', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      }

      await User.create(userData)

      await expect(User.create(userData)).rejects.toThrow()
    })

    it('should require email field', async () => {
      const userData = {
        password: 'password123',
      }

      await expect(User.create(userData)).rejects.toThrow()
    })

    it('should require password field', async () => {
      const userData = {
        email: 'test@example.com',
      }

      await expect(User.create(userData)).rejects.toThrow()
    })

    it('should enforce minimum password length', async () => {
      const userData = {
        email: 'test@example.com',
        password: '12345', // Only 5 characters
      }

      await expect(User.create(userData)).rejects.toThrow()
    })
  })

  describe('comparePassword method', () => {
    it('should return true for correct password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      }

      const user = await User.create(userData)
      const isMatch = await user.comparePassword('password123')

      expect(isMatch).toBe(true)
    })

    it('should return false for incorrect password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      }

      const user = await User.create(userData)
      const isMatch = await user.comparePassword('wrongpassword')

      expect(isMatch).toBe(false)
    })

    it('should be case-sensitive', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
      }

      const user = await User.create(userData)
      const isMatch = await user.comparePassword('password123')

      expect(isMatch).toBe(false)
    })
  })

  describe('Password hashing', () => {
    it('should not rehash password if not modified', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
      })

      const originalHash = user.password

      // Update without modifying password
      user.email = 'newemail@example.com'
      await user.save()

      expect(user.password).toBe(originalHash)
    })

    it('should rehash password when modified', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
      })

      const originalHash = user.password

      // Update password
      user.password = 'newpassword123'
      await user.save()

      expect(user.password).not.toBe(originalHash)
      expect(await user.comparePassword('newpassword123')).toBe(true)
    })
  })
})
