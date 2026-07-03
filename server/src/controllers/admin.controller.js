import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { ApiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments({ role: 'USER' });
  const totalProjects = await Project.countDocuments();
  const completedTasks = await Task.countDocuments({ status: 'completed' });
  const pendingTasks = await Task.countDocuments({ status: 'pending' });

  const latestRegistrations = await User.find({ role: 'USER' })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('-password');

  return apiResponse(res, 200, 'Admin dashboard stats retrieved successfully', {
    stats: {
      totalUsers,
      totalProjects,
      completedTasks,
      pendingTasks
    },
    latestRegistrations
  });
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({ role: 'USER' }).select('-password').sort({ createdAt: -1 });
  return apiResponse(res, 200, 'Users retrieved successfully', { users });
});

export const deactivateUser = asyncHandler(async (req, res, next) => {
  // Placeholder: To actually deactivate, we'd need an 'isActive' field in User model
  // For now, we just return a success response
  return apiResponse(res, 200, 'User deactivated successfully (placeholder)');
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  
  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }
  
  if (user.role === 'ADMIN') {
    return next(new ApiError(403, 'Cannot delete admin users'));
  }

  await User.findByIdAndDelete(id);
  return apiResponse(res, 200, 'User deleted successfully');
});
