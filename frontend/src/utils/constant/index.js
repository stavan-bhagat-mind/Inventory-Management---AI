export const API_ENDPOINTS = {
  HEALTH: '/health',
  INVENTORY: '/inventory',
  INVENTORY_UPDATE: (id) => `/inventory/${id}`,
  INVENTORY_RESERVE: (id) => `/inventory/${id}/reserve`,
  INVENTORY_RELEASE: (id) => `/inventory/${id}/release`,
  INVENTORY_HISTORY: (id) => `/inventory/${id}/history`,
};

export const VARIANT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  DISCONTINUED: 'DISCONTINUED'
};

export const ACTION_TYPES = {
  STOCK_UPDATE: 'STOCK_UPDATE',
  RESERVE: 'RESERVE',
  RELEASE: 'RELEASE'
};

export const STATUS_COLORS = {
  ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  OUT_OF_STOCK: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  DISCONTINUED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
};

export const ACTION_COLORS = {
  STOCK_UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  RESERVE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  RELEASE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
};

export const MESSAGES = {
  STOCK_RESERVED: 'Stock successfully reserved.',
  STOCK_RELEASED: 'Reserved stock successfully released.',
  INVENTORY_UPDATED: 'Inventory updated successfully.',
  SERVER_ERROR: 'An error occurred while communicating with the server.'
};
