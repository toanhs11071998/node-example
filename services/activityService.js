const Activity = require('../models/Activity');
const { logger } = require('../config/logger');

class ActivityService {
  async logActivity(projectId, taskId, userId, action, description, changes = {}, metadata = {}) {
    try {
      const activity = await Activity.create({
        project: projectId,
        task: taskId,
        user: userId,
        action,
        description,
        changes,
        metadata,
      });
      return activity;
    } catch (err) {
      logger.error('Error logging activity', err);
      // Don't throw - activity logging should not break main flow
    }
  }

  async logTaskCreated(projectId, taskId, userId, taskData) {
    return this.logActivity(
      projectId,
      taskId,
      userId,
      'task-created',
      `Created task "${taskData.title}"`,
      {},
      { title: taskData.title, priority: taskData.priority }
    );
  }

  async logTaskUpdated(projectId, taskId, userId, oldData, newData) {
    const changes = {};
    const fields = ['title', 'description', 'priority', 'dueDate', 'progress'];
    fields.forEach(field => {
      if (oldData[field] !== newData[field]) {
        changes[field] = { from: oldData[field], to: newData[field] };
      }
    });

    return this.logActivity(
      projectId,
      taskId,
      userId,
      'task-updated',
      `Updated task "${newData.title}"`,
      changes,
      { title: newData.title }
    );
  }

  async logTaskStatusChanged(projectId, taskId, userId, taskTitle, oldStatus, newStatus) {
    return this.logActivity(
      projectId,
      taskId,
      userId,
      'task-status-changed',
      `Changed status from ${oldStatus} to ${newStatus}`,
      { status: { from: oldStatus, to: newStatus } },
      { title: taskTitle }
    );
  }

  async logTaskAssigned(projectId, taskId, userId, taskTitle, assigneeId) {
    return this.logActivity(
      projectId,
      taskId,
      userId,
      'task-assigned',
      `Assigned task to user ${assigneeId}`,
      { assignee: assigneeId },
      { title: taskTitle }
    );
  }

  async logTaskDeleted(projectId, taskId, userId, taskTitle) {
    return this.logActivity(
      projectId,
      taskId,
      userId,
      'task-deleted',
      `Deleted task "${taskTitle}"`,
      {},
      { title: taskTitle }
    );
  }

  async logCommentAdded(projectId, taskId, userId, commentContent) {
    return this.logActivity(
      projectId,
      taskId,
      userId,
      'comment-added',
      `Added comment on task`,
      {},
      { contentPreview: commentContent.substring(0, 50) }
    );
  }

  async logCommentDeleted(projectId, taskId, userId) {
    return this.logActivity(
      projectId,
      taskId,
      userId,
      'comment-deleted',
      `Deleted comment`,
      {},
      {}
    );
  }

  async logAttachmentAdded(projectId, taskId, userId, fileName, fileSize) {
    return this.logActivity(
      projectId,
      taskId,
      userId,
      'attachment-added',
      `Attached file "${fileName}"`,
      {},
      { fileName, fileSize }
    );
  }

  async logAttachmentDeleted(projectId, taskId, userId, fileName) {
    return this.logActivity(
      projectId,
      taskId,
      userId,
      'attachment-deleted',
      `Deleted attachment "${fileName}"`,
      {},
      { fileName }
    );
  }

  async logProjectCreated(projectId, userId, projectName) {
    return this.logActivity(
      projectId,
      null,
      userId,
      'project-created',
      `Created project "${projectName}"`,
      {},
      { name: projectName }
    );
  }

  async logMemberAdded(projectId, userId, memberId, memberName) {
    return this.logActivity(
      projectId,
      null,
      userId,
      'member-added',
      `Added ${memberName} to project`,
      {},
      { memberId, memberName }
    );
  }

  async logMemberRemoved(projectId, userId, memberId, memberName) {
    return this.logActivity(
      projectId,
      null,
      userId,
      'member-removed',
      `Removed ${memberName} from project`,
      {},
      { memberId, memberName }
    );
  }

  async getProjectActivity(projectId, limit = 50, page = 1) {
    const skip = (page - 1) * limit;
    return Activity.find({ project: projectId })
      .populate('user', 'name email')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async getTaskActivity(taskId, limit = 50) {
    return Activity.find({ task: taskId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getUserActivity(userId, limit = 50, page = 1) {
    const skip = (page - 1) * limit;
    return Activity.find({ user: userId })
      .populate('project', 'name')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }
}

module.exports = new ActivityService();
