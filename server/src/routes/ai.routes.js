import { Router } from 'express';
import { generateDescription, suggestSkills, generateTasks, generateProject } from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { aiRateLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

router.post('/generate-description', protect, aiRateLimiter, generateDescription);
router.post('/suggest-skills', protect, aiRateLimiter, suggestSkills);
router.post('/generate-tasks', protect, aiRateLimiter, generateTasks);
router.post('/generate-project', protect, aiRateLimiter, generateProject);

export default router;
