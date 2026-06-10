const logger = require('../utils/Logger');




module.exports =
(err, req, res, next) => {

  logger.error(err.message);


if (err.code === 11000) {
  const field = Object.keys(err.keyValue)[0];

  return res.status(409).json({
    success: false,
    message: `${field} already exists`
  });
}


  res.status(
    err.statusCode || 500
  ).json({
    success:false,
    message:
      err.message ||
      'Server Error'
  });

};