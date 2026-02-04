const Task = require('../models/Task');
const ApiResponse = require('../utils/apiResponse');
const { validateTaskInput } = require('../utils/validators');

// @desc    Get all tasks for logged in user
// @route   GET /api/v1/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    const userId = req.user.id;

    // Build filter
    const filter = { user: userId };

    // Filter by status
    if (status && ['todo', 'in-progress', 'done'].includes(status)) {
      filter.status = status;
    }

    // Filter by priority
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      filter.priority = priority;
    }

    // Search in title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort by creation date (newest first)
    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    res.status(200).json(ApiResponse.success('Tasks retrieved successfully', {
      tasks,
      count: tasks.length
    }));
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json(ApiResponse.error('Server error'));
  }
};

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json(ApiResponse.error('Task not found'));
    }

    res.status(200).json(ApiResponse.success('Task retrieved successfully', {
      task
    }));
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json(ApiResponse.error('Server error'));
  }
};

// @desc    Create new task
// @route   POST /api/v1/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;
    const userId = req.user.id;

    // Validate input
    const validation = validateTaskInput({ title, description });
    if (!validation.isValid) {
      return res.status(400).json(ApiResponse.error('Validation failed', validation.errors));
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      tags,
      user: userId
    });

    res.status(201).json(ApiResponse.success('Task created successfully', {
      task
    }));
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json(ApiResponse.error('Server error'));
  }
};

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;

    // Validate input
    if (title || description) {
      const validation = validateTaskInput({ title, description });
      if (!validation.isValid) {
        return res.status(400).json(ApiResponse.error('Validation failed', validation.errors));
      }
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      {
        title,
        description,
        status,
        priority,
        dueDate,
        tags
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!task) {
      return res.status(404).json(ApiResponse.error('Task not found'));
    }

    res.status(200).json(ApiResponse.success('Task updated successfully', {
      task
    }));
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json(ApiResponse.error('Server error'));
  }
};

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json(ApiResponse.error('Task not found'));
    }

    res.status(200).json(ApiResponse.success('Task deleted successfully'));
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json(ApiResponse.error('Server error'));
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
};
