const express = require('express');
const inventoryController = require('../controllers/inventory.controller');
const validate = require('../middlewares/requestValidator');
const {
  getInventorySchema,
  variantIdParamSchema,
  updateStockSchema,
  reserveStockSchema,
  releaseStockSchema,
  getHistorySchema
} = require('../validations/inventory.validation');

const router = express.Router();

router.get(
  '/',
  validate(getInventorySchema, 'query'),
  inventoryController.getInventory
);

router.patch(
  '/:variantId',
  validate(variantIdParamSchema, 'params'),
  validate(updateStockSchema, 'body'),
  inventoryController.updateStock
);

router.post(
  '/:variantId/reserve',
  validate(variantIdParamSchema, 'params'),
  validate(reserveStockSchema, 'body'),
  inventoryController.reserveStock
);

router.post(
  '/:variantId/release',
  validate(variantIdParamSchema, 'params'),
  validate(releaseStockSchema, 'body'),
  inventoryController.releaseStock
);

router.get(
  '/:variantId/history',
  validate(variantIdParamSchema, 'params'),
  validate(getHistorySchema, 'query'),
  inventoryController.getHistory
);

module.exports = router;
