const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verifies JWT from Authorization header.
 * Attaches decoded user to req.user on success.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized — no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user (without password) to request
    req.user = await User.findById(decoded.userId).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized — user not found' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized — invalid token' });
  }
};

/**
 * Role guard middleware factory.
 * Usage: requireRole('buyer') or requireRole('farmer', 'buyer')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `Access denied — requires role: ${roles.join(' or ')}` });
    }
    next();
  };
};

module.exports = { protect, requireRole };
