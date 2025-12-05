const User = require('../models/User');
const { errorHandler, successHandler } = require('../utils/responseHandler');

// Lấy tất cả users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    successHandler(res, 200, 'Lấy danh sách users thành công', users);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Lấy một user theo ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorHandler(res, 404, 'User không tồn tại');
    }
    successHandler(res, 200, 'Lấy user thành công', user);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Tạo user mới
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    // Validation
    if (!name || !email) {
      return errorHandler(res, 400, 'Tên và email là bắt buộc');
    }

    // Kiểm tra email tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorHandler(res, 400, 'Email này đã được sử dụng');
    }

    const user = new User({
      name,
      email,
      phone,
      address,
    });

    await user.save();
    successHandler(res, 201, 'Tạo user thành công', user);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Cập nhật user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, address, status } = req.body;

    let user = await User.findById(req.params.id);
    if (!user) {
      return errorHandler(res, 404, 'User không tồn tại');
    }

    // Kiểm tra email nếu thay đổi
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return errorHandler(res, 400, 'Email này đã được sử dụng');
      }
    }

    user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address, status },
      { new: true, runValidators: true }
    );

    successHandler(res, 200, 'Cập nhật user thành công', user);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Xóa user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return errorHandler(res, 404, 'User không tồn tại');
    }
    successHandler(res, 200, 'Xóa user thành công', {});
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};
