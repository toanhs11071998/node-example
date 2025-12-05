// Middleware xử lý error tổng quát
const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi server';

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

module.exports = errorMiddleware;
