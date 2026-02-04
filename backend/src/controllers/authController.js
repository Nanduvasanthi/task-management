const User = require('../models/User');
const jwt = require('jsonwebtoken');
const constants = require('../config/constants');
const ApiResponse = require('../utils/apiResponse');
const { validateEmail, validatePassword } = require('../utils/validators');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, constants.JWT_SECRET, {
    expiresIn: constants.JWT_EXPIRE
  });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json(ApiResponse.error('Please provide all fields'));
    }

    if (!validateEmail(email)) {
      return res.status(400).json(ApiResponse.error('Please enter a valid email'));
    }

    if (!validatePassword(password)) {
      return res.status(400).json(ApiResponse.error('Password must be at least 6 characters'));
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json(ApiResponse.error('User already exists'));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json(ApiResponse.success('User registered successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }));
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json(ApiResponse.error('Server error'));
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
// backend/controllers/authController.js
// Update the login function:

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json(ApiResponse.error('Please provide email and password'));
    }

    // Check for user
    const user = await User.findOne({ email });
    
    if (!user) {
      // User doesn't exist - suggest registration
      return res.status(404).json(ApiResponse.error('Account not found. Please register first.', {
        suggestion: 'register'
      }));
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      // Wrong password
      return res.status(401).json(ApiResponse.error('Incorrect password. Please try again.', {
        suggestion: 'try_again'
      }));
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json(ApiResponse.success('Login successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }));
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(ApiResponse.error('Server error'));
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json(ApiResponse.error('User not found'));
    }

    res.status(200).json(ApiResponse.success('User retrieved successfully', {
      user
    }));
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json(ApiResponse.error('Server error'));
  }
};

module.exports = {
  register,
  login,
  getMe
};
