import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { jest } from '@jest/globals';

jest.setTimeout(30000); // 30 seconds

let mongoServer;

beforeAll(async () => {
  // Mock necessary environment variables for testing
  env.JWT_SECRET = 'test_secret_key';
  env.JWT_EXPIRES_IN = '1d';
  env.OPENROUTER_API_KEY = 'test_openrouter_api_key';
  env.OPENROUTER_MODEL = 'openai/gpt-4o-mini';

  // Spin up an in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Ensure any dangling connections are closed before connecting
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Tear down MongoDB connection
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  // Clear the database after each test file/suite to ensure isolation
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});
