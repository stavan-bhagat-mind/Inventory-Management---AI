const HTTP_STATUS = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');
const ApiResponse = require('../utils/apiResponse');

const notFound = (req, res) => {
  return ApiResponse.error(res, {
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: `${MESSAGES.RESOURCE_NOT_FOUND}: ${req.method} ${req.originalUrl}`
  });
};

module.exports = notFound;
