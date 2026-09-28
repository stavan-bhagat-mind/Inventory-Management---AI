const MESSAGES = {
  // Success Messages
  INVENTORY_FETCHED: 'Inventory retrieved successfully.',
  INVENTORY_UPDATED: 'Inventory updated successfully.',
  STOCK_RESERVED: 'Stock reserved successfully.',
  STOCK_RELEASED: 'Reserved stock released successfully.',
  HISTORY_FETCHED: 'Inventory history retrieved successfully.',
  HEALTH_OK: 'Inventory Service is healthy.',

  // Error Messages
  VARIANT_NOT_FOUND: 'Product variant not found.',
  INSUFFICIENT_STOCK: 'Insufficient available stock for reservation.',
  INSUFFICIENT_RESERVED_STOCK: 'Cannot release more stock than currently reserved.',
  INVALID_QUANTITY: 'Quantity must be a positive integer greater than zero.',
  INVALID_UPDATE_DATA: 'At least one field must be provided for update.',
  NEGATIVE_STOCK_NOT_ALLOWED: 'Inventory quantity cannot be negative.',
  CONCURRENCY_CONFLICT: 'Could not process inventory transaction due to a concurrent conflict. Please retry.',
  VALIDATION_ERROR: 'Validation failed for request parameters/body.',
  INTERNAL_ERROR: 'An unexpected internal server error occurred.',
  RESOURCE_NOT_FOUND: 'Requested resource does not exist.'
};

module.exports = MESSAGES;
