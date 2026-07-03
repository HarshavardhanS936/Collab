import { Router } from 'express';
import { getProfile, updateProfile, uploadUserResume } from '../controllers/profile.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadResume } from '../middleware/upload.middleware.js';

const router = Router();

router.get('/:userId', getProfile);
router.put('/', protect, updateProfile);
router.post('/resume', protect, uploadResume.single('resume'), uploadUserResume);

export default router;
