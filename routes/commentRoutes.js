/**
 * @swagger
 * tags:
 *   - name: Comments
 *     description: Comments, replies and reactions on tasks
 */
const express = require('express');
const router = express.Router({ mergeParams: true });
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');
const { validateRequest, validateObjectId } = require('../middleware/validation');

/**
 * @swagger
 * /api/tasks/{taskId}/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Create a comment on a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 */
/**
 * @swagger
 * /api/tasks/{taskId}/comments:
 *   get:
 *     tags: [Comments]
 *     summary: List comments for a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of comments
 */

/**
 * @swagger
 * /api/tasks/{taskId}/comments/{commentId}:
 *   put:
 *     tags: [Comments]
 *     summary: Update a comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated
 */

/**
 * @swagger
 * /api/tasks/{taskId}/comments/{commentId}:
 *   delete:
 *     tags: [Comments]
 *     summary: Delete a comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 */

/**
 * @swagger
 * /api/tasks/{taskId}/comments/{commentId}/reactions:
 *   post:
 *     tags: [Comments]
 *     summary: Add reaction to a comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emoji:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reaction added
 */

/**
 * @swagger
 * /api/tasks/{taskId}/comments/{commentId}/reactions:
 *   delete:
 *     tags: [Comments]
 *     summary: Remove reaction from a comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emoji:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reaction removed
 */

/**
 * @swagger
 * /api/tasks/{taskId}/comments/{commentId}/replies:
 *   post:
 *     tags: [Comments]
 *     summary: Reply to a comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reply created
 */

// All routes require auth
router.use(auth);

// Comments on task
router.post('/', validateRequest, commentController.createComment);
router.get('/', commentController.getComments);
router.put('/:commentId', validateObjectId, validateRequest, commentController.updateComment);
router.delete('/:commentId', validateObjectId, commentController.deleteComment);

// Reactions
router.post('/:commentId/reactions', validateObjectId, validateRequest, commentController.addReaction);
router.delete('/:commentId/reactions', validateObjectId, validateRequest, commentController.removeReaction);

// Replies
router.post('/:commentId/replies', validateObjectId, validateRequest, commentController.replyToComment);

module.exports = router;
