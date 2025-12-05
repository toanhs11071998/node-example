const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successHandler, errorHandler } = require('../utils/responseHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return errorHandler(res, 400, 'Name, email and password are required');
    }

    const existing = await User.findOne({ email }).select('+password');
    if (existing) return errorHandler(res, 400, 'Email already in use');

    const user = new User({ name, email, password, phone, address });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    successHandler(res, 201, 'User registered', { user, token });
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return errorHandler(res, 400, 'Email and password are required');

    const user = await User.findOne({ email }).select('+password');
    if (!user) return errorHandler(res, 401, 'Invalid credentials');

    const match = await user.comparePassword(password);
    if (!match) return errorHandler(res, 401, 'Invalid credentials');

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Remove password before sending
    user.password = undefined;

    successHandler(res, 200, 'Login successful', { user, token });
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Get current user
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorHandler(res, 404, 'User not found');
    successHandler(res, 200, 'Current user', user);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};
