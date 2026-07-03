import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select('-password');
  
  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  return apiResponse(res, 200, 'Profile retrieved successfully', {
    user: {
      id: user._id,
      name: user.name,
      department: user.department,
      college: user.college,
      skills: user.skills,
      bio: user.bio,
      resumePath: user.resumePath,
      createdAt: user.createdAt
    }
  });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const { skills, department, college, bio, name, email } = req.body;

  // Validate skills array
  if (skills !== undefined) {
    if (!Array.isArray(skills)) {
      return next(new ApiError(400, 'Skills must be an array'));
    }
    if (skills.length > 20) {
      return next(new ApiError(400, 'You can add a maximum of 20 skills'));
    }
    const allNonEmptyStrings = skills.every(s => typeof s === 'string' && s.trim().length > 0);
    if (!allNonEmptyStrings) {
      return next(new ApiError(400, 'Skills must be an array of non-empty strings'));
    }
  }

  // Construct update payload allowing only specified fields
  const updateFields = {};
  if (skills !== undefined) updateFields.skills = skills.map(s => s.trim());
  if (department !== undefined) updateFields.department = department;
  if (college !== undefined) updateFields.college = college;
  if (bio !== undefined) updateFields.bio = bio;
  if (name !== undefined) updateFields.name = name;
  if (email !== undefined) updateFields.email = email;

  // Update user's profile
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select('-password');

  return apiResponse(res, 200, 'Profile updated successfully', {
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      department: updatedUser.department,
      college: updatedUser.college,
      skills: updatedUser.skills,
      bio: updatedUser.bio,
      resumePath: updatedUser.resumePath,
      createdAt: updatedUser.createdAt
    }
  });
});

export const uploadUserResume = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, 'Please upload a PDF file'));
  }

  // File path accessible via URL
  const resumePath = `/uploads/resumes/${req.file.filename}`;

  // Update user's profile
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { resumePath } },
    { new: true, runValidators: true }
  ).select('-password');

  return apiResponse(res, 200, 'Resume uploaded successfully', {
    resumePath,
    user: updatedUser
  });
});
