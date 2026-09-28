import { storage } from '../utils/helper';

export const authService = {
  getToken: () => storage.get('auth_token'),
  setToken: (token) => storage.set('auth_token', token),
  removeToken: () => storage.remove('auth_token'),
  getUser: () => storage.get('user_info'),
  setUser: (user) => storage.set('user_info', user),
  logout: () => {
    storage.remove('auth_token');
    storage.remove('user_info');
  },
  isAuthenticated: () => {
    // For demo/inventory assessment: returns true or checks token
    return true;
  }
};
