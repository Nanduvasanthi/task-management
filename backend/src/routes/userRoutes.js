const express = require('express');
const { 
  updateProfile,
  getProfile,
  deleteAccount,
  getActivityStats
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile routes
router.get('/profile', getProfile);           // GET /api/v1/users/profile
router.put('/profile', updateProfile);        // PUT /api/v1/users/profile
router.delete('/account', deleteAccount);     // DELETE /api/v1/users/account
router.get('/activity-stats', getActivityStats); // GET /api/v1/users/activity-stats

module.exports = router;