const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const validate = require('../middlewares/requestValidator');
const {
  variantIdParamSchema,
  listInventoryQuerySchema,
  updateStockSchema,
  reserveStockSchema,
  releaseStockSchema,
  getHistoryQuerySchema
} = require('../validations/inventory.validation');

// GET /api/inventory - View, search, filter, paginate inventory
router.get(
  '/',
  validate(listInventoryQuerySchema, 'query'),
  inventoryController.getInventory
);

// PATCH /api/inventory/:variantId - Update stock, price, status, reorder level
router.patch(
  '/:variantId',
  validate(variantIdParamSchema, 'params'),
  validate(updateStockSchema, 'body'),
  inventoryController.updateStock
);

// POST /api/inventory/:variantId/reserve - Reserve stock
router.post(
  '/:variantId/reserve',
  validate(variantIdParamSchema, 'params'),
  validate(reserveStockSchema, 'body'),
  inventoryController.reserveStock
);

// POST /api/inventory/:variantId/release - Release reserved stock
router.post(
  '/:variantId/release',
  validate(variantIdParamSchema, 'params'),
  validate(releaseStockSchema, 'body'),
  inventoryController.releaseStock
);

// GET /api/inventory/:variantId/history - View stock history
router.get(
  '/:variantId/history',
  validate(variantIdParamSchema, 'params'),
  validate(getHistoryQuerySchema, 'query'),
  inventoryController.getInventoryHistory
);

module.exports = router;
