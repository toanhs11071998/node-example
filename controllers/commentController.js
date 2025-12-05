const Comment = require('../models/Comment');
const Task = require('../models/Task');
const User = require('../models/User');
const notificationService = require('../services/notificationService');
const { successHandler, errorHandler } = require('../utils/responseHandler');

// Create comment on task
exports.createComment = async (req, res) => {
  try {
    const { content, mentions = [] } = req.body;
    if (!content) return errorHandler(res, 400, 'Comment content is required');

    const task = await Task.findById(req.params.taskId);
    if (!task) return errorHandler(res, 404, 'Task not found');

    const comment = new Comment({
      content,
      task: req.params.taskId,
      author: req.user.id,
      mentions,
    });

    await comment.save();
    await comment.populate('author', 'name email');

    // Increment task comment count
    task.commentCount = (task.commentCount || 0) + 1;
    await task.save();

    // Notify mentions
    for (const userId of mentions) {
      await notificationService.notifyMentioned(userId, task._id, task.title, req.user.id);
    }

    // Notify assignee
    if (task.assignee && task.assignee.toString() !== req.user.id) {
      await notificationService.notifyCommented(
        task.assignee,
        task._id,
        task.title,
        req.user.id
      );
    }

    successHandler(res, 201, 'Comment created', comment);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Get task comments
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId, parentComment: null })
      .populate('author', 'name email')
      .populate('mentions', 'name email')
      .populate('replies')
      .sort({ createdAt: -1 });

    successHandler(res, 200, 'Comments retrieved', comments);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Update comment
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return errorHandler(res, 400, 'Comment content is required');

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return errorHandler(res, 404, 'Comment not found');

    if (comment.author.toString() !== req.user.id) {
      return errorHandler(res, 403, 'Forbidden');
    }

    comment.content = content;
    await comment.save();
    await comment.populate('author', 'name email');

    successHandler(res, 200, 'Comment updated', comment);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return errorHandler(res, 404, 'Comment not found');

    if (comment.author.toString() !== req.user.id) {
      return errorHandler(res, 403, 'Forbidden');
    }

    const task = await Task.findById(comment.task);
    if (task) {
      task.commentCount = Math.max(0, (task.commentCount || 1) - 1);
      await task.save();
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    successHandler(res, 200, 'Comment deleted');
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Add reaction to comment
exports.addReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    if (!emoji) return errorHandler(res, 400, 'Emoji is required');

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return errorHandler(res, 404, 'Comment not found');

    let reaction = comment.reactions.find(r => r.emoji === emoji);
    if (!reaction) {
      reaction = { emoji, users: [] };
      comment.reactions.push(reaction);
    }

    if (!reaction.users.includes(req.user.id)) {
      reaction.users.push(req.user.id);
    }

    await comment.save();
    successHandler(res, 200, 'Reaction added', comment);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Remove reaction from comment
exports.removeReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    if (!emoji) return errorHandler(res, 400, 'Emoji is required');

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return errorHandler(res, 404, 'Comment not found');

    const reaction = comment.reactions.find(r => r.emoji === emoji);
    if (reaction) {
      reaction.users = reaction.users.filter(u => u.toString() !== req.user.id);
      if (reaction.users.length === 0) {
        comment.reactions = comment.reactions.filter(r => r.emoji !== emoji);
      }
    }

    await comment.save();
    successHandler(res, 200, 'Reaction removed', comment);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Reply to comment
exports.replyToComment = async (req, res) => {
  try {
    const { content, mentions = [] } = req.body;
    if (!content) return errorHandler(res, 400, 'Reply content is required');

    const parentComment = await Comment.findById(req.params.commentId);
    if (!parentComment) return errorHandler(res, 404, 'Comment not found');

    const reply = new Comment({
      content,
      task: parentComment.task,
      author: req.user.id,
      mentions,
      parentComment: req.params.commentId,
    });

    await reply.save();
    await reply.populate('author', 'name email');

    parentComment.replies.push(reply._id);
    await parentComment.save();

    successHandler(res, 201, 'Reply created', reply);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};
