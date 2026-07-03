import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  // 1. projectsCreated: where the user is the creator
  const projectsCreatedData = await Project.find({ createdBy: userId })
    .select('title domain teamSize members')
    .lean();

  const projectsCreated = projectsCreatedData.map(p => ({
    _id: p._id,
    title: p.title,
    domain: p.domain,
    teamSize: p.teamSize,
    membersCount: p.members.length
  }));

  // 2. projectsJoined: user is in members array but not the creator
  const projectsJoined = await Project.find({ 
    members: userId, 
    createdBy: { $ne: userId } 
  })
    .select('title domain createdBy')
    .populate('createdBy', 'name email')
    .lean();

  // Combine project IDs to fetch relevant tasks
  const allUserProjectIds = [
    ...projectsCreatedData.map(p => p._id),
    ...projectsJoined.map(p => p._id)
  ];

  // 3. taskStats: aggregate counts of all tasks visible to the user by their status
  const taskStatsRaw = await Task.aggregate([
    { $match: { project: { $in: allUserProjectIds } } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  const taskStats = { pending: 0, completed: 0 };
  taskStatsRaw.forEach(stat => {
    if (stat._id === 'pending') taskStats.pending = stat.count;
    if (stat._id === 'completed') taskStats.completed = stat.count;
  });

  // 4. recentTasks: get up to 5 most recent tasks visible to the user
  const recentTasks = await Task.find({ project: { $in: allUserProjectIds } })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('project', 'title')
    .populate('assignedTo', 'name')
    .lean();

  return apiResponse(res, 200, 'Dashboard data retrieved successfully', {
    projectsCreated,
    projectsJoined,
    taskStats,
    recentTasks
  });
});
