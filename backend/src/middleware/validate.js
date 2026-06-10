const AppError = require('../utils/AppError');

const validate = (schema, source = 'body') => {

  return (req, res, next) => {

    const { error, value } =
      schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });
    console.log(error);
    if (error) {
      return next(
        new AppError(
          error.details[0].message,
          422
        )
      );
    }

    req[source] = value;

    next();
  };

};

module.exports = { validate };