import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

const isValidEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, department, college } = req.body;

  // Manual validation
  if (!name || !email || !password || !department || !college) {
    return next(new ApiError(400, 'Please provide name, email, password, department, and college'));
  }

  if (!isValidEmail(email)) {
    return next(new ApiError(400, 'Please provide a valid email format'));
  }

  // Check if user exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new ApiError(400, 'Email already registered'));
  }

  // Check if it's the super admin email from environment
  const role = email.toLowerCase() === env.SUPER_ADMIN_EMAIL.toLowerCase() ? 'ADMIN' : 'USER';

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    department,
    college,
    role
  });

  // Generate Token
  const token = generateToken(user._id, user.role);

  // Send response
  return apiResponse(res, 201, 'User registered successfully', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    },
    token
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Manual validation
  if (!email || !password) {
    return next(new ApiError(400, 'Please provide email and password'));
  }

  if (!isValidEmail(email)) {
    return next(new ApiError(400, 'Please provide a valid email format'));
  }

  // Find user by email with password selected
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  
  if (!user) {
    return next(new ApiError(401, 'Invalid email or password'));
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ApiError(401, 'Invalid email or password'));
  }

  // Generate Token
  const token = generateToken(user._id, user.role);

  // Remove password from response user object
  const userResponse = user.toObject();
  delete userResponse.password;

  return apiResponse(res, 200, 'Login successful', {
    user: userResponse,
    token
  });
});

export const getMe = asyncHandler(async (req, res, next) => {
  return apiResponse(res, 200, 'User retrieved successfully', {
    user: req.user
  });
});
