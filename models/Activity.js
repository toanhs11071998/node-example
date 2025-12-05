const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: [
        'task-created',
        'task-updated',
        'task-status-changed',
        'task-assigned',
        'task-deleted',
        'comment-added',
        'comment-updated',
        'comment-deleted',
        'attachment-added',
        'attachment-deleted',
        'project-created',
        'project-updated',
        'member-added',
        'member-removed',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    changes: {
      // Track what changed (e.g., { status: { from: 'todo', to: 'in-progress' } })
      type: mongoose.Schema.Types.Mixed,
    },
    metadata: {
      // Additional info (e.g., file name for attachments)
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ task: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
