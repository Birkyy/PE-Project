import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5022/api', // Correct ASP.NET Core port
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Project API calls
export const projectAPI = {
  // Get all projects
  getAllProjects: async (userId = null) => {
    try {
      const params = userId ? { userId } : {};
      const response = await api.get('/Project', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all projects:', error);
      throw error;
    }
  },

  // Get project by ID
  getProjectById: async (id) => {
    try {
      const response = await api.get(`/Project/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project by ID:', error);
      throw error;
    }
  },

  // Get projects by user ID
  getProjectsByUserId: async (userId) => {
    try {
      const response = await api.get(`/Project/by-user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching projects by user ID:', error);
      throw error;
    }
  },

  // Create new project
  createProject: async (projectData) => {
    try {
      const response = await api.post('/Project', projectData);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Update project
  updateProject: async (id, projectData) => {
    try {
      const response = await api.put(`/Project/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Delete project
  deleteProject: async (id) => {
    try {
      const response = await api.delete(`/Project/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },
};

// Task API calls
export const taskAPI = {
  // Get all tasks
  getAllTasks: async () => {
    try {
      const response = await api.get('/ProjectTask');
      return response.data;
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      throw error;
    }
  },

  // Get tasks by project ID
  getTasksByProjectId: async (projectId) => {
    try {
      const response = await api.get(`/ProjectTask`);
      const allTasks = response.data;
      // Filter tasks by project ID since there's no specific endpoint
      return allTasks.filter(task => task.projectId === projectId);
    } catch (error) {
      console.error('Error fetching tasks by project ID:', error);
      throw error;
    }
  },

  // Get Todo tasks by project ID
  getTodoTasksByProjectId: async (projectId) => {
    try {
      const response = await api.get(`/ProjectTask`);
      const allTasks = response.data;
      // Filter tasks by project ID and Todo status
      return allTasks.filter(task => 
        task.projectId === projectId && 
        task.status.toLowerCase() === 'todo'
      );
    } catch (error) {
      console.error('Error fetching Todo tasks by project ID:', error);
      throw error;
    }
  },

  // Get In Progress tasks by project ID
  getInProgressTasksByProjectId: async (projectId) => {
    try {
      const response = await api.get(`/ProjectTask`);
      const allTasks = response.data;
      // Filter tasks by project ID and In Progress status
      return allTasks.filter(task => 
        task.projectId === projectId && 
        (task.status.toLowerCase() === 'in progress' || task.status.toLowerCase() === 'inprogress')
      );
    } catch (error) {
      console.error('Error fetching In Progress tasks by project ID:', error);
      throw error;
    }
  },

  // Get Completed tasks by project ID
  getCompletedTasksByProjectId: async (projectId) => {
    try {
      const response = await api.get(`/ProjectTask`);
      const allTasks = response.data;
      // Filter tasks by project ID and Completed status
      return allTasks.filter(task => 
        task.projectId === projectId && 
        task.status.toLowerCase() === 'completed'
      );
    } catch (error) {
      console.error('Error fetching Completed tasks by project ID:', error);
      throw error;
    }
  },

  // Get task by ID
  getTaskById: async (id) => {
    try {
      const response = await api.get(`/ProjectTask/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task by ID:', error);
      throw error;
    }
  },

  // Create new task
  createTask: async (taskData) => {
    try {
      const response = await api.post('/ProjectTask', taskData);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Update task
  updateTask: async (id, taskData) => {
    try {
      const response = await api.put(`/ProjectTask/${id}`, taskData);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Delete task
  deleteTask: async (id) => {
    try {
      const response = await api.delete(`/ProjectTask/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Check if task is overdue
  isTaskOverdue: async (id) => {
    try {
      const response = await api.get(`/ProjectTask/${id}/is-overdue`);
      return response.data;
    } catch (error) {
      console.error('Error checking if task is overdue:', error);
      throw error;
    }
  },
};

// User API calls
export const userAPI = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await api.get('/User');
      return response.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/User/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  },

  // Get user by email
  getUserByEmail: async (email) => {
    try {
      const response = await api.get(`/User/email/${email}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await api.post('/User', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/User/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Login user
  loginUser: async (loginData) => {
    try {
      const response = await api.post('/User/login', loginData);
      return response.data;
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  },
};

export const commentAPI = {
  // Get all comments
  getCommentsByTaskId: async (taskId) => {
    try {
      const response = await api.get(`/Comment/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  createComment: async (taskId, commentData) => {
    try {
      const response = await api.post(`/Comment/${taskId}`, commentData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  deleteComment: async (taskId) =>{
    try {
      const response = await api.delete(`/Comment/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
};

export default api; 