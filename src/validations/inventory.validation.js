const Joi = require('joi');
const { INVENTORY_STATUS, INVENTORY_ACTION } = require('../constants/inventory');

const variantIdParamSchema = Joi.object({
  variantId: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'Variant ID must be a valid UUIDv4',
    'any.required': 'Variant ID is required'
  })
});

const getInventorySchema = Joi.object({
  search: Joi.string().trim().max(100).optional().allow(''),
  status: Joi.string().valid(...Object.values(INVENTORY_STATUS)).optional(),
  lowStock: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('sku', 'price', 'availableQuantity', 'reservedQuantity', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('DESC')
});

const updateStockSchema = Joi.object({
  availableQuantity: Joi.number().integer().min(0).optional(),
  reservedQuantity: Joi.number().integer().min(0).optional(),
  reorderLevel: Joi.number().integer().min(0).optional(),
  price: Joi.number().precision(2).min(0).optional(),
  status: Joi.string().valid(...Object.values(INVENTORY_STATUS)).optional(),
  reason: Joi.string().trim().max(255).optional(),
  referenceId: Joi.string().trim().max(100).optional()
}).or('availableQuantity', 'reservedQuantity', 'reorderLevel', 'price', 'status').messages({
  'object.missing': 'At least one field to update must be provided'
});

const reserveStockSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be an integer',
    'number.min': 'Quantity must be greater than zero',
    'any.required': 'Quantity is required'
  }),
  reason: Joi.string().trim().max(255).optional(),
  referenceId: Joi.string().trim().max(100).optional()
});

const releaseStockSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be an integer',
    'number.min': 'Quantity must be greater than zero',
    'any.required': 'Quantity is required'
  }),
  reason: Joi.string().trim().max(255).optional(),
  referenceId: Joi.string().trim().max(100).optional()
});

const getHistorySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  actionType: Joi.string().valid(...Object.values(INVENTORY_ACTION)).optional()
});

module.exports = {
  variantIdParamSchema,
  getInventorySchema,
  updateStockSchema,
  reserveStockSchema,
  releaseStockSchema,
  getHistorySchema
};
