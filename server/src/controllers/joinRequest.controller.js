import { JoinRequest } from '../models/JoinRequest.js';
import { Project } from '../models/Project.js';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const sendJoinRequest = asyncHandler(async (req, res, next) => {
  const projectId = req.params.id;
  const userId = req.user._id;

  const project = await Project.findById(projectId);
  if (!project) {
    return next(new ApiError(404, 'Project not found'));
  }

  // Reject if req.user is already the project owner or already a member
  if (project.createdBy.toString() === userId.toString()) {
    return next(new ApiError(400, 'You are the owner of this project'));
  }

  if (project.members.includes(userId)) {
    return next(new ApiError(400, 'You are already a member of this project'));
  }

  // Reject if the project's members array has already reached teamSize
  if (project.members.length >= project.teamSize) {
    // Double check by populating to see if there are deleted ghost members
    await project.populate('members', '_id');
    const validMembersCount = project.members.filter(m => m !== null).length;
    
    if (validMembersCount >= project.teamSize) {
      return next(new ApiError(400, 'Team size limit reached for this project'));
    } else {
      // Self-heal: Clean up ghost members from the database
      project.members = project.members.filter(m => m !== null).map(m => m._id);
      await project.save();
    }
  }

  try {
    const newRequest = await JoinRequest.create({
      project: projectId,
      requestedBy: userId,
      status: 'pending'
    });

    // Notify project owner
    await Notification.create({
      user: project.createdBy,
      type: 'JOIN_REQUEST',
      message: `${req.user.name} has requested to join your project "${project.title}".`,
      relatedProject: projectId
    });

    return apiResponse(res, 201, 'Join request sent successfully', { joinRequest: newRequest });
  } catch (error) {
    // Catch the duplicate-key error from the unique index (MongoDB code 11000)
    if (error.code === 11000) {
      return next(new ApiError(400, 'Join request already sent'));
    }
    return next(error);
  }
});

export const getProjectJoinRequests = asyncHandler(async (req, res, next) => {
  const projectId = req.params.id;
  const { status } = req.query;

  const project = await Project.findById(projectId);
  if (!project) {
    return next(new ApiError(404, 'Project not found'));
  }

  // Check ownership
  if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
    return next(new ApiError(403, 'Not authorized to view join requests for this project'));
  }

  const query = { project: projectId };
  if (status) {
    query.status = status;
  }

  const requests = await JoinRequest.find(query).populate('requestedBy', 'name email skills resumePath');

  return apiResponse(res, 200, 'Join requests retrieved successfully', { joinRequests: requests });
});

export const acceptJoinRequest = asyncHandler(async (req, res, next) => {
  const requestId = req.params.id;

  const joinRequest = await JoinRequest.findById(requestId).populate('project');
  if (!joinRequest) {
    return next(new ApiError(404, 'Join request not found'));
  }

  const project = joinRequest.project; // Populated project document

  // Check ownership
  if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
    return next(new ApiError(403, 'Not authorized to accept this join request'));
  }

  if (joinRequest.status !== 'pending') {
    return next(new ApiError(400, `Cannot accept a request that is already ${joinRequest.status}`));
  }

  // Re-check the team size limit at accept time
  if (project.members.length >= project.teamSize) {
    return next(new ApiError(400, 'Team is already full'));
  }

  // Accept the request
  joinRequest.status = 'accepted';
  await joinRequest.save();

  // Add the user to the project members
  if (!project.members.includes(joinRequest.requestedBy)) {
    project.members.push(joinRequest.requestedBy);
    await project.save();
  }

  // Notify the user
  await Notification.create({
    user: joinRequest.requestedBy,
    type: 'REQUEST_ACCEPTED',
    message: `Your request to join "${project.title}" has been accepted!`,
    relatedProject: project._id
  });

  return apiResponse(res, 200, 'Join request accepted', { joinRequest, project });
});

export const rejectJoinRequest = asyncHandler(async (req, res, next) => {
  const requestId = req.params.id;

  const joinRequest = await JoinRequest.findById(requestId).populate('project');
  if (!joinRequest) {
    return next(new ApiError(404, 'Join request not found'));
  }

  const project = joinRequest.project;

  // Check ownership
  if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
    return next(new ApiError(403, 'Not authorized to reject this join request'));
  }

  if (joinRequest.status !== 'pending') {
    return next(new ApiError(400, `Cannot reject a request that is already ${joinRequest.status}`));
  }

  joinRequest.status = 'rejected';
  await joinRequest.save();

  // Notify the user
  await Notification.create({
    user: joinRequest.requestedBy,
    type: 'REQUEST_REJECTED',
    message: `Your request to join "${project.title}" was declined.`,
    relatedProject: project._id
  });

  return apiResponse(res, 200, 'Join request rejected', { joinRequest });
});
