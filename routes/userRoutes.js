const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateRequest, validateObjectId } = require('../middleware/validation');

// GET: Lấy tất cả users
router.get('/', userController.getAllUsers);

// GET: Lấy một user theo ID
router.get('/:id', validateObjectId, userController.getUserById);

// POST: Tạo user mới
router.post('/', validateRequest, userController.createUser);

// PUT: Cập nhật user
router.put('/:id', validateObjectId, validateRequest, userController.updateUser);

// DELETE: Xóa user
router.delete('/:id', validateObjectId, userController.deleteUser);

module.exports = router;
