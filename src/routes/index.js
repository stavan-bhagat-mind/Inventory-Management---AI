const express = require('express');
const inventoryRoutes = require('./inventory.routes');
const { sequelize } = require('../models');

const router = express.Router();

// Health check endpoint
router.get('/health', async (_req, res) => {
  try {
    await sequelize.authenticate();
    return res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      database: 'CONNECTED'
    });
  } catch (error) {
    return res.status(503).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      database: 'DISCONNECTED',
      error: error.message
    });
  }
});

// Inventory routes
router.use('/inventory', inventoryRoutes);

module.exports = router;
