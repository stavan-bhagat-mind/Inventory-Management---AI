const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');

const notFound = (req, _res, next) => {
  next(new AppError(`${MESSAGES.ROUTE_NOT_FOUND}: ${req.method} ${req.originalUrl}`, HTTP_STATUS.NOT_FOUND));
};

module.exports = notFound;
