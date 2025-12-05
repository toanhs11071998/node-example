const express = require('express');
const router = express.Router({ mergeParams: true });
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const { validateRequest, validateObjectId } = require('../middleware/validation');

// All routes require auth
router.use(auth);

// Task CRUD
router.post('/', validateRequest, taskController.createTask);
router.get('/:taskId', validateObjectId, taskController.getTask);
router.put('/:taskId', validateObjectId, validateRequest, taskController.updateTask);
router.delete('/:taskId', validateObjectId, taskController.deleteTask);

// Subtasks
router.post('/:taskId/subtasks', validateObjectId, validateRequest, taskController.addSubtask);
router.put('/:taskId/subtasks/toggle', validateObjectId, validateRequest, taskController.toggleSubtask);

// Tags
router.post('/:taskId/tags', validateObjectId, validateRequest, taskController.addTag);
router.delete('/:taskId/tags', validateObjectId, validateRequest, taskController.removeTag);

module.exports = router;
