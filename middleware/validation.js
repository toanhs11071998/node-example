// Middleware kiểm tra request body không trống
const validateRequest = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Request body không được trống',
      data: null,
    });
  }
  next();
};

// Middleware kiểm tra ID format
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'ID không hợp lệ',
      data: null,
    });
  }
  next();
};

module.exports = {
  validateRequest,
  validateObjectId,
};
