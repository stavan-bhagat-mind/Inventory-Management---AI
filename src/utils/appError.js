const createAppError = (message, statusCode = 400, details = null) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
  err.isOperational = true;
  err.details = details;

  Error.captureStackTrace(err, createAppError);
  return err;
};

module.exports = createAppError;
