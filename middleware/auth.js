const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token provided, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // --- ✅ THE FIX IS HERE ---
    // The JWT payload uses 'id', not 'userId'
    const user = await User.findById(decoded.id).populate('profile');

    if (!user || !user.isActive) {
      // Use a more generic message for security
      return res.status(401).json({ message: 'Authentication failed' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check user role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

// Generate JWT token (This was already correct, but included for completeness)
const generateToken = (userId, userRole) => {
  return jwt.sign({ id: userId, role: userRole }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

module.exports = {
  auth,
  authorize,
  generateToken
};