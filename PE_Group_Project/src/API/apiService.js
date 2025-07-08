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
  // Test backend connection
  testConnection: async () => {
    try {
      console.log("=== TEST: Testing backend connection ===");
      const response = await api.get('/Project/test');
      console.log("=== TEST: Backend connection successful ===");
      console.log("Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("=== TEST: Backend connection failed ===", error);
      throw error;
    }
  },

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

  // Get archived projects
  getArchivedProjects: async (userId = null) => {
    try {
      const params = userId ? { userId } : {};
      const response = await api.get('/Project/archived', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching archived projects:', error);
      throw error;
    }
  },

  // Archive project
  archiveProject: async (id, userId = null) => {
    try {
      const params = userId ? { userId } : {};
      const response = await api.put(`/Project/${id}/archive`, {}, { params });
      return response.data;
    } catch (error) {
      console.error('Error archiving project:', error);
      throw error;
    }
  },

  // Restore project
  restoreProject: async (id, userId = null) => {
    try {
      const params = userId ? { userId } : {};
      const response = await api.put(`/Project/${id}/restore`, {}, { params });
      return response.data;
    } catch (error) {
      console.error('Error restoring project:', error);
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
  // Get all comments for a task
  getCommentsByTaskId: async (taskId) => {
    console.log("=== API: getCommentsByTaskId START ===");
    console.log("taskId:", taskId);
    console.log("Full URL:", `${api.defaults.baseURL}/TaskComment/${taskId}`);
    
    try {
      console.log("=== API: About to make GET request ===");
      const response = await api.get(`/TaskComment/${taskId}`);
      console.log("=== API: GET request completed ===");
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("=== API: Error in getCommentsByTaskId ===", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      throw error;
    }
  },

  // Create a new comment
  createComment: async (taskId, commentData) => {
    console.log("=== API: createComment START ===");
    console.log("taskId:", taskId);
    console.log("commentData:", commentData);
    console.log("Full URL:", `${api.defaults.baseURL}/TaskComment`);
    
    try {
      console.log("=== API: About to make POST request ===");
      const response = await api.post(`/TaskComment`, commentData);
      console.log("=== API: POST request completed ===");
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("=== API: Error in createComment ===", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      throw error;
    }
  },

  // Update a comment
  updateComment: async (commentId, commentData) => {
    console.log("=== API: updateComment START ===");
    console.log("commentId:", commentId);
    console.log("commentData:", commentData);
    console.log("Full URL:", `${api.defaults.baseURL}/TaskComment/${commentId}`);
    
    try {
      console.log("=== API: About to make PUT request ===");
      const response = await api.put(`/TaskComment/${commentId}`, commentData);
      console.log("=== API: PUT request completed ===");
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("=== API: Error in updateComment ===", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      throw error;
    }
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    console.log("=== API: deleteComment START ===");
    console.log("commentId:", commentId);
    console.log("Full URL:", `${api.defaults.baseURL}/TaskComment/${commentId}`);
    
    try {
      console.log("=== API: About to make DELETE request ===");
      const response = await api.delete(`/TaskComment/${commentId}`);
      console.log("=== API: DELETE request completed ===");
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("=== API: Error in deleteComment ===", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      throw error;
    }
  },
};

export const notificationAPI = {
  // Get user notifications
  getUserNotification: async (userId) => {
    console.log("=== NOTIFICATION API: getUserNotification START ===");
    console.log("userId:", userId);
    console.log("Full URL:", `${api.defaults.baseURL}/Notification/${userId}`);
    
    try {
      console.log("=== NOTIFICATION API: About to make GET request ===");
      const response = await api.get(`/Notification/${userId}`);
      console.log("=== NOTIFICATION API: GET request completed ===");
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("=== NOTIFICATION API: Error in getUserNotification ===", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      throw error;
    }
  },

  createNotification: async (notificationData) => {
    try {
      const response = await api.post(`/Notification`, notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/Notification/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Update user
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/Notification/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};

// File Upload API calls
export const fileAPI = {
  // Upload general file
  uploadFile: async (file, category = null, relatedId = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (category) formData.append('category', category);
      if (relatedId) formData.append('relatedId', relatedId);

      const response = await api.post('/File/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Upload project file
  uploadProjectFile: async (file, projectId) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/File/upload/project/${projectId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading project file:', error);
      throw error;
    }
  },

  // Upload task file
  uploadTaskFile: async (file, taskId) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/File/upload/task/${taskId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading task file:', error);
      throw error;
    }
  },

  // List files by project ID
  getFilesByProjectId: async (projectId) => {
    try {
      const response = await api.get(`/File/list/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting project files:', error);
      throw error;
    }
  },

  // Delete project file by projectId and fileName
  deleteProjectFile: async (projectId, fileName) => {
    try {
      const response = await api.delete(`/File/delete/project/${projectId}/${encodeURIComponent(fileName)}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting project file:', error);
      throw error;
    }
  },

  getFilesByTaskId: async (taskId) => {
    try {
      const response = await api.get(`/File/list/task/${taskId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching task files:", error);
      throw error;
    }
  },

  downloadFile: async (fileId) => {
    try {
      const response = await api.get(`/File/download/${fileId}`, {
        responseType: "blob", // important to receive actual file data
      });
      return response;
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  },

  deleteFile: async (taskId, fileName) => {
    try {
      const response = await api.delete(`/File/delete/task/${taskId}/${encodeURIComponent(fileName)}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  },
};

export default api; 