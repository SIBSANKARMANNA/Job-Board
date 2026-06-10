const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');
const logger = require('../utils/Logger');

// JWT helper
const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// const createSendToken =  (
//   user,
//   statusCode,
//   res,
//   message
// ) => {
//   const token =
//   signToken(user._id);

//   sendSuccess(
//   res,
//   statusCode,
//   message,
//   {
//     user,
//     token
//   }
//   );
// };
const createSendToken = (
  user,
  statusCode,
  res,
  message
) => {

  console.log("TOKEN STEP 1");

  const token = signToken(user._id);

  console.log("TOKEN STEP 2");

  return sendSuccess(
    res,
    statusCode,
    message,
    {
      user,
      token
    }
  );
};


/**
 * POST /api/v1/auth/register
 */
exports.register = async (
  req,
  res,
  next
) => {
  try {

    const {
      name,
      email,
      password,
      role,
      companyName,
      bio,
      skills,
    } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      role,
      companyName,
      bio,
      skills,
    });

    console.log('secret', process.env.JWT_SECRET);

   logger.info(`New user registered: ${email}`);

    console.log("AFTER LOGGER");

    createSendToken(
      user,
      201,
      res,
      'Registration successful'
    );

    console.log("AFTER TOKEN");

  } catch (err) {
    console.log(err);
    next(err);
  }
};

/**
 * POST /api/v1/auth/login
 */
exports.login = async (
  req,
  res,
  next
) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({
      email,
    }).select('+password');

    if (
      !user ||
      !(await user.comparePassword(password))
    ) {
      return next(
        new AppError(
          'Invalid email or password',
          401
        )
      );
    }

    if (!user.isActive) {
      return next(
        new AppError(
          'Your account has been deactivated',
          403
        )
      );
    }

    logger.info(
      `User logged in: ${email}`
    );

    await createSendToken(
      user,
      200,
      res,
      'Login successful'
    );

  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/auth/me
 */
exports.getMe = async (
  req,
  res,
  next
) => {
  try {

    const user = await User.findById(
      req.user._id
    );

    sendSuccess(
      res,
      200,
      'Profile fetched',
      { user }
    );

  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/auth/me
 */
exports.updateMe = async (
  req,
  res,
  next
) => {
  try {

    const {
      password,
      role,
      ...allowedUpdates
    } = req.body;

    const user =
      await User.findByIdAndUpdate(
        req.user._id,
        allowedUpdates,
        {
          new: true,
          runValidators: true,
        }
      );

    sendSuccess(
      res,
      200,
      'Profile updated',
      { user }
    );

  } catch (err) {
    next(err);
  }
};