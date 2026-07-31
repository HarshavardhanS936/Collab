import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';

import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import projectRoutes from './routes/project.routes.js';
import joinRequestRoutes from './routes/joinRequest.routes.js';
import taskRoutes from './routes/task.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import aiRoutes from './routes/ai.routes.js';
import adminRoutes from './routes/admin.routes.js';
import notificationRoutes from './routes/notification.routes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // allow serving static files
}));
app.use(cors({
  origin: function (origin, callback) {
    // Allow any Vercel preview domain, localhost, or the exact CLIENT_URL
    if (!origin || origin.includes('vercel.app') || origin.includes('localhost') || origin === env.CLIENT_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Global rate limiter to guard against API abuse
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'development' ? 5000 : 200, // Very high in dev to prevent blocks
  standardHeaders: true, 
  legacyHeaders: false, 
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  }
});
app.use('/api', globalLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/join-requests', joinRequestRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Centralized error handler should be mounted last
app.use(errorHandler);

export { app };
