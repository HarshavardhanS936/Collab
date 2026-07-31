import { Router } from 'express';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';
import { 
  getDashboardStats, 
  getAllUsers, 
  deactivateUser, 
  deleteUser 
} from '../controllers/admin.controller.js';

const router = Router();

// All routes require authentication and ADMIN role
router.use(protect);
router.use(authorizeRoles('ADMIN'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/deactivate', deactivateUser);
router.delete('/users/:id', deleteUser);

export default router;
