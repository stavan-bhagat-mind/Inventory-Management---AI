const { Op } = require('sequelize');
const { sequelize, ProductVariant, Product, InventoryHistory } = require('../models');
const createAppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');
const {
  ACTION_TYPES,
  VARIANT_STATUS,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER
} = require('../constants/inventory');
const { getPaginationMeta } = require('../utils/pagination');

/**
 * List, search, filter and paginate inventory items
 */
const getInventory = async (filters = {}, pagination = {}) => {
  const {
    search,
    status,
    low_stock,
    sort_by = DEFAULT_SORT_BY,
    sort_order = DEFAULT_SORT_ORDER
  } = filters;
  const { limit, offset, page } = pagination;

  const variantWhere = {};
  const productWhere = {};

  if (status) {
    variantWhere.status = status;
  }

  if (low_stock === true || low_stock === 'true') {
    variantWhere[Op.and] = [
      sequelize.where(
        sequelize.col('ProductVariant.available_quantity'),
        '<=',
        sequelize.col('ProductVariant.reorder_level')
      )
    ];
  }

  if (search && search.trim() !== '') {
    const searchTerm = `%${search.trim()}%`;
    variantWhere[Op.or] = [
      { sku: { [Op.iLike]: searchTerm } },
      { '$product.name$': { [Op.iLike]: searchTerm } }
    ];
  }

  const { count, rows } = await ProductVariant.findAndCountAll({
    where: variantWhere,
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'description'],
        where: productWhere,
        required: false
      }
    ],
    limit,
    offset,
    order: [[sort_by, sort_order.toUpperCase()]],
    distinct: true
  });

  const meta = getPaginationMeta(count, page, limit);

  return { variants: rows, meta };
};

/**
 * Update stock quantities and variant metadata
 */
