import api from './api';

const taskService = {
  // Get all tasks
  getTasks: async (filters = {}) => {
    const { status, priority, search } = filters;
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (search) params.append('search', search);
    
    const queryString = params.toString();
    const url = queryString ? `/tasks?${queryString}` : '/tasks';
    
    return await api.get(url);
  },

  // Get single task
  getTask: async (id) => {
    return await api.get(`/tasks/${id}`);
  },

  // Create task
  createTask: async (taskData) => {
    return await api.post('/tasks', taskData);
  },

  // Update task
  updateTask: async (id, taskData) => {
    return await api.put(`/tasks/${id}`, taskData);
  },

  // Delete task
  deleteTask: async (id) => {
    return await api.delete(`/tasks/${id}`);
  },
};

export default taskService;
