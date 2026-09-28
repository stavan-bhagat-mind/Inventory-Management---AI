const express = require('express');
const router = express.Router();
const inventoryRoutes = require('./inventory.routes');
const ApiResponse = require('../utils/apiResponse');
const HTTP_STATUS = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');

router.get('/health', (_req, res) => {
  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.OK,
    message: MESSAGES.HEALTH_OK,
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

router.use('/inventory', inventoryRoutes);

module.exports = router;
