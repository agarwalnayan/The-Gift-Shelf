import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Get all notifications for the authenticated user
 */
export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .populate({
      path: 'order',
      select: 'orderStatus totalPrice',
      match: { _id: { $ne: null } }
    })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    read: false,
  });

  res.status(200).json(
    new ApiResponse(200, { notifications, unreadCount }, 'Notifications fetched successfully')
  );
});

/**
 * Get unread notifications count
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    read: false,
  });

  res.status(200).json(new ApiResponse(200, { unreadCount }, 'Unread count fetched successfully'));
});

/**
 * Mark a notification as read
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  notification.read = true;
  await notification.save();

  res.status(200).json(new ApiResponse(200, { notification }, 'Notification marked as read'));
});

/**
 * Mark all notifications as read
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true }
  );

  res.status(200).json(new ApiResponse(200, {}, 'All notifications marked as read'));
});

/**
 * Delete a notification
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  await Notification.findByIdAndDelete(req.params.id);

  res.status(200).json(new ApiResponse(200, {}, 'Notification deleted successfully'));
});
