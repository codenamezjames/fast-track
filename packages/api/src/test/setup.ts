import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongoServer: MongoMemoryServer | undefined

// Connect to in-memory MongoDB before all tests
export async function connectTestDB(): Promise<void> {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri)
}

// Clear all collections after each test
export async function clearTestDB(): Promise<void> {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}

// Disconnect and stop MongoDB after all tests
export async function disconnectTestDB(): Promise<void> {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  if (mongoServer) {
    await mongoServer.stop()
  }
}
