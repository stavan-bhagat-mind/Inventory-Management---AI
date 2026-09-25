const { Op } = require('sequelize');
const { sequelize, Product, ProductVariant, InventoryHistory } = require('../models');
const { INVENTORY_STATUS, INVENTORY_ACTION } = require('../constants/inventory');
const HTTP_STATUS = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');
const AppError = require('../utils/appError');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

class InventoryService {
  /**
   * View, search, and filter inventory with pagination
   */
  async getInventory(filters = {}) {
    const { page, limit, offset } = getPaginationParams(filters);
    const { search, status, lowStock, sortBy = 'createdAt', sortOrder = 'DESC' } = filters;

    const variantWhere = {};
    const productWhere = {};

    if (status) {
      variantWhere.status = status;
    }

    if (lowStock === true || lowStock === 'true') {
      variantWhere[Op.and] = sequelize.literal('"ProductVariant"."available_quantity" <= "ProductVariant"."reorder_level"');
    }

    if (search && search.trim() !== '') {
      const searchPattern = `%${search.trim()}%`;
      variantWhere[Op.or] = [
        { sku: { [Op.iLike]: searchPattern } },
        { '$product.name$': { [Op.iLike]: searchPattern } }
      ];
    }

    const { count, rows } = await ProductVariant.findAndCountAll({
      where: variantWhere,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'description'],
          where: Object.keys(productWhere).length > 0 ? productWhere : undefined,
          required: Boolean(search && search.trim() !== '')
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
      distinct: true
    });

    const meta = buildPaginationMeta(count, page, limit);

