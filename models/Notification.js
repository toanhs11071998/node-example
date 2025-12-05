const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['assigned', 'due-soon', 'status-changed', 'mentioned', 'commented', 'project-added'],
      required: true,
    },
    relatedEntity: {
      model: String,
      entity: mongoose.Schema.Types.ObjectId,
    },
    title: String,
    message: String,
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

// TTL index to auto-delete read notifications after 30 days
notificationSchema.index(
  { readAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60, partialFilterExpression: { read: true } }
);

module.exports = mongoose.model('Notification', notificationSchema);
