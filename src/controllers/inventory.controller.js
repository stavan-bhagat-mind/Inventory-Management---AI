const inventoryService = require('../services/inventory.service');
const ApiResponse = require('../utils/apiResponse');
const HTTP_STATUS = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');

class InventoryController {
  async getInventory(req, res, next) {
    try {
      const { variants, meta } = await inventoryService.getInventory(req.query);
      return ApiResponse.success(res, HTTP_STATUS.OK, MESSAGES.INVENTORY_FETCHED, variants, meta);
    } catch (error) {
      next(error);
    }
  }

  async updateStock(req, res, next) {
    try {
      const variant = await inventoryService.updateStock(req.params.variantId, req.body);
      return ApiResponse.success(res, HTTP_STATUS.OK, MESSAGES.STOCK_UPDATED, variant);
    } catch (error) {
      next(error);
    }
  }

  async reserveStock(req, res, next) {
    try {
      const variant = await inventoryService.reserveStock(req.params.variantId, req.body);
      return ApiResponse.success(res, HTTP_STATUS.OK, MESSAGES.STOCK_RESERVED, variant);
    } catch (error) {
      next(error);
    }
  }

  async releaseStock(req, res, next) {
    try {
      const variant = await inventoryService.releaseStock(req.params.variantId, req.body);
      return ApiResponse.success(res, HTTP_STATUS.OK, MESSAGES.STOCK_RELEASED, variant);
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const { variant, histories, meta } = await inventoryService.getHistory(req.params.variantId, req.query);
      return ApiResponse.success(res, HTTP_STATUS.OK, MESSAGES.HISTORY_FETCHED, { variant, histories }, meta);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InventoryController();