const updateStock = async (variantId, updateData) => {
  const { available_quantity, price, reorder_level, status, reason, reference_id } = updateData;

  return await sequelize.transaction(async (t) => {
    const variant = await ProductVariant.findByPk(variantId, {
      lock: t.LOCK.UPDATE,
      transaction: t
    });

    if (!variant) {
      throw createAppError(MESSAGES.VARIANT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const updates = {};
    let historyRecord = null;

    if (available_quantity !== undefined) {
      if (available_quantity < 0) {
        throw createAppError(MESSAGES.NEGATIVE_STOCK_NOT_ALLOWED, HTTP_STATUS.BAD_REQUEST);
      }

      const prevAvailable = variant.availableQuantity;
      const newAvailable = available_quantity;
      const quantityChange = newAvailable - prevAvailable;

      updates.availableQuantity = newAvailable;

      if (newAvailable === 0 && !status) {
        updates.status = VARIANT_STATUS.OUT_OF_STOCK;
      } else if (newAvailable > 0 && variant.status === VARIANT_STATUS.OUT_OF_STOCK && !status) {
        updates.status = VARIANT_STATUS.ACTIVE;
      }

      historyRecord = {
        variantId: variant.id,
        actionType: ACTION_TYPES.STOCK_UPDATE,
        quantityChange,
        previousAvailable: prevAvailable,
        newAvailable,
        previousReserved: variant.reservedQuantity,
        newReserved: variant.reservedQuantity,
        reason: reason || 'Manual stock update',
        referenceId: reference_id || null
      };
    }

    if (price !== undefined) updates.price = price;
    if (reorder_level !== undefined) updates.reorderLevel = reorder_level;
    if (status !== undefined) updates.status = status;

    await variant.update(updates, { transaction: t });

    if (historyRecord) {
      await InventoryHistory.create(historyRecord, { transaction: t });
    }

    return variant;
  });
};

/**
 * Reserve available stock with strict pessimistic locking
 */
const reserveStock = async (variantId, { quantity, reason, reference_id }) => {
  if (!quantity || quantity <= 0) {
    throw createAppError(MESSAGES.INVALID_QUANTITY, HTTP_STATUS.BAD_REQUEST);
  }

  return await sequelize.transaction(async (t) => {
    const variant = await ProductVariant.findByPk(variantId, {
      lock: t.LOCK.UPDATE,
      transaction: t
    });

    if (!variant) {
      throw createAppError(MESSAGES.VARIANT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (variant.status === VARIANT_STATUS.INACTIVE || variant.status === VARIANT_STATUS.DISCONTINUED) {
      throw createAppError(`Cannot reserve stock for ${variant.status.toLowerCase()} variant.`, HTTP_STATUS.BAD_REQUEST);
    }

    if (variant.availableQuantity < quantity) {
      throw createAppError(MESSAGES.INSUFFICIENT_STOCK, HTTP_STATUS.BAD_REQUEST, {
        available: variant.availableQuantity,
        requested: quantity
      });
    }

    const prevAvailable = variant.availableQuantity;
    const prevReserved = variant.reservedQuantity;
    const newAvailable = prevAvailable - quantity;
    const newReserved = prevReserved + quantity;

    const updates = {
      availableQuantity: newAvailable,
      reservedQuantity: newReserved
    };

    if (newAvailable === 0 && variant.status === VARIANT_STATUS.ACTIVE) {
      updates.status = VARIANT_STATUS.OUT_OF_STOCK;
    }

    await variant.update(updates, { transaction: t });

    await InventoryHistory.create(
      {
        variantId: variant.id,
        actionType: ACTION_TYPES.RESERVE,
        quantityChange: -quantity,
        previousAvailable: prevAvailable,
        newAvailable,
        previousReserved: prevReserved,
        newReserved,
        reason: reason || 'Stock reserved',
        referenceId: reference_id || null
      },
      { transaction: t }
    );

    return variant;
  });
};

/**
 * Release reserved stock back into available inventory
 */
const releaseStock = async (variantId, { quantity, reason, reference_id }) => {
  if (!quantity || quantity <= 0) {
    throw createAppError(MESSAGES.INVALID_QUANTITY, HTTP_STATUS.BAD_REQUEST);
  }

  return await sequelize.transaction(async (t) => {
    const variant = await ProductVariant.findByPk(variantId, {
      lock: t.LOCK.UPDATE,
      transaction: t
    });

    if (!variant) {
      throw createAppError(MESSAGES.VARIANT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (variant.reservedQuantity < quantity) {
      throw createAppError(MESSAGES.INSUFFICIENT_RESERVED_STOCK, HTTP_STATUS.BAD_REQUEST, {
        reserved: variant.reservedQuantity,
        requested: quantity
      });
    }

    const prevAvailable = variant.availableQuantity;
    const prevReserved = variant.reservedQuantity;
    const newAvailable = prevAvailable + quantity;
    const newReserved = prevReserved - quantity;

    const updates = {
      availableQuantity: newAvailable,
      reservedQuantity: newReserved
    };

    if (variant.status === VARIANT_STATUS.OUT_OF_STOCK && newAvailable > 0) {
      updates.status = VARIANT_STATUS.ACTIVE;
    }

    await variant.update(updates, { transaction: t });

    await InventoryHistory.create(
      {
        variantId: variant.id,
        actionType: ACTION_TYPES.RELEASE,
        quantityChange: quantity,
        previousAvailable: prevAvailable,
        newAvailable,
        previousReserved: prevReserved,
        newReserved,
        reason: reason || 'Reserved stock released',
        referenceId: reference_id || null
      },
      { transaction: t }
    );

    return variant;
  });
};

/**
 * Get audit history log for a variant
 */
const getInventoryHistory = async (variantId, filters = {}, pagination = {}) => {
  const { action_type } = filters;
  const { limit, offset, page } = pagination;

  const variant = await ProductVariant.findByPk(variantId, {
    attributes: ['id', 'sku']
  });

  if (!variant) {
    throw createAppError(MESSAGES.VARIANT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const where = { variantId };
  if (action_type) {
    where.actionType = action_type;
  }

  const { count, rows } = await InventoryHistory.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });

  const meta = getPaginationMeta(count, page, limit);

  return { variant, history: rows, meta };
};

module.exports = {
  getInventory,
  updateStock,
  reserveStock,
  releaseStock,
  getInventoryHistory
};
