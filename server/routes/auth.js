const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { isConnected } = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'agriRoute_dev_secret_change_in_production_2024';

// In-memory user store fallback
const memoryUsers = new Map();

// Helper: generate JWT
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

// ─── POST /api/auth/register ───────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['farmer', 'buyer']).withMessage('Role must be farmer or buyer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, email, password, role = 'farmer', location } = req.body;

    try {
      if (isConnected()) {
        const existing = await User.findOne({ $or: [{ email }, { phone }] });
        if (existing) {
          return res.status(409).json({ message: 'Email or phone already registered' });
        }

        const user = await User.create({
          name,
          phone,
          email,
          password,
          role,
          ...(location && {
            location: {
              type: 'Point',
              coordinates: [location.lng, location.lat],
            },
          }),
        });

        const token = generateToken(user._id, user.role);

        return res.status(201).json({
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
        });
      }

      // Memory fallback
      if (memoryUsers.has(email) || memoryUsers.has(phone)) {
        return res.status(409).json({ message: 'Email or phone already registered' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userId = `user_${Date.now()}`;

      const userData = {
        _id: userId,
        name,
        phone,
        email,
        password: hashedPassword,
        role,
        createdAt: new Date(),
      };

      memoryUsers.set(email, userData);
      memoryUsers.set(userId, userData);

      const token = generateToken(userId, role);
      res.status(201).json({
        token,
        user: { _id: userId, name, email, phone, role },
      });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      if (isConnected()) {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id, user.role);

        return res.json({
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
        });
      }

      // Memory fallback
      const user = memoryUsers.get(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = generateToken(user._id, user.role);
      res.json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      location: req.user.location,
      createdAt: req.user.createdAt,
    },
  });
});

module.exports = router;
