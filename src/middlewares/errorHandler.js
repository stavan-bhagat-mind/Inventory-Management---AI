const HTTP_STATUS = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');
const ApiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || MESSAGES.INTERNAL_ERROR;
  let errors = err.details || null;

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = MESSAGES.VALIDATION_ERROR;
    errors = err.errors.map(e => ({ field: e.path, message: e.message }));
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = HTTP_STATUS.CONFLICT;
    message = 'Duplicate key value violates unique constraint.';
    errors = err.errors.map(e => ({ field: e.path, message: e.message }));
  }

  // Handle Sequelize Database Error (e.g. check constraint violation)
  if (err.name === 'SequelizeDatabaseError') {
    if (err.parent && err.parent.code === '23514') { // Postgres check_violation
      statusCode = HTTP_STATUS.BAD_REQUEST;
      message = MESSAGES.NEGATIVE_STOCK_NOT_ALLOWED;
    }
  }

  // Handle concurrency / lock timeout errors
  if (err.name === 'SequelizeTimeoutError' || (err.parent && err.parent.code === '55P03')) {
    statusCode = HTTP_STATUS.CONFLICT;
    message = MESSAGES.CONCURRENCY_CONFLICT;
  }

  if (process.env.NODE_ENV === 'development' && statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    console.error('[Error Trace]', err);
  }

  return ApiResponse.error(res, {
    statusCode,
    message,
    errors
  });
};

module.exports = errorHandler;
