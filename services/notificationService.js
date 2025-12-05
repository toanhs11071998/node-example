const Notification = require('../models/Notification');
const { logger } = require('../config/logger');

class NotificationService {
  async createNotification(userId, type, relatedEntity, title, message, metadata = {}) {
    try {
      const notification = await Notification.create({
        user: userId,
        type,
        relatedEntity,
        title,
        message,
        metadata,
      });
      return notification;
    } catch (err) {
      logger.error('Error creating notification', err);
      throw err;
    }
  }

  async notifyTaskAssigned(userId, taskId, taskTitle, assignedBy) {
    return this.createNotification(
      userId,
      'assigned',
      { model: 'Task', entity: taskId },
      `Task assigned to you`,
      `"${taskTitle}" was assigned to you by ${assignedBy}`,
      { taskId, assignedBy }
    );
  }

  async notifyStatusChanged(userId, taskId, taskTitle, newStatus, changedBy) {
    return this.createNotification(
      userId,
      'status-changed',
      { model: 'Task', entity: taskId },
      `Task status changed`,
      `"${taskTitle}" status changed to ${newStatus} by ${changedBy}`,
      { taskId, newStatus, changedBy }
    );
  }

  async notifyMentioned(userId, taskId, taskTitle, mentionedBy) {
    return this.createNotification(
      userId,
      'mentioned',
      { model: 'Task', entity: taskId },
      `You were mentioned`,
      `You were mentioned in "${taskTitle}" by ${mentionedBy}`,
      { taskId, mentionedBy }
    );
  }

  async notifyCommented(userId, taskId, taskTitle, commentedBy) {
    return this.createNotification(
      userId,
      'commented',
      { model: 'Task', entity: taskId },
      `New comment on your task`,
      `${commentedBy} commented on "${taskTitle}"`,
      { taskId, commentedBy }
    );
  }

  async getUserNotifications(userId, limit = 20) {
    return Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).populate('user');
  }

  async markAsRead(notificationId) {
    return Notification.findByIdAndUpdate(
      notificationId,
      { read: true, readAt: Date.now() },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return Notification.updateMany({ user: userId, read: false }, { read: true, readAt: Date.now() });
  }

  async deleteNotification(notificationId) {
    return Notification.findByIdAndDelete(notificationId);
  }
}

module.exports = new NotificationService();
