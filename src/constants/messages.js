const MESSAGES = Object.freeze({
  // Success
  INVENTORY_FETCHED: 'Inventory retrieved successfully',
  STOCK_UPDATED: 'Inventory stock updated successfully',
  STOCK_RESERVED: 'Stock reserved successfully',
  STOCK_RELEASED: 'Reserved stock released successfully',
  HISTORY_FETCHED: 'Inventory history retrieved successfully',

  // Client errors
  NOT_FOUND: 'Inventory variant not found',
  INVALID_QUANTITY: 'Quantity must be a positive integer greater than zero',
  INSUFFICIENT_STOCK: 'Requested reservation quantity exceeds available stock',
  INSUFFICIENT_RESERVED: 'Requested release quantity exceeds current reserved stock',
  NEGATIVE_STOCK_NOT_ALLOWED: 'Available quantity cannot be negative',
  NEGATIVE_RESERVED_NOT_ALLOWED: 'Reserved quantity cannot be negative',
  VALIDATION_ERROR: 'Validation error',
  INVALID_UUID: 'Variant ID must be a valid UUID',

  // Server errors
  INTERNAL_SERVER_ERROR: 'An unexpected internal server error occurred',
  ROUTE_NOT_FOUND: 'Requested endpoint does not exist'
});

module.exports = MESSAGES;
