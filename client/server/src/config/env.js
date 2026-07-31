import dotenv from 'dotenv';
dotenv.config();

const requiredEnvs = [
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'OPENROUTER_API_KEY',
  'OPENROUTER_MODEL',
  'CLIENT_URL'
];

requiredEnvs.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
  CLIENT_URL: process.env.CLIENT_URL,
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL || 'admin@projecthub.ai'
};
