/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: In-app notifications
 */
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// All routes require auth
router.use(auth);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notifications for current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/', notificationController.getNotifications);

/**
 * @swagger
 * /api/notifications/unread/count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get unread notifications count
 *     security:
 *       - bearerAuth: []
 */
router.get('/unread/count', notificationController.getUnreadCount);

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark a notification as read
 *     security:
 *       - bearerAuth: []
 */
router.put('/:notificationId/read', notificationController.markAsRead);

/**
 * @swagger
 * /api/notifications/mark-all-as-read:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     security:
 *       - bearerAuth: []
 */
router.put('/mark-all-as-read', notificationController.markAllAsRead);

/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete a notification
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;
