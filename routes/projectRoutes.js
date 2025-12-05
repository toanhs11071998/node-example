const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');
const { validateRequest, validateObjectId } = require('../middleware/validation');

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
