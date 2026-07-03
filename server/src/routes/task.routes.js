import { Router } from 'express';
import { 
  updateTask, 
  toggleTaskStatus, 
  deleteTask 
} from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.put('/:id', protect, updateTask);
router.put('/:id/status', protect, toggleTaskStatus);
router.delete('/:id', protect, deleteTask);

export default router;
