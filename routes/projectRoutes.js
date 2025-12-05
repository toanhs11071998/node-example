/**
 * @swagger
 * tags:
 *   - name: Projects
 *     description: Project management and member operations
 */
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');
const { validateRequest, validateObjectId } = require('../middleware/validation');

/**
 * @swagger
 * /api/projects:
 *   get:
 *     tags: [Projects]
 *     summary: Get projects for current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 *   post:
 *     tags: [Projects]
 *     summary: Create a new project
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created
 */

/**
 * @swagger
 * /api/projects/{projectId}:
 *   get:
 *     tags: [Projects]
 *     summary: Get a project by id
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details
 */

/**
 * @swagger
 * /api/projects/{projectId}/members:
 *   post:
 *     tags: [Projects]
 *     summary: Add member to project (owner only)
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags: [Projects]
 *     summary: Remove member from project (owner only)
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /api/projects/{projectId}/tasks:
 *   get:
 *     tags: [Projects]
 *     summary: List tasks in a project with filters
 *     security:
 *       - bearerAuth: []
 */

// All routes require auth
router.use(auth);

// Project CRUD
router.get('/', projectController.getMyProjects);
router.post('/', validateRequest, projectController.createProject);
router.get('/:projectId', validateObjectId, projectController.getProject);
router.put('/:projectId', validateObjectId, validateRequest, projectController.updateProject);
router.delete('/:projectId', validateObjectId, projectController.deleteProject);

// Project members
router.post('/:projectId/members', validateObjectId, validateRequest, projectController.addMember);
router.delete('/:projectId/members', validateObjectId, validateRequest, projectController.removeMember);

// Project tasks
router.get('/:projectId/tasks', validateObjectId, projectController.getProjectTasks);

module.exports = router;
