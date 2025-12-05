// constants/messages.js - Thông báo lỗi và thành công
const MESSAGES = {
  // Success
  SUCCESS_CREATE: 'Tạo thành công',
  SUCCESS_UPDATE: 'Cập nhật thành công',
  SUCCESS_DELETE: 'Xóa thành công',
  SUCCESS_FETCH: 'Lấy dữ liệu thành công',

  // Error - Validation
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  MISSING_REQUIRED_FIELD: 'Trường bắt buộc không được trống',
  INVALID_EMAIL: 'Email không hợp lệ',
  INVALID_ID: 'ID không hợp lệ',

  // Error - Not Found
  NOT_FOUND: 'Không tìm thấy',
  USER_NOT_FOUND: 'User không tồn tại',

  // Error - Conflict
  ALREADY_EXISTS: 'Đã tồn tại',
  EMAIL_ALREADY_EXISTS: 'Email đã được sử dụng',

  // Error - Server
  SERVER_ERROR: 'Lỗi server',
  DATABASE_ERROR: 'Lỗi cơ sở dữ liệu',
};

module.exports = MESSAGES;
