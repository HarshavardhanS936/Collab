import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized, token missing'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new ApiError(401, 'Not authorized, user no longer exists'));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(401, 'Not authorized, invalid token'));
  }
});

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, `User role '${req.user?.role || 'UNKNOWN'}' is not authorized to access this route`));
    }
    next();
  };
};

export const isProjectMember = asyncHandler(async (req, res, next) => {
  const projectId = req.params.id; // Derived from /api/projects/:id/... routes
  if (!projectId) {
    return next(new ApiError(400, 'Project ID missing'));
  }

  const project = await Project.findById(projectId);
  if (!project) return next(new ApiError(404, 'Project not found'));

  const userId = req.user?._id?.toString() || req.user?.id?.toString();
  const creatorId = project.createdBy?.toString();
  
  const isMember = project.members.some(m => m.toString() === userId) || creatorId === userId || req.user.role === 'ADMIN';
  
  if (!isMember) {
    return next(new ApiError(403, 'You are not a member of this project'));
  }

  req.project = project; // Forwarding the queried project downwards to save a DB fetch!
  next();
});
