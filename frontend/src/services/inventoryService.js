import api from './api';
import { API_ENDPOINTS } from '../utils/constant';

export const inventoryService = {
  getInventory: async (params = {}) => {
    return await api.get(API_ENDPOINTS.INVENTORY, { params });
  },

  updateStock: async (variantId, data) => {
    return await api.patch(API_ENDPOINTS.INVENTORY_UPDATE(variantId), data);
  },

  reserveStock: async (variantId, data) => {
    return await api.post(API_ENDPOINTS.INVENTORY_RESERVE(variantId), data);
  },

  releaseStock: async (variantId, data) => {
    return await api.post(API_ENDPOINTS.INVENTORY_RELEASE(variantId), data);
  },

  getHistory: async (variantId, params = {}) => {
    return await api.get(API_ENDPOINTS.INVENTORY_HISTORY(variantId), { params });
  }
};
