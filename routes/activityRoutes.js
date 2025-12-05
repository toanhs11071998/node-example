/**
 * @swagger
 * tags:
 *   - name: Activity
 *     description: Activity / audit logs for projects and tasks
 */
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const activityController = require('../controllers/activityController');

/**
 * @swagger
 * /api/activity/project/{projectId}:
 *   get:
 *     tags: [Activity]
 *     summary: Get activity for a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project activity list
 */

// Get current user's activity
router.get('/me', auth, activityController.getUserActivity);

// Get activities by action type
router.get('/action/:action', auth, activityController.getActivityByAction);

// Get project activity
router.get('/project/:projectId', auth, activityController.getProjectActivity);

// Get project activity statistics
router.get('/project/:projectId/stats', auth, activityController.getProjectActivityStats);

// Get task activity
router.get('/task/:taskId', auth, activityController.getTaskActivity);

module.exports = router;
