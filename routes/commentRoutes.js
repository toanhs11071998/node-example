const express = require('express');
const router = express.Router({ mergeParams: true });
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');
const { validateRequest, validateObjectId } = require('../middleware/validation');

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
