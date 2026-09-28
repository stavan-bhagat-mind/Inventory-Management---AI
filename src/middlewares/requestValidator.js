const HTTP_STATUS = require('../constants/httpStatus');
const ApiResponse = require('../utils/apiResponse');
const MESSAGES = require('../constants/messages');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    if (!schema) return next();

    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, '')
      }));

      return ApiResponse.error(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: MESSAGES.VALIDATION_ERROR,
        errors: details
      });
    }

    req[source] = value;
    next();
  };
};

module.exports = validate;
