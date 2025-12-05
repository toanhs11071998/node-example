// Hàm xử lý response thành công
const successHandler = (res, statusCode, message, data) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Hàm xử lý response lỗi
const errorHandler = (res, statusCode, message) => {
  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

module.exports = {
  successHandler,
  errorHandler,
};
