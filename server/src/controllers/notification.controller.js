import { Notification } from '../models/Notification.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';

export const getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('relatedProject', 'title');

  return apiResponse(res, 200, 'Notifications retrieved successfully', { notifications });
});

export const markAsRead = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: req.user._id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return next(new ApiError(404, 'Notification not found'));
  }

  return apiResponse(res, 200, 'Notification marked as read', { notification });
});

export const markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true }
  );

  return apiResponse(res, 200, 'All notifications marked as read', null);
});
