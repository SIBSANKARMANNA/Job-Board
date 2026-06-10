const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const logger = require('../utils/Logger');

/**
 * Protect routes
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    console.log('in protect middleware');
    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError(
          'You are not logged in. Please log in to access this resource.',
          401
        )
      );
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Check user exists
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(
        new AppError(
          'User associated with this token no longer exists.',
          401
        )
      );
    }

    // Check account status
    if (!currentUser.isActive) {
      return next(
        new AppError(
          'Your account has been deactivated.',
          403
        )
      );
    }

    // Attach user to request
    req.user = currentUser;

    next();

  } catch (err) {

    logger.error(err.message);

    if (err.name === 'TokenExpiredError') {
      return next(
        new AppError(
          'Token expired. Please log in again.',
          401
        )
      );
    }

    if (err.name === 'JsonWebTokenError') {
      return next(
        new AppError(
          'Invalid token. Please log in again.',
          401
        )
      );
    }

    next(err);
  }
};

/**
 * Role-based authorization
 */
exports.restrictTo = (...roles) => {
  console.log('in role middleware ');
  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action.',
          403
        )
      );
    }

    next();
  };
};