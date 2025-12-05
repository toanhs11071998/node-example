/**
 * @swagger
 * tags:
 *   - name: Tasks
 *     description: Task management within a project
 */
const express = require('express');
const router = express.Router({ mergeParams: true });
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const { validateRequest, validateObjectId } = require('../middleware/validation');

/**
 * @swagger
 * /api/projects/{projectId}/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a task in a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
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
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created
 */
/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get a task by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task details
 *   put:
 *     tags: [Tasks]
 *     summary: Update a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
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
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted
 */

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}/subtasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Add a subtask to a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
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
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subtask created
 *
 * /api/projects/{projectId}/tasks/{taskId}/subtasks/toggle:
 *   put:
 *     tags: [Tasks]
 *     summary: Toggle subtask completion
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}/tags:
 *   post:
 *     tags: [Tasks]
 *     summary: Add a tag to a task
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags: [Tasks]
 *     summary: Remove a tag from a task
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get a task by id
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task details
 */

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
