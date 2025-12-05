const { getIO } = require('../config/socket');

class SocketService {
  // Emit task update to project members
  static emitTaskUpdate(projectId, taskId, taskData, updatedBy) {
    const io = getIO();
    if (io) {
      io.to(`project:${projectId}`).emit('task-updated', {
        taskId,
        projectId,
        task: taskData,
        updatedBy,
        timestamp: new Date(),
      });
    }
  }

  // Emit task status change
  static emitTaskStatusChange(projectId, taskId, taskData, newStatus, updatedBy) {
    const io = getIO();
    if (io) {
      io.to(`project:${projectId}`).emit('task-status-changed', {
        taskId,
        projectId,
        task: taskData,
        newStatus,
        updatedBy,
        timestamp: new Date(),
      });
      // Also emit to task room
      io.to(`task:${taskId}`).emit('status-changed', {
        taskId,
        newStatus,
        timestamp: new Date(),
      });
    }
  }

  // Emit task assigned
  static emitTaskAssigned(projectId, taskId, taskData, assigneeId, assignedBy) {
    const io = getIO();
    if (io) {
      io.to(`project:${projectId}`).emit('task-assigned', {
        taskId,
        projectId,
        task: taskData,
        assigneeId,
        assignedBy,
        timestamp: new Date(),
      });
      // Notify assignee personally
      io.to(`user:${assigneeId}`).emit('task-assigned-to-you', {
        taskId,
        taskTitle: taskData.title,
        projectId,
        assignedBy,
        timestamp: new Date(),
      });
    }
  }

  // Emit new comment
  static emitNewComment(projectId, taskId, commentData, authorId) {
    const io = getIO();
    if (io) {
      io.to(`task:${taskId}`).emit('comment-added', {
        taskId,
        projectId,
        comment: commentData,
        authorId,
        timestamp: new Date(),
      });
      io.to(`project:${projectId}`).emit('task-comment-added', {
        taskId,
        projectId,
        commentId: commentData._id,
        authorId,
        timestamp: new Date(),
      });
    }
  }

  // Emit comment update
  static emitCommentUpdate(projectId, taskId, commentData) {
    const io = getIO();
    if (io) {
      io.to(`task:${taskId}`).emit('comment-updated', {
        taskId,
        projectId,
        comment: commentData,
        timestamp: new Date(),
      });
    }
  }

  // Emit comment deleted
  static emitCommentDeleted(projectId, taskId, commentId) {
    const io = getIO();
    if (io) {
      io.to(`task:${taskId}`).emit('comment-deleted', {
        taskId,
        projectId,
        commentId,
        timestamp: new Date(),
      });
    }
  }

  // Emit reaction added
  static emitReactionAdded(projectId, taskId, commentId, emoji, userId) {
    const io = getIO();
    if (io) {
      io.to(`task:${taskId}`).emit('reaction-added', {
        taskId,
        projectId,
        commentId,
        emoji,
        userId,
        timestamp: new Date(),
      });
    }
  }

  // Emit reaction removed
  static emitReactionRemoved(projectId, taskId, commentId, emoji, userId) {
    const io = getIO();
    if (io) {
      io.to(`task:${taskId}`).emit('reaction-removed', {
        taskId,
        projectId,
        commentId,
        emoji,
        userId,
        timestamp: new Date(),
      });
    }
  }

  // Emit notification to user
  static emitNotificationToUser(userId, notificationData) {
    const io = getIO();
    if (io) {
      io.to(`user:${userId}`).emit('notification', {
        notification: notificationData,
        timestamp: new Date(),
      });
    }
  }

  // Broadcast notification to multiple users
  static emitNotificationsToUsers(userIds, notificationData) {
    const io = getIO();
    if (io) {
      userIds.forEach((userId) => {
        io.to(`user:${userId}`).emit('notification', {
          notification: notificationData,
          timestamp: new Date(),
        });
      });
    }
  }

  // Emit project member joined
  static emitProjectMemberJoined(projectId, userId, userName) {
    const io = getIO();
    if (io) {
      io.to(`project:${projectId}`).emit('member-joined-project', {
        projectId,
        userId,
        userName,
        timestamp: new Date(),
      });
    }
  }

  // Emit project update
  static emitProjectUpdate(projectId, projectData) {
    const io = getIO();
    if (io) {
      io.to(`project:${projectId}`).emit('project-updated', {
        projectId,
        project: projectData,
        timestamp: new Date(),
      });
    }
  }

  // Join user room (for personal notifications)
  static joinUserRoom(socket, userId) {
    socket.join(`user:${userId}`);
  }
}

module.exports = SocketService;
