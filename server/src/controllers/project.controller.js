import { Project } from '../models/Project.js';
import { ApiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createProject = asyncHandler(async (req, res, next) => {
  const { title, description, domain, requiredSkills, deadline, teamSize } = req.body;

  const project = await Project.create({
    title,
    description,
    domain,
    requiredSkills,
    deadline,
    teamSize,
    createdBy: req.user._id,
    members: [] // Admin is not a team member
  });

  return apiResponse(res, 201, 'Project created successfully', { project });
});

export const getProjects = asyncHandler(async (req, res, next) => {
  const { search, domain, skill, page = 1, limit = 10 } = req.query;

  const query = {};

  // Text search on title/description
  if (search) {
    query.$text = { $search: search };
  }

  // Filter by domain
  if (domain) {
    query.domain = domain;
  }

  // Filter by required skill
  if (skill) {
    query.requiredSkills = skill;
  }

  // Pagination logic
  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  // Execute query
  const projects = await Project.find(query)
    .populate('createdBy', 'name')
    .populate('members', '_id')
    .skip(skip)
    .limit(limitNumber)
    .sort({ createdAt: -1 });

  const total = await Project.countDocuments(query);

  return apiResponse(res, 200, 'Projects retrieved successfully', {
    projects,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      pages: Math.ceil(total / limitNumber)
    }
  });
});

export const getProjectById = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('members', 'name email');

  if (!project) {
    return next(new ApiError(404, 'Project not found'));
  }

  return apiResponse(res, 200, 'Project retrieved successfully', { project });
});

export const updateProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new ApiError(404, 'Project not found'));
  }

  const isOwner = project.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'ADMIN';
  const isMember = project.members.some(m => m.toString() === req.user._id.toString());

  // Check ownership
  if (!isOwner && !isAdmin) {
    if (isMember) {
      // Members can ONLY update the submission link
      if (req.body.submissionLink !== undefined) {
        project.submissionLink = req.body.submissionLink;
        await project.save();
        return apiResponse(res, 200, 'Project submission updated', { project });
      }
    }
    return next(new ApiError(403, 'Not authorized to update this project'));
  }

  const { title, description, domain, requiredSkills, deadline, teamSize, submissionLink } = req.body;

  if (title !== undefined) project.title = title;
  if (description !== undefined) project.description = description;
  if (domain !== undefined) project.domain = domain;
  if (requiredSkills !== undefined) project.requiredSkills = requiredSkills;
  if (deadline !== undefined) project.deadline = deadline;
  if (teamSize !== undefined) project.teamSize = teamSize;
  if (submissionLink !== undefined) project.submissionLink = submissionLink;

  await project.save(); // Utilizing .save() properly triggers all schema validators

  return apiResponse(res, 200, 'Project updated successfully', { project });
});

export const deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new ApiError(404, 'Project not found'));
  }

  // Check ownership
  if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
    return next(new ApiError(403, 'Not authorized to delete this project'));
  }

  await Project.deleteOne({ _id: project._id });

  // TODO: Cascade delete all Tasks and JoinRequests associated with this project once those modules exist!
  
  return apiResponse(res, 200, 'Project deleted successfully', {});
});
