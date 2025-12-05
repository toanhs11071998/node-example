const Attachment = require('../models/Attachment');
const Task = require('../models/Task');
const activityService = require('../services/activityService');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { logger } = require('../config/logger');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '../uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// List attachments for a task
exports.listAttachments = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.user.id;

    // Verify task exists and user has access
    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    // Check if user is project member
    const isMember = task.project.members.some(
      (m) => m.user.toString() === userId
    );
    if (task.project.owner.toString() !== userId && !isMember) {
      return errorResponse(res, 'Not authorized to view attachments', 403);
    }

    const attachments = await Attachment.find({
      task: taskId,
      deletedAt: null,
    })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    return successResponse(res, attachments, 'Attachments retrieved successfully');
  } catch (err) {
    logger.error('Error listing attachments', err);
    return errorResponse(res, err.message, 500);
  }
};

// Get attachment details
exports.getAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const userId = req.user.id;

    const attachment = await Attachment.findById(attachmentId)
      .populate('uploadedBy', 'name email')
      .populate('task', 'title');

    if (!attachment) {
      return errorResponse(res, 'Attachment not found', 404);
    }

    // Check if already deleted
    if (attachment.deletedAt) {
      return errorResponse(res, 'Attachment has been deleted', 404);
    }

    return successResponse(res, attachment, 'Attachment retrieved successfully');
  } catch (err) {
    logger.error('Error getting attachment', err);
    return errorResponse(res, err.message, 500);
  }
};

// Upload attachment
exports.uploadAttachment = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.user.id;

    if (!req.file) {
      return errorResponse(res, 'No file provided', 400);
    }

    // Verify task exists and user has access
    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    // Check if user is project member
    const isMember = task.project.members.some(
      (m) => m.user.toString() === userId
    );
    if (task.project.owner.toString() !== userId && !isMember) {
      return errorResponse(res, 'Not authorized to upload files', 403);
    }

    const file = req.file;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      fs.unlinkSync(file.path);
      return errorResponse(
        res,
        `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
        400
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      fs.unlinkSync(file.path);
      return errorResponse(res, 'File type not allowed', 400);
    }

    // Generate unique filename
    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}-${file.originalname}`;
    const storagePath = `/uploads/${uniqueName}`;

    // Create attachment record
    const attachment = await Attachment.create({
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      fileUrl: storagePath,
      storagePath: path.join(UPLOAD_DIR, uniqueName),
      uploadedBy: userId,
      task: taskId,
      project: projectId,
    });

    // Rename file to unique name
    const newPath = path.join(UPLOAD_DIR, uniqueName);
    fs.renameSync(file.path, newPath);

    const populatedAttachment = await attachment.populate('uploadedBy', 'name email');

    // Log activity
    await activityService.logAttachmentAdded(projectId, taskId, userId, file.originalname, file.size);

    logger.info(
      `File uploaded: ${attachment._id} by user ${userId} for task ${taskId}`
    );
    return successResponse(res, populatedAttachment, 'File uploaded successfully', 201);
  } catch (err) {
    logger.error('Error uploading attachment', err);
    // Clean up file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return errorResponse(res, err.message, 500);
  }
};

// Delete attachment (soft delete)
exports.deleteAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const userId = req.user.id;

    const attachment = await Attachment.findById(attachmentId);
    if (!attachment) {
      return errorResponse(res, 'Attachment not found', 404);
    }

    // Check if already deleted
    if (attachment.deletedAt) {
      return errorResponse(res, 'Attachment already deleted', 404);
    }

    // Only uploader or project owner can delete
    const task = await Task.findById(attachment.task).populate('project');
    if (
      attachment.uploadedBy.toString() !== userId &&
      task.project.owner.toString() !== userId
    ) {
      return errorResponse(res, 'Not authorized to delete this attachment', 403);
    }

    // Soft delete
    attachment.deletedAt = new Date();
    attachment.deletedBy = userId;
    await attachment.save();

    // Log activity
    await activityService.logAttachmentDeleted(task.project._id, attachment.task, userId, attachment.fileName);

    logger.info(`Attachment deleted: ${attachmentId} by user ${userId}`);
    return successResponse(res, null, 'Attachment deleted successfully');
  } catch (err) {
    logger.error('Error deleting attachment', err);
    return errorResponse(res, err.message, 500);
  }
};

// Download attachment
exports.downloadAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const userId = req.user.id;

    const attachment = await Attachment.findById(attachmentId);
    if (!attachment) {
      return errorResponse(res, 'Attachment not found', 404);
    }

    if (attachment.deletedAt) {
      return errorResponse(res, 'Attachment has been deleted', 404);
    }

    // Check if file exists
    if (!fs.existsSync(attachment.storagePath)) {
      return errorResponse(res, 'File not found on server', 404);
    }

    res.download(attachment.storagePath, attachment.fileName);

    logger.info(`Attachment downloaded: ${attachmentId} by user ${userId}`);
  } catch (err) {
    logger.error('Error downloading attachment', err);
    return errorResponse(res, err.message, 500);
  }
};

// Permanently delete attachment file (cleanup task - run periodically)
exports.permanentlyDeleteExpiredAttachments = async (req, res) => {
  try {
    const userId = req.user.id;

    // Only admin can call this
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Only admin can perform this action', 403);
    }

    // Find soft-deleted attachments older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const expiredAttachments = await Attachment.find({
      deletedAt: { $lt: thirtyDaysAgo },
    });

    let deletedCount = 0;
    for (const attachment of expiredAttachments) {
      try {
        if (fs.existsSync(attachment.storagePath)) {
          fs.unlinkSync(attachment.storagePath);
        }
        await Attachment.findByIdAndDelete(attachment._id);
        deletedCount++;
      } catch (err) {
        logger.error(
          `Error permanently deleting attachment ${attachment._id}`,
          err
        );
      }
    }

    logger.info(`Permanently deleted ${deletedCount} expired attachments`);
    return successResponse(res, { deleted: deletedCount }, 'Cleanup completed');
  } catch (err) {
    logger.error('Error in permanent deletion', err);
    return errorResponse(res, err.message, 500);
  }
};
