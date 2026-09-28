const inventoryService = require('../services/inventory.service');
const ApiResponse = require('../utils/apiResponse');
const HTTP_STATUS = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');
const { getPagination } = require('../utils/pagination');

const getInventory = async (req, res, next) => {
  try {
    const pagination = getPagination(req.query);
    const filters = {
      search: req.query.search,
      status: req.query.status,
      low_stock: req.query.low_stock,
      sort_by: req.query.sort_by,
      sort_order: req.query.sort_order
    };

    const { variants, meta } = await inventoryService.getInventory(filters, pagination);

    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: MESSAGES.INVENTORY_FETCHED,
      data: variants,
      meta
    });
  } catch (error) {
    next(error);
  }
};

const updateStock = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const updatedVariant = await inventoryService.updateStock(variantId, req.body);

    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: MESSAGES.INVENTORY_UPDATED,
      data: updatedVariant
    });
  } catch (error) {
    next(error);
  }
};

const reserveStock = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const result = await inventoryService.reserveStock(variantId, req.body);

    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: MESSAGES.STOCK_RESERVED,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const releaseStock = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const result = await inventoryService.releaseStock(variantId, req.body);

    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: MESSAGES.STOCK_RELEASED,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryHistory = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const pagination = getPagination(req.query);
    const filters = {
      action_type: req.query.action_type
    };

    const result = await inventoryService.getInventoryHistory(variantId, filters, pagination);

    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: MESSAGES.HISTORY_FETCHED,
      data: result.history,
      meta: {
        variant: result.variant,
        ...result.meta
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  updateStock,
  reserveStock,
  releaseStock,
  getInventoryHistory
};
