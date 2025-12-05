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

// List attachments for a task
router.get('/', auth, attachmentController.listAttachments);

// Get specific attachment
router.get('/:attachmentId', auth, attachmentController.getAttachment);

// Upload attachment
router.post('/', auth, upload.single('file'), attachmentController.uploadAttachment);

// Download attachment
router.get('/:attachmentId/download', auth, attachmentController.downloadAttachment);

// Delete attachment (soft delete)
router.delete('/:attachmentId', auth, attachmentController.deleteAttachment);

module.exports = router;
