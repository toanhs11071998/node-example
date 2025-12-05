/**
 * @swagger
 * tags:
 *   - name: Teams
 *     description: Team & workspace management
 */
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const teamController = require('../controllers/teamController');

// Public routes
/**
 * @swagger
 * /api/teams/public:
 *   get:
 *     tags: [Teams]
 *     summary: List public teams
 *     responses:
 *       200:
 *         description: Public teams list
 */
router.get('/public', teamController.getPublicTeams);

// Protected routes
router.post('/', auth, teamController.createTeam);
router.get('/', auth, teamController.getMyTeams);
router.get('/:teamId', auth, teamController.getTeam);
router.put('/:teamId', auth, teamController.updateTeam);
router.delete('/:teamId', auth, teamController.deleteTeam);

// Member management
router.post('/:teamId/members', auth, teamController.addMember);
router.delete('/:teamId/members', auth, teamController.removeMember);

// Invite management
router.post('/:teamId/invite', auth, teamController.generateInviteCode);
router.post('/join/code', auth, teamController.joinTeamByCode);

module.exports = router;
