const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// POST /api/auth/signup - Register a new user
router.post('/signup', async (req, res) => {
  try {
    const { username, password, email, name, role } = req.body;

    if (!username || !password || !email || !name) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the persistent user
    const newUser = await User.create({
      username,
      password: hashedPassword,
      email,
      name,
      role: role || 'Receptionist'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

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

    // Find persistent user in database
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Check password securely
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

// GET /api/auth/me - Get current user details from Database
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in system'
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
  } catch (error) {
    console.error('Fetch user error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user context' });
  }
});

module.exports = router;
