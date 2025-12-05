const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const TokenBlacklist = require('../models/TokenBlacklist');
const { sendVerificationEmail } = require('../utils/email');
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

    // Create verification token
    const verificationToken = crypto.randomBytes(24).toString('hex');
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h

    const user = new User({ name, email, password, phone, address, verificationToken, verificationExpires });
    await user.save();

    // Try sending verification email if SMTP configured; otherwise return token for testing
    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailErr) {
      console.warn('Failed to send verification email:', emailErr.message || emailErr);
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    successHandler(res, 201, 'User registered (verify email)', { user, token, verificationToken });
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return errorHandler(res, 400, 'Email and password are required');
    const user = await User.findOne({ email }).select('+password failedLoginAttempts lockUntil isVerified');
    if (!user) return errorHandler(res, 401, 'Invalid credentials');

    // Check if account locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return errorHandler(res, 423, 'Account locked due to too many failed login attempts');
    }

    const match = await user.comparePassword(password);
    if (!match) {
      // increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        // lock account for 1 hour
        user.lockUntil = Date.now() + 60 * 60 * 1000;
        user.failedLoginAttempts = 0; // reset counter after locking
      }
      await user.save();
      return errorHandler(res, 401, 'Invalid credentials');
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // Require email verification
    if (!user.isVerified) return errorHandler(res, 403, 'Please verify your email before logging in');

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    // Remove password before sending
    user.password = undefined;

    successHandler(res, 200, 'Login successful', { user, token });
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Logout - revoke token
exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return errorHandler(res, 400, 'No token provided');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return errorHandler(res, 400, 'Invalid token');

    const expiresAt = new Date(decoded.exp * 1000);
    await TokenBlacklist.create({ token, expiresAt });
    successHandler(res, 200, 'Logged out');
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Verify email
exports.verify = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return errorHandler(res, 400, 'Missing token');

    const user = await User.findOne({ verificationToken: token, verificationExpires: { $gt: Date.now() } });
    if (!user) return errorHandler(res, 400, 'Invalid or expired verification token');

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    successHandler(res, 200, 'Email verified');
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Resend verification
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return errorHandler(res, 400, 'Email required');

    const user = await User.findOne({ email });
    if (!user) return errorHandler(res, 404, 'User not found');
    if (user.isVerified) return errorHandler(res, 400, 'User already verified');

    const verificationToken = crypto.randomBytes(24).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailErr) {
      console.warn('Failed to send verification email:', emailErr.message || emailErr);
    }

    successHandler(res, 200, 'Verification email resent', { verificationToken });
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
