import { Message } from '../models/Message.js';
import { Project } from '../models/Project.js';
import { ApiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Send a message to a project
export const sendMessage = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const projectId = req.params.projectId;
  const userId = req.user?._id?.toString() || req.user?.id?.toString();

  if (!content || !content.trim()) {
    return next(new ApiError(400, 'Message content cannot be empty'));
  }

  // Check if user is member of project
  const project = await Project.findById(projectId);
  if (!project) {
    return next(new ApiError(404, 'Project not found'));
  }

  const creatorId = project.createdBy?.toString();
  const isMember = project.members.some(m => m.toString() === userId) || creatorId === userId || req.user.role === 'ADMIN';

  if (!isMember) {
    return next(new ApiError(403, 'You must be a member of the project to send messages'));
  }

  const message = await Message.create({
    project: projectId,
    sender: userId,
    content: content.trim()
  });

  // Populate sender details before returning
  await message.populate('sender', 'name avatarUrl');

  return apiResponse(res, 201, 'Message sent successfully', { message });
});

// Get messages for a project
export const getMessages = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId;
  const userId = req.user?._id?.toString() || req.user?.id?.toString();

  // Check if user is member of project
  const project = await Project.findById(projectId);
  if (!project) {
    return next(new ApiError(404, 'Project not found'));
  }

  const creatorId = project.createdBy?.toString();
  const isMember = project.members.some(m => m.toString() === userId) || creatorId === userId || req.user.role === 'ADMIN';

  if (!isMember) {
    return next(new ApiError(403, 'You must be a member of the project to view messages'));
  }

  // Get last 100 messages, sorted by oldest first (chronological order)
  const messages = await Message.find({ project: projectId })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('sender', 'name avatarUrl');
  
  // Reverse to get chronological order for chat UI
  const sortedMessages = messages.reverse();

  return apiResponse(res, 200, 'Messages retrieved successfully', { messages: sortedMessages });
});
