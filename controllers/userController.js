const User = require('../models/User');
const { errorHandler, successHandler } = require('../utils/responseHandler');

// Lấy tất cả users với pagination và filtering (admin only - protect at route)
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter).skip(skip).limit(limit).select('-password');

    successHandler(res, 200, 'Lấy danh sách users thành công', {
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Lấy một user theo ID (owner or admin)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return errorHandler(res, 404, 'User không tồn tại');
    }
    successHandler(res, 200, 'Lấy user thành công', user);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Tạo user mới (admin only) - expects password
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, address, password, role } = req.body;

    if (!name || !email || !password) {
      return errorHandler(res, 400, 'Tên, email và mật khẩu là bắt buộc');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return errorHandler(res, 400, 'Email này đã được sử dụng');

    const user = new User({ name, email, phone, address, password, role });
    await user.save();

    const created = await User.findById(user._id).select('-password');
    successHandler(res, 201, 'Tạo user thành công', created);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Cập nhật user (owner or admin)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, address, status, role, password } = req.body;

    let user = await User.findById(req.params.id).select('+password');
    if (!user) return errorHandler(res, 404, 'User không tồn tại');

    // If email changed, ensure uniqueness
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return errorHandler(res, 400, 'Email này đã được sử dụng');
    }

    // Only update fields provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (status) user.status = status;
    if (role) user.role = role;
    if (password) user.password = password; // will be hashed by pre-save

    await user.save();

    const updated = await User.findById(user._id).select('-password');
    successHandler(res, 200, 'Cập nhật user thành công', updated);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Xóa user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return errorHandler(res, 404, 'User không tồn tại');
    successHandler(res, 200, 'Xóa user thành công', {});
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};
