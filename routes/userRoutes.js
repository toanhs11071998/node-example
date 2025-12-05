/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management (admin + owner)
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateRequest, validateObjectId } = require('../middleware/validation');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by id (owner or admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 */


// GET: Lấy tất cả users (admin only)
router.get('/', auth, authorize(['admin']), userController.getAllUsers);

// GET: Lấy một user theo ID (owner or admin)
router.get('/:id', validateObjectId, auth, async (req, res, next) => {
	// allow if admin or owner
	if (req.user.role === 'admin' || req.user.id === req.params.id) return userController.getUserById(req, res, next);
	return res.status(403).json({ success: false, message: 'Forbidden' });
});

// POST: Tạo user mới (admin only)
router.post('/', auth, authorize(['admin']), validateRequest, userController.createUser);

// PUT: Cập nhật user (owner or admin)
router.put('/:id', validateObjectId, auth, validateRequest, async (req, res, next) => {
	if (req.user.role === 'admin' || req.user.id === req.params.id) return userController.updateUser(req, res, next);
	return res.status(403).json({ success: false, message: 'Forbidden' });
});

// DELETE: Xóa user (admin only)
router.delete('/:id', validateObjectId, auth, authorize(['admin']), userController.deleteUser);

module.exports = router;
