const ACTION_TYPES = Object.freeze({
  STOCK_UPDATE: 'STOCK_UPDATE',
  RESERVE: 'RESERVE',
  RELEASE: 'RELEASE'
});

const VARIANT_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  DISCONTINUED: 'DISCONTINUED'
});

const SORT_BY_FIELDS = Object.freeze([
  'sku',
  'price',
  'available_quantity',
  'reserved_quantity',
  'created_at'
]);

const DEFAULT_SORT_BY = 'created_at';

const SORT_ORDERS = Object.freeze(['ASC', 'DESC', 'asc', 'desc']);

const DEFAULT_SORT_ORDER = 'DESC';

module.exports = {
  ACTION_TYPES,
  VARIANT_STATUS,
  SORT_BY_FIELDS,
  DEFAULT_SORT_BY,
  SORT_ORDERS,
  DEFAULT_SORT_ORDER
};
