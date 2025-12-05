const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');
const { successHandler, errorHandler } = require('../utils/responseHandler');

// Get notifications for user
exports.getNotifications = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments({ user: req.user.id });

    successHandler(res, 200, 'Notifications retrieved', {
      notifications,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.user.id, read: false });
    successHandler(res, 200, 'Unread count retrieved', { unreadCount: count });
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.notificationId);
    successHandler(res, 200, 'Notification marked as read', notification);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    successHandler(res, 200, 'All notifications marked as read');
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    await notificationService.deleteNotification(req.params.notificationId);
    successHandler(res, 200, 'Notification deleted');
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};