    return { variants: rows, meta };
  }

  /**
   * Update stock attributes and quantities with transactional audit history
   */
  async updateStock(variantId, updateData) {
    return await sequelize.transaction(async (t) => {
      const variant = await ProductVariant.findByPk(variantId, {
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!variant) {
        throw new AppError(MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const prevAvailable = variant.availableQuantity;
      const prevReserved = variant.reservedQuantity;

      const newAvailable = updateData.availableQuantity !== undefined
        ? updateData.availableQuantity
        : prevAvailable;

      const newReserved = updateData.reservedQuantity !== undefined
        ? updateData.reservedQuantity
        : prevReserved;

      // Update fields
      if (updateData.availableQuantity !== undefined) variant.availableQuantity = updateData.availableQuantity;
      if (updateData.reservedQuantity !== undefined) variant.reservedQuantity = updateData.reservedQuantity;
      if (updateData.reorderLevel !== undefined) variant.reorderLevel = updateData.reorderLevel;
      if (updateData.price !== undefined) variant.price = updateData.price;
      if (updateData.status !== undefined) {
        variant.status = updateData.status;
      } else if (variant.availableQuantity === 0 && variant.status === INVENTORY_STATUS.ACTIVE) {
        variant.status = INVENTORY_STATUS.OUT_OF_STOCK;
      } else if (variant.availableQuantity > 0 && variant.status === INVENTORY_STATUS.OUT_OF_STOCK) {
        variant.status = INVENTORY_STATUS.ACTIVE;
      }

      await variant.save({ transaction: t });

      const quantityChange = newAvailable - prevAvailable;

      // Record history if available or reserved changed, or explicitly requested
      if (quantityChange !== 0 || newReserved !== prevReserved || updateData.reason) {
        await InventoryHistory.create({
          variantId: variant.id,
          actionType: INVENTORY_ACTION.STOCK_UPDATE,
          quantityChange,
          previousAvailable: prevAvailable,
          newAvailable,
          previousReserved: prevReserved,
          newReserved,
          reason: updateData.reason || 'Manual stock update',
          referenceId: updateData.referenceId || null
        }, { transaction: t });
      }

      return variant;
    });
  }

  /**
   * Reserve inventory atomically with row lock
   */
  async reserveStock(variantId, { quantity, reason, referenceId }) {
    if (!quantity || quantity <= 0) {
      throw new AppError(MESSAGES.INVALID_QUANTITY, HTTP_STATUS.BAD_REQUEST);
    }

    return await sequelize.transaction(async (t) => {
      const variant = await ProductVariant.findByPk(variantId, {
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!variant) {
        throw new AppError(MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      if (variant.status === INVENTORY_STATUS.INACTIVE) {
        throw new AppError('Cannot reserve stock for inactive variant', HTTP_STATUS.BAD_REQUEST);
      }

      if (variant.availableQuantity < quantity) {
        throw new AppError(
          `${MESSAGES.INSUFFICIENT_STOCK}. Available: ${variant.availableQuantity}, Requested: ${quantity}`,
          HTTP_STATUS.CONFLICT,
          { availableQuantity: variant.availableQuantity, requestedQuantity: quantity }
        );
      }

      const prevAvailable = variant.availableQuantity;
      const prevReserved = variant.reservedQuantity;
      const nextAvailable = prevAvailable - quantity;
      const nextReserved = prevReserved + quantity;

      variant.availableQuantity = nextAvailable;
      variant.reservedQuantity = nextReserved;

      if (nextAvailable === 0 && variant.status === INVENTORY_STATUS.ACTIVE) {
        variant.status = INVENTORY_STATUS.OUT_OF_STOCK;
      }

      await variant.save({ transaction: t });

      await InventoryHistory.create({
        variantId: variant.id,
        actionType: INVENTORY_ACTION.RESERVE,
        quantityChange: -quantity,
        previousAvailable: prevAvailable,
        newAvailable: nextAvailable,
        previousReserved: prevReserved,
        newReserved: nextReserved,
        reason: reason || 'Stock reserved',
        referenceId: referenceId || null
      }, { transaction: t });

      return variant;
    });
  }

  /**
   * Release reserved inventory atomically with row lock
   */
  async releaseStock(variantId, { quantity, reason, referenceId }) {
    if (!quantity || quantity <= 0) {
      throw new AppError(MESSAGES.INVALID_QUANTITY, HTTP_STATUS.BAD_REQUEST);
    }

    return await sequelize.transaction(async (t) => {
      const variant = await ProductVariant.findByPk(variantId, {
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!variant) {
        throw new AppError(MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      if (variant.reservedQuantity < quantity) {
        throw new AppError(
          `${MESSAGES.INSUFFICIENT_RESERVED}. Reserved: ${variant.reservedQuantity}, Requested release: ${quantity}`,
          HTTP_STATUS.CONFLICT,
          { reservedQuantity: variant.reservedQuantity, requestedRelease: quantity }
        );
      }

      const prevAvailable = variant.availableQuantity;
      const prevReserved = variant.reservedQuantity;
      const nextAvailable = prevAvailable + quantity;
      const nextReserved = prevReserved - quantity;

      variant.availableQuantity = nextAvailable;
      variant.reservedQuantity = nextReserved;

      if (nextAvailable > 0 && variant.status === INVENTORY_STATUS.OUT_OF_STOCK) {
        variant.status = INVENTORY_STATUS.ACTIVE;
      }

      await variant.save({ transaction: t });

      await InventoryHistory.create({
        variantId: variant.id,
        actionType: INVENTORY_ACTION.RELEASE,
        quantityChange: quantity,
        previousAvailable: prevAvailable,
        newAvailable: nextAvailable,
        previousReserved: prevReserved,
        newReserved: nextReserved,
        reason: reason || 'Stock reservation released',
        referenceId: referenceId || null
      }, { transaction: t });

      return variant;
    });
  }

  /**
   * Get paginated inventory history trail for a variant
   */
  async getHistory(variantId, queryParams = {}) {
    const { page, limit, offset } = getPaginationParams(queryParams);
    const { actionType } = queryParams;

    const variant = await ProductVariant.findByPk(variantId, {
      attributes: ['id', 'sku', 'availableQuantity', 'reservedQuantity', 'status']
    });

    if (!variant) {
      throw new AppError(MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const whereClause = { variantId };
    if (actionType) {
      whereClause.actionType = actionType;
    }

    const { count, rows } = await InventoryHistory.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    const meta = buildPaginationMeta(count, page, limit);

    return { variant, histories: rows, meta };
  }
}

module.exports = new InventoryService();
