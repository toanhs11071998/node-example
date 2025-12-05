const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const activityController = require('../controllers/activityController');

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
