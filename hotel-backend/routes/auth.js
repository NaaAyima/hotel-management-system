const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// In-memory user database (can be replaced with MongoDB/PostgreSQL later)
const users = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$YourHashedPasswordHere', // Will be hashed on first run
    role: 'Admin',
    name: 'Administrator',
    email: 'admin@jjoj.com'
  },
  {
    id: 2,
    username: 'receptionist',
    password: '$2a$10$YourHashedPasswordHere',
    role: 'Receptionist',
    name: 'Sarah Mensah',
    email: 'receptionist@jjoj.com'
  },
  {
    id: 3,
    username: 'manager',
    password: '$2a$10$YourHashedPasswordHere',
    role: 'Manager',
    name: 'John Osei',
    email: 'manager@jjoj.com'
  }
];

// Initialize passwords (hash them on first run)
(async () => {
  const passwords = {
    'admin': 'admin123',
    'receptionist': 'recep123',
    'manager': 'manager123'
  };

  for (let user of users) {
    if (user.password === '$2a$10$YourHashedPasswordHere') {
      user.password = await bcrypt.hash(passwords[user.username], 10);
    }
  }
})();

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email
      },
      process.env.JWT_SECRET || 'temporary_default_secret_for_hotel_management',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Return user data and token
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          email: user.email
        },
        token,
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// POST /api/auth/logout - Logout user (client-side token removal)
router.post('/logout', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// GET /api/auth/verify - Verify token and return user info
router.get('/verify', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

// GET /api/auth/me - Get current user details
router.get('/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email
    }
  });
});

module.exports = router;
