import { Task } from '../models/Task.js';
import { ApiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createTask = asyncHandler(async (req, res, next) => {
  const { title, description, assignedTo, dueDate } = req.body;
  const projectId = req.params.id;

  const task = await Task.create({
    project: projectId,
    title,
    description,
    assignedTo,
    dueDate
  });

  return apiResponse(res, 201, 'Task created successfully', { task });
});

export const getProjectTasks = asyncHandler(async (req, res, next) => {
  const projectId = req.params.id;

  const tasks = await Task.find({ project: projectId }).populate('assignedTo', 'name email');

  const pending = tasks.filter(t => t.status === 'pending');
  const completed = tasks.filter(t => t.status === 'completed');

  return apiResponse(res, 200, 'Tasks retrieved successfully', {
    tasks: {
      pending,
      completed
    }
  });
});

export const updateTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id).populate('project');
  if (!task) return next(new ApiError(404, 'Task not found'));

  const project = task.project;
  const userId = req.user?._id?.toString() || req.user?.id?.toString();
  const creatorId = project.createdBy?.toString();
  const isMember = project.members.some(m => m.toString() === userId) || creatorId === userId || req.user.role === 'ADMIN';
  
  if (!isMember) {
    return next(new ApiError(403, 'You are not a member of this project'));
  }

  const { title, description, dueDate } = req.body;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (dueDate !== undefined) task.dueDate = dueDate;

  await task.save();

  return apiResponse(res, 200, 'Task updated successfully', { task });
});

export const toggleTaskStatus = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id).populate('project');
  if (!task) return next(new ApiError(404, 'Task not found'));

  const project = task.project;
  const userId = req.user?._id?.toString() || req.user?.id?.toString();
  const creatorId = project.createdBy?.toString();
  const isMember = project.members.some(m => m.toString() === userId) || creatorId === userId || req.user.role === 'ADMIN';
  
  if (!isMember) {
    return next(new ApiError(403, 'You are not a member of this project'));
  }

  task.status = task.status === 'pending' ? 'completed' : 'pending';
  await task.save();

  return apiResponse(res, 200, 'Task status updated', { task });
});

export const deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id).populate('project');
  if (!task) return next(new ApiError(404, 'Task not found'));

  const project = task.project;
  const userId = req.user?._id?.toString() || req.user?.id?.toString();
  const creatorId = project.createdBy?.toString();
  const isMember = project.members.some(m => m.toString() === userId) || creatorId === userId || req.user.role === 'ADMIN';
  
  if (!isMember) {
    return next(new ApiError(403, 'You are not a member of this project'));
  }

  await Task.deleteOne({ _id: task._id });

  return apiResponse(res, 200, 'Task deleted successfully', {});
});
