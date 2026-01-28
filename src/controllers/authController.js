const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendSuccess, sendCreated, sendBadRequest, sendUnauthorized } = require('../utils/responseHandler');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendBadRequest(res, 'User already exists with this email');
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user.id);

    return sendCreated(res, {
      user: user.toJSON(),
      token,
    }, 'User registered successfully');
  } catch (error) {
    console.error('Register error:', error);
    return sendBadRequest(res, error.message);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return sendUnauthorized(res, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendUnauthorized(res, 'Invalid email or password');
    }

    const token = generateToken(user.id);

    return sendSuccess(res, {
      user: user.toJSON(),
      token,
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return sendBadRequest(res, error.message);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    return sendSuccess(res, { user: req.user.toJSON() }, 'User fetched successfully');
  } catch (error) {
    console.error('GetMe error:', error);
    return sendBadRequest(res, error.message);
  }
};

module.exports = { register, login, getMe };