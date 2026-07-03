import { Router } from 'express';
import { acceptJoinRequest, rejectJoinRequest } from '../controllers/joinRequest.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.put('/:id/accept', protect, acceptJoinRequest);
router.put('/:id/reject', protect, rejectJoinRequest);

export default router;
