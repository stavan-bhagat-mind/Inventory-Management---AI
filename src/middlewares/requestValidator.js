const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatus');

const validate = (schema, source = 'body') => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, '')
      }));

      return next(new AppError('Validation error', HTTP_STATUS.BAD_REQUEST, details));
    }

    req[source] = value;
    return next();
  };
};

module.exports = validate;
