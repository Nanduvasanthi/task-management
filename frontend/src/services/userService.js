// frontend/src/services/userService.js
import api from './api';

const userService = {
  // Update user profile
  updateProfile: async (userData) => {
    return await api.put('/users/profile', userData);
  },

  // Get user profile - Remove this or keep as alias
  getProfile: async () => {
    // You can either keep calling /auth/me or change to /users/profile
    return await api.get('/users/profile'); // Changed from /auth/me
  },

  // Change password
  changePassword: async (passwordData) => {
    return await api.put('/users/change-password', passwordData);
  },

  // Delete account
  deleteAccount: async () => {
    return await api.delete('/users/account');
  },

  // Get activity stats
  getActivityStats: async () => {
    return await api.get('/users/activity-stats');
  }
};

export default userService;