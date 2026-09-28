const HTTP_STATUS = require('../constants/httpStatus');

const success = (res, { statusCode = HTTP_STATUS.OK, message = 'Success', data = null, meta = null }) => {
  const response = {
    success: true,
    statusCode,
    message,
    data
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const error = (res, { statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, message = 'An error occurred', errors = null }) => {
  const response = {
    success: false,
    statusCode,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  success,
  error
};
