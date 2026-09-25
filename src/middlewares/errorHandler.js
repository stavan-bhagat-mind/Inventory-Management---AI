const ApiResponse = require('../utils/apiResponse');
const HTTP_STATUS = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');
const env = require('../config/env');

const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || MESSAGES.INTERNAL_SERVER_ERROR;
  let details = err.details || null;

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = MESSAGES.VALIDATION_ERROR;
    details = err.errors.map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = HTTP_STATUS.CONFLICT;
    message = 'Resource with provided unique identifier already exists';
    details = err.errors.map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  // Handle Postgres check constraint violation (e.g. negative stock)
  if (err.name === 'SequelizeDatabaseError' && err.parent && err.parent.code === '23514') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Database constraint violation: quantity or price cannot be negative';
  }

  // Handle invalid JSON body in incoming request
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Malformed JSON payload in request body';
  }

  if (env.NODE_ENV === 'development' && statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    console.error('[UNHANDLED ERROR]', err);
  }

  return ApiResponse.error(res, statusCode, message, details);
};

module.exports = errorHandler;
