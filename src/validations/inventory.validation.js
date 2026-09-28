const Joi = require('joi');
const {
  VARIANT_STATUS,
  ACTION_TYPES,
  SORT_BY_FIELDS,
  DEFAULT_SORT_BY,
  SORT_ORDERS,
  DEFAULT_SORT_ORDER
} = require('../constants/inventory');

const variantIdParamSchema = Joi.object({
  variantId: Joi.string().uuid().required().messages({
    'string.guid': 'Variant ID must be a valid UUID.',
    'any.required': 'Variant ID is required.'
  })
});

const listInventoryQuerySchema = Joi.object({
  search: Joi.string().trim().max(100).allow('').optional(),
  status: Joi.string().valid(...Object.values(VARIANT_STATUS)).optional(),
  low_stock: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort_by: Joi.string().valid(...SORT_BY_FIELDS).default(DEFAULT_SORT_BY),
  sort_order: Joi.string().valid(...SORT_ORDERS).default(DEFAULT_SORT_ORDER)
});

const updateStockSchema = Joi.object({
  available_quantity: Joi.number().integer().min(0).optional(),
  price: Joi.number().min(0).precision(2).optional(),
  reorder_level: Joi.number().integer().min(0).optional(),
  status: Joi.string().valid(...Object.values(VARIANT_STATUS)).optional(),
  reason: Joi.string().trim().max(255).optional(),
  reference_id: Joi.string().trim().max(100).optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided to update (available_quantity, price, reorder_level, or status).'
});

const reserveStockSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Quantity must be a number.',
    'number.integer': 'Quantity must be an integer.',
    'number.min': 'Quantity must be greater than zero.',
    'any.required': 'Quantity is required.'
  }),
  reason: Joi.string().trim().max(255).optional(),
  reference_id: Joi.string().trim().max(100).optional()
});

const releaseStockSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Quantity must be a number.',
    'number.integer': 'Quantity must be an integer.',
    'number.min': 'Quantity must be greater than zero.',
    'any.required': 'Quantity is required.'
  }),
  reason: Joi.string().trim().max(255).optional(),
  reference_id: Joi.string().trim().max(100).optional()
});

const getHistoryQuerySchema = Joi.object({
  action_type: Joi.string().valid(...Object.values(ACTION_TYPES)).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

module.exports = {
  variantIdParamSchema,
  listInventoryQuerySchema,
  updateStockSchema,
  reserveStockSchema,
  releaseStockSchema,
  getHistoryQuerySchema
};
