/**
 * @swagger
 * tags:
 *   - name: Attachments
 *     description: File attachments for tasks and projects
 */
const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth');
const multer = require('multer');
const attachmentController = require('../controllers/attachmentController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `temp-${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}/attachments:
 *   get:
 *     tags: [Attachments]
 *     summary: List attachments for a task
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
 *         description: Attachments list
 */
router.get('/', auth, attachmentController.listAttachments);

// Get specific attachment
router.get('/:attachmentId', auth, attachmentController.getAttachment);

// Upload attachment
/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}/attachments:
 *   post:
 *     tags: [Attachments]
 *     summary: Upload an attachment to a task (multipart/form-data)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded
 */
router.post('/', auth, upload.single('file'), attachmentController.uploadAttachment);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}/attachments/{attachmentId}/download:
 *   get:
 *     tags: [Attachments]
 *     summary: Download an attachment
 *     security:
 *       - bearerAuth: []
 */
router.get('/:attachmentId/download', auth, attachmentController.downloadAttachment);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}/attachments/{attachmentId}:
 *   delete:
 *     tags: [Attachments]
 *     summary: Soft-delete an attachment
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:attachmentId', auth, attachmentController.deleteAttachment);

module.exports = router;
