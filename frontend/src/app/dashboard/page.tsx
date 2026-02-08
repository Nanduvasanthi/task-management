"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { 
  FaPlus, FaSearch, FaCheckCircle, FaClock, 
  FaListAlt, FaChartBar, FaUserEdit, FaExclamationCircle,
  FaSpinner, FaCalendarAlt, FaTags, FaEdit, FaTrash,
  FaFilter, FaSort, FaEye, FaTimes
} from "react-icons/fa";
import authService from "../../services/authService";
import taskService from "../../services/taskService";
import { AxiosResponse } from "axios";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface User {
  name: string;
  email: string;
}

interface Stats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  highPriority: number;
  overdue: number;
}

interface Filters {
  status: string;
  priority: string;
  search: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<Filters>({
    status: "",
    priority: "",
    search: ""
  });
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Statistics
  const [stats, setStats] = useState<Stats>({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    highPriority: 0,
    overdue: 0
  });

  // Check authentication
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login");
      return;
    }
    
    const userData = authService.getCurrentUser();
    if (userData) {
      setUser(userData);
      fetchTasks();
    } else {
      router.push("/login");
    }
  }, [router]);

  // Fetch tasks from API
  // Fetch tasks from API
const fetchTasks = async (customFilters: Partial<Filters> = {}) => {
  try {
    setLoading(true);
    const allFilters = { ...filters, ...customFilters };
    const response = await taskService.getTasks(allFilters);
    
    // REMOVE the status check (line 100)
    // Your api.ts returns data object, not Axios response with status
    
    // CORRECT: response is {success, message, data: {tasks: [...]}}
    const tasksData = (response as any)?.data?.tasks || [];
    
    // Sort tasks
    const sortedTasks = sortTasks(tasksData);
    setTasks(sortedTasks);
    calculateStats(sortedTasks);
  } catch (err: any) {
    toast.error(err?.message || "Failed to fetch tasks");
  } finally {
    setLoading(false);
  }
};

  // Sort tasks
  const sortTasks = (taskList: Task[]): Task[] => {
    return [...taskList].sort((a, b) => {
      if (sortBy === "title") {
        return sortOrder === "asc" 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      if (sortBy === "priority") {
        const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 0;
        const bPriority = priorityOrder[b.priority] || 0;
        return sortOrder === "asc" ? aPriority - bPriority : bPriority - aPriority;
      }
      if (sortBy === "dueDate") {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
      // Default: sort by createdAt
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  };

  // Calculate statistics
  const calculateStats = (taskList: Task[]) => {
    const now = new Date();
    const overdueCount = taskList.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < now && 
      task.status !== 'done'
    ).length;

    setStats({
      total: taskList.length,
      todo: taskList.filter(task => task.status === 'todo').length,
      inProgress: taskList.filter(task => task.status === 'in-progress').length,
      done: taskList.filter(task => task.status === 'done').length,
      highPriority: taskList.filter(task => task.priority === 'high').length,
      overdue: overdueCount
    });
  };

  // Handle task creation
  const handleCreateTask = async (taskData: any) => {
  try {
    await taskService.createTask(taskData); // No status check
    toast.success("Task created successfully!");
    setShowCreateModal(false);
    fetchTasks();
  } catch (err: any) {
    toast.error(err?.message || "Failed to create task");
  }
};

  // Handle task update
 const handleUpdateTask = async (id: string, taskData: any) => {
  try {
    await taskService.updateTask(id, taskData); // No status check
    toast.success("Task updated successfully!");
    setEditingTask(null);
    fetchTasks();
  } catch (err: any) {
    toast.error(err?.message || "Failed to update task");
  }
};
  // Handle task deletion
  const handleDeleteTask = async (id: string) => {
  try {
    await taskService.deleteTask(id); // No status check
    toast.success("Task deleted successfully!");
    setTaskToDelete(null);
    fetchTasks();
  } catch (err: any) {
    toast.error(err?.message || "Failed to delete task");
  }
};

  // Handle filter change
  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    fetchTasks(newFilters);
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    // Re-sort current tasks
    const sortedTasks = sortTasks(tasks);
    setTasks(sortedTasks);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isOverdue = date < now && new Date(date).toDateString() !== now.toDateString();
    
    return (
      <span className={`flex items-center ${isOverdue ? "text-red-600 font-medium" : ""}`}>
        {isToday ? "Today" : date.toLocaleDateString()}
        {isOverdue && <FaExclamationCircle className="ml-2 w-4 h-4" />}
      </span>
    );
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  // Loading skeleton
  if (loading && !tasks.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Toaster position="top-right" />
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      
      {/* Dashboard Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
              <p className="text-gray-600 mt-2">Here's an overview of your tasks and productivity</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              <FaPlus className="w-5 h-5 mr-2" />
              New Task
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                <FaListAlt className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl mr-4">
                <FaClock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">To Do</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todo}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl mr-4">
                <FaChartBar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl mr-4">
                <FaCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.done}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-xl mr-4">
                <FaExclamationCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">{stats.highPriority}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-xl mr-4">
                <FaCalendarAlt className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Task Management Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Section Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Tasks</h2>
            <p className="text-gray-600 text-sm mt-1">Manage all your tasks in one place</p>
          </div>

          {/* Search & Filter Bar */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks by title or description..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange({ search: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex gap-3">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange({ status: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange({ priority: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Task List */}
          {loading ? (
            <div className="text-center py-12">
              <FaSpinner className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading tasks...</p>
            </div>
          ) : tasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange("title")}
                    >
                      <div className="flex items-center">
                        Title
                        <FaSort className="ml-2 w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange("dueDate")}
                    >
                      <div className="flex items-center">
                        Due Date
                        <FaSort className="ml-2 w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange("priority")}
                    >
                      <div className="flex items-center">
                        Priority
                        <FaSort className="ml-2 w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5">
                        <div>
                          <div className="font-medium text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => setViewingTask(task)}>
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-sm text-gray-500 mt-1 line-clamp-1">{task.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm">
                        {formatDate(task.dueDate)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                          {task.status === 'in-progress' ? 'In Progress' : 
                           task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1">
                          {task.tags?.slice(0, 2).map((tag: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                              <FaTags className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {task.tags && task.tags.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                              +{task.tags.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setViewingTask(task)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            title="View Details"
                          >
                            <FaEye className="w-3 h-3 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => setEditingTask(task)}
                            className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition"
                            title="Edit Task"
                          >
                            <FaEdit className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => setTaskToDelete(task)}
                            className="inline-flex items-center px-3 py-1.5 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition"
                            title="Delete Task"
                          >
                            <FaTrash className="w-3 h-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                <FaListAlt className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">No tasks found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                {filters.search || filters.status || filters.priority 
                  ? "Try adjusting your filters to see more results."
                  : "You haven't created any tasks yet. Start by creating your first task!"}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                <FaPlus className="w-5 h-5 mr-2" />
                Create Your First Task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <TaskModal
          title="Create New Task"
          onSubmit={handleCreateTask}
          onCancel={() => setShowCreateModal(false)}
          initialData={null}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskModal
          title="Edit Task"
          onSubmit={(data) => handleUpdateTask(editingTask._id, data)}
          onCancel={() => setEditingTask(null)}
          initialData={editingTask}
        />
      )}

      {/* View Task Modal */}
      {viewingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Task Details</h3>
              <button
                onClick={() => setViewingTask(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <p className="text-lg font-semibold text-gray-900">{viewingTask.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-700 whitespace-pre-wrap">{viewingTask.description || "No description"}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(viewingTask.status)}`}>
                    {viewingTask.status === 'in-progress' ? 'In Progress' : 
                     viewingTask.status.charAt(0).toUpperCase() + viewingTask.status.slice(1)}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(viewingTask.priority)}`}>
                    {viewingTask.priority.charAt(0).toUpperCase() + viewingTask.priority.slice(1)}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <p className="text-gray-700">{viewingTask.dueDate ? new Date(viewingTask.dueDate).toLocaleDateString() : "No due date"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {viewingTask.tags && viewingTask.tags.length > 0 ? (
                    viewingTask.tags.map((tag: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        <FaTags className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No tags</p>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Created: {new Date(viewingTask.createdAt).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">Last updated: {new Date(viewingTask.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setViewingTask(null);
                  setEditingTask(viewingTask);
                }}
                className="px-5 py-2.5 border border-blue-300 text-blue-700 rounded-xl hover:bg-blue-50 transition font-medium"
              >
                <FaEdit className="inline w-4 h-4 mr-2" />
                Edit Task
              </button>
              <button
                onClick={() => setViewingTask(null)}
                className="px-5 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-xl mr-4">
                  <FaExclamationCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Confirm Deletion</h3>
              </div>
              <button
                onClick={() => setTaskToDelete(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the task "<span className="font-semibold">{taskToDelete.title}</span>"?
              </p>
              <p className="text-sm text-red-600">
                This action cannot be undone. All task data will be permanently deleted.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                <FaTimes className="inline w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTask(taskToDelete._id)}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition font-medium"
              >
                <FaTrash className="inline w-4 h-4 mr-2" />
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Task Modal Component
interface TaskFormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  tags: string;
}

interface TaskModalProps {
  title: string;
  initialData: Task | null;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
}

const TaskModal = ({ title, initialData, onSubmit, onCancel }: TaskModalProps) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    status: initialData?.status || "todo",
    priority: initialData?.priority || "medium",
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : "",
    tags: initialData?.tags?.join(', ') || "" 
  });
  const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Convert comma-separated string to array
            const tagsArray = formData.tags
                .split(',')
                .map((tag: string) => tag.trim())
                .filter((tag: string) => tag.length > 0);

            const taskData: TaskFormData = {
                ...formData,
               // Now it's an array
            };

            await onSubmit(taskData);
        } finally {
            setSubmitting(false);
        }
    };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Add details about this task..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaTags className="inline w-4 h-4 mr-1" />
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="urgent, project, meeting"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium disabled:opacity-70"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-medium disabled:opacity-70"
            >
              {submitting ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                  {initialData ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                initialData ? 'Update Task' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};