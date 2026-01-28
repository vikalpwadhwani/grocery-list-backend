const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendUnauthorized } = require('../utils/responseHandler');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendUnauthorized(res, 'Not authorized, no token');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return sendUnauthorized(res, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    return sendUnauthorized(res, 'Not authorized, token failed');
  }
};

module.exports = { protect };