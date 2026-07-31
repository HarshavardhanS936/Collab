import { Router } from 'express';
import { 
  createProject, 
  getProjects, 
  getProjectById, 
  updateProject, 
  deleteProject 
} from '../controllers/project.controller.js';
import { sendJoinRequest, getProjectJoinRequests } from '../controllers/joinRequest.controller.js';
import { createTask, getProjectTasks } from '../controllers/task.controller.js';
import { protect, isProjectMember, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

// Project Routes
router.post('/', protect, authorizeRoles('ADMIN'), createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

// Nested Join Request Routes
router.post('/:id/join-requests', protect, sendJoinRequest);
router.get('/:id/join-requests', protect, getProjectJoinRequests);

// Nested Task Routes
router.post('/:id/tasks', protect, isProjectMember, createTask);
router.get('/:id/tasks', protect, isProjectMember, getProjectTasks);

// Nested Message Routes
import messageRoutes from './message.routes.js';
router.use('/:projectId/messages', messageRoutes);

export default router;
