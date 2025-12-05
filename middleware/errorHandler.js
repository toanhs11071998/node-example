// Middleware xử lý error tổng quát
const { logger } = require('../config/logger');

// Middleware xử lý error tổng quát
const errorMiddleware = (err, req, res, next) => {
  logger.error(err.stack || err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi server';

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

module.exports = errorMiddleware;
