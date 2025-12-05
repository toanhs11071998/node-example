const Activity = require('../models/Activity');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { logger } = require('../config/logger');

// Get project activity
exports.getProjectActivity = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 20, action, userId } = req.query;
    const authUserId = req.user.id;

    // Verify project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    // Check if user is project member or owner
    const isMember = project.members.some(
      (m) => m.user.toString() === authUserId
    );
    if (project.owner.toString() !== authUserId && !isMember) {
      return errorResponse(res, 'Not authorized to view project activity', 403);
    }

    // Build query
    const query = { project: projectId };
    if (action) query.action = action;
    if (userId) query.user = userId;

    const skip = (page - 1) * limit;
    const activities = await Activity.find(query)
      .populate('user', 'name email avatar')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments(query);

    return successResponse(
      res,
      {
        activities,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
      'Project activity retrieved successfully'
    );
  } catch (err) {
    logger.error('Error getting project activity', err);
    return errorResponse(res, err.message, 500);
  }
};

// Get task activity
exports.getTaskActivity = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const authUserId = req.user.id;

    // Verify task exists
    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    // Verify project and user access
    const project = task.project;
    const isMember = project.members.some(
      (m) => m.user.toString() === authUserId
    );
    if (project.owner.toString() !== authUserId && !isMember) {
      return errorResponse(res, 'Not authorized to view task activity', 403);
    }

    const skip = (page - 1) * limit;
    const activities = await Activity.find({ task: taskId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments({ task: taskId });

    return successResponse(
      res,
      {
        activities,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
      'Task activity retrieved successfully'
    );
  } catch (err) {
    logger.error('Error getting task activity', err);
    return errorResponse(res, err.message, 500);
  }
};

// Get user's activity (activities they performed)
exports.getUserActivity = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const authUserId = req.user.id;

    const skip = (page - 1) * limit;
    const activities = await Activity.find({ user: authUserId })
      .populate('project', 'name')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments({ user: authUserId });

    return successResponse(
      res,
      {
        activities,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
      'User activity retrieved successfully'
    );
  } catch (err) {
    logger.error('Error getting user activity', err);
    return errorResponse(res, err.message, 500);
  }
};

// Get activity by action type with filters
exports.getActivityByAction = async (req, res) => {
  try {
    const { action } = req.params;
    const { projectId, page = 1, limit = 20 } = req.query;
    const authUserId = req.user.id;

    const validActions = [
      'task-created',
      'task-updated',
      'task-status-changed',
      'task-assigned',
      'task-deleted',
      'comment-added',
      'comment-deleted',
      'attachment-added',
      'attachment-deleted',
      'project-created',
      'member-added',
      'member-removed',
    ];

    if (!validActions.includes(action)) {
      return errorResponse(res, 'Invalid action type', 400);
    }

    // Build query
    const query = { action };

    // If projectId provided, verify access
    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        return errorResponse(res, 'Project not found', 404);
      }

      const isMember = project.members.some(
        (m) => m.user.toString() === authUserId
      );
      if (project.owner.toString() !== authUserId && !isMember) {
        return errorResponse(res, 'Not authorized to view this project', 403);
      }

      query.project = projectId;
    }

    const skip = (page - 1) * limit;
    const activities = await Activity.find(query)
      .populate('user', 'name email avatar')
      .populate('project', 'name')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments(query);

    return successResponse(
      res,
      {
        activities,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        action,
      },
      `Activities with action "${action}" retrieved successfully`
    );
  } catch (err) {
    logger.error('Error getting activities by action', err);
    return errorResponse(res, err.message, 500);
  }
};

// Get activity statistics for a project
exports.getProjectActivityStats = async (req, res) => {
  try {
    const { projectId } = req.params;
    const authUserId = req.user.id;

    // Verify project and access
    const project = await Project.findById(projectId);
    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    const isMember = project.members.some(
      (m) => m.user.toString() === authUserId
    );
    if (project.owner.toString() !== authUserId && !isMember) {
      return errorResponse(res, 'Not authorized to view project stats', 403);
    }

    // Get activity count by action
    const stats = await Activity.aggregate([
      { $match: { project: project._id } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get most active users
    const topUsers = await Activity.aggregate([
      { $match: { project: project._id } },
      {
        $group: {
          _id: '$user',
          activityCount: { $sum: 1 },
        },
      },
      { $sort: { activityCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $project: {
          user: { $arrayElemAt: ['$userInfo', 0] },
          activityCount: 1,
        },
      },
    ]);

    // Get activity timeline (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const timeline = await Activity.aggregate([
      {
        $match: {
          project: project._id,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return successResponse(
      res,
      {
        actionStats: stats,
        topUsers,
        timeline,
      },
      'Project activity statistics retrieved successfully'
    );
  } catch (err) {
    logger.error('Error getting project activity stats', err);
    return errorResponse(res, err.message, 500);
  }
};
