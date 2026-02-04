const Task = require('../models/Task'); // Import Task model
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const { validateEmail } = require('../utils/validators');

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json(ApiResponse.error('User not found'));
    }

    res.status(200).json(ApiResponse.success('Profile retrieved', {
      user
    }));
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(ApiResponse.error('Server error'));
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
// In backend/controllers/userController.js
// Update the updateProfile function:

const updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(ApiResponse.error('User not found'));
    }

    // Update name
    if (name && name !== user.name) {
      user.name = name;
    }

    // Update email
    if (email && email !== user.email) {
      if (!validateEmail(email)) {
        return res.status(400).json(ApiResponse.error('Please enter a valid email'));
      }
      
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json(ApiResponse.error('Email already in use'));
      }
      
      user.email = email;
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json(ApiResponse.error('New password must be at least 6 characters'));
      }

      // Verify current password
      const isPasswordMatch = await user.comparePassword(currentPassword);
      if (!isPasswordMatch) {
        return res.status(401).json(ApiResponse.error('Current password is incorrect'));
      }

      // Set new password - will be hashed by pre-save hook
      user.password = newPassword;
    }

    // If no updates provided
    if (!name && !email && !currentPassword && !newPassword) {
      return res.status(400).json(ApiResponse.error('No changes provided'));
    }

    try {
        await user.save();
        console.log('✅ User saved successfully');
        const updatedUser = await User.findById(userId).select('-password');
        res.status(200).json(ApiResponse.success('Profile updated successfully', {
           user: updatedUser
        }));
    } catch (saveError) {
        console.error('❌ Save error:', saveError);
         if (saveError.name === 'ValidationError') {

        return res.status(400).json(ApiResponse.error('Validation failed: ' + Object.values(saveError.errors).map(e => e.message).join(', ')));
        }
        throw saveError; // Re-throw if not a validation error
    }

    // Save user - This triggers the pre-save hook to hash password
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json(ApiResponse.error('Server error'));
  }
};

// @desc    Delete user account
// @route   DELETE /api/v1/users/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find and delete user
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json(ApiResponse.error('User not found'));
    }

    // Also delete user's tasks when account is deleted
    await Task.deleteMany({ user: userId });

    res.status(200).json(ApiResponse.success('Account deleted successfully'));
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json(ApiResponse.error('Server error'));
  }
};

// @desc    Get user activity statistics
// @route   GET /api/v1/users/activity-stats
// @access  Private
const getActivityStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get REAL statistics from Task model
    // Total tasks created by user
    const tasksCreated = await Task.countDocuments({ user: userId });
    
    // Tasks marked as 'done' (completed)
    const tasksCompleted = await Task.countDocuments({ 
      user: userId, 
      status: 'done' 
    });
    
    // Active tasks (not done yet)
    const activeTasks = await Task.countDocuments({ 
      user: userId, 
      status: { $in: ['todo', 'in-progress'] } 
    });
    
    // Get tasks by priority for more insights
    const highPriorityTasks = await Task.countDocuments({ 
      user: userId, 
      priority: 'high',
      status: { $ne: 'done' } // Only count non-completed high priority tasks
    });
    
    // Calculate completion percentage
    const completionPercentage = tasksCreated > 0 
      ? Math.round((tasksCompleted / tasksCreated) * 100) 
      : 0;
    
    // Get recent activity (tasks created in last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentTasks = await Task.countDocuments({
      user: userId,
      createdAt: { $gte: weekAgo }
    });

    // Prepare stats response
    const stats = {
      // Main stats (matching your frontend)
      tasksCreated,
      tasksCompleted,
      activeProjects: activeTasks, // Using activeTasks as "active projects"
      teamMembers: 0, // You can update this when you implement teams
      
      // Additional useful stats
      activeTasks,
      highPriorityTasks,
      completionPercentage,
      recentActivity: recentTasks,
      
      // Task status breakdown
      todoTasks: await Task.countDocuments({ user: userId, status: 'todo' }),
      inProgressTasks: await Task.countDocuments({ user: userId, status: 'in-progress' }),
      doneTasks: tasksCompleted, // Same as above, for consistency
      
      // Priority breakdown
      lowPriorityTasks: await Task.countDocuments({ user: userId, priority: 'low' }),
      mediumPriorityTasks: await Task.countDocuments({ user: userId, priority: 'medium' }),
      highPriorityTasks: await Task.countDocuments({ user: userId, priority: 'high' })
    };

    res.status(200).json(ApiResponse.success('Activity stats retrieved', stats));
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json(ApiResponse.error('Server error'));
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
  getActivityStats
};