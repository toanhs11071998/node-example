const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    // Check blacklist
    const black = await TokenBlacklist.findOne({ token });
    if (black) return res.status(401).json({ success: false, message: 'Token revoked' });

    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user info
    req.user = { id: decoded.id, role: decoded.role };

    // Optionally populate full user
    // req.userDoc = await User.findById(decoded.id);

    next();
  } catch (err) {
    console.error('Auth error', err);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
