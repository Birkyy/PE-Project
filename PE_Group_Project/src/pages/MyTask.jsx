import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useTheme } from '../context/ThemeContext';
import { Plus, Edit, Trash2, Search, MoveRight, Clock, Edit2, ChevronRight, ChevronLeft, User, Eye, Filter, MoreVertical, Calendar, MessageCircle, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';
import ViewTaskModal from './ViewTaskModal';
import { taskAPI, projectAPI, userAPI } from '../API/apiService';

const statusList = [
  { key: 'Todo', color: 'blue' },
  { key: 'In Progress', color: 'yellow' },
  { key: 'Completed', color: 'green' },
];

// Helper function to normalize status values
const normalizeStatus = (status) => {
  const statusLower = status.toLowerCase();
  if (statusLower === 'todo' || statusLower === 'to do') return 'Todo';
  if (statusLower === 'in progress' || statusLower === 'inprogress' || statusLower === 'progress') return 'In Progress';
  if (statusLower === 'completed' || statusLower === 'complete' || statusLower === 'done') return 'Completed';
  return status; // Return original if no match
};

// Helper function to check if a task is overdue
const isTaskOverdue = (task) => {
  if (task.status.toLowerCase() === 'completed') return false;
  if (!task.deadline) return false;
  return new Date(task.deadline) < new Date();
};

const MyTask = () => {
  const { projectName } = useParams();
  const { darkMode } = useTheme();
  const [todoTasks, setTodoTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Load project data and tasks
  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, get all projects to find the current project
        const allProjects = await projectAPI.getAllProjects();
        console.log('All projects:', allProjects);
        console.log('Looking for project:', decodeURIComponent(projectName));
        
        const project = allProjects.find(p => p.projectName === decodeURIComponent(projectName));
        console.log('Found project:', project);
        
        if (project) {
          setCurrentProject({
            name: project.projectName,
            description: project.description || '',
            dueDate: project.date,
            progress: 0, // You can calculate this based on completed tasks
            color: 'purple',
            projectId: project.projectId // Add projectId to currentProject
          });

          console.log('Project ID for task fetching:', project.projectId);

          // First, let's get all tasks to see what's available
          const allTasks = await taskAPI.getAllTasks();
          console.log('All tasks from backend:', allTasks);
          console.log('Tasks for this project:', allTasks.filter(task => task.projectId === project.projectId));

          // Fetch tasks for each status separately
          const finalTodoTasks = allTasks.filter(task => 
            task.projectId === project.projectId && 
            task.status.toLowerCase() === 'todo'
          );
          const finalInProgressTasks = allTasks.filter(task => 
            task.projectId === project.projectId && 
            (task.status.toLowerCase() === 'in progress' || task.status.toLowerCase() === 'inprogress')
          );
          const finalCompletedTasks = allTasks.filter(task => 
            task.projectId === project.projectId && 
            task.status.toLowerCase() === 'completed'
          );

          // Transform tasks with user information
          const transformedTodo = await transformTasksWithUserInfo(finalTodoTasks);
          const transformedInProgress = await transformTasksWithUserInfo(finalInProgressTasks);
          const transformedCompleted = await transformTasksWithUserInfo(finalCompletedTasks);

          setTodoTasks(transformedTodo);
          setInProgressTasks(transformedInProgress);
          setCompletedTasks(transformedCompleted);

          console.log('Transformed Todo tasks:', transformedTodo);
          console.log('Transformed In Progress tasks:', transformedInProgress);
          console.log('Transformed Completed tasks:', transformedCompleted);
          console.log('Total tasks set:', transformedTodo.length + transformedInProgress.length + transformedCompleted.length);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        console.error('Error fetching project and tasks:', err);
        setError('Failed to load project and tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndTasks();
  }, [projectName]);

  // Load current user data
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  // Function to resolve user information from GUID
  const resolveUserInfo = async (picGuid) => {
    if (!picGuid || picGuid === '00000000-0000-0000-0000-000000000000') {
      return 'Unassigned';
    }
    
    try {
      const user = await userAPI.getUserById(picGuid);
      return user.username || user.email || 'Unknown User';
    } catch (error) {
      console.error('Error resolving user info:', error);
      return 'Unknown User';
    }
  };

  // Enhanced task transformation with user resolution
  const transformTasksWithUserInfo = async (tasks) => {
    const transformedTasks = [];
    
    for (const task of tasks) {
      const assignedTo = await resolveUserInfo(task.pic);
      transformedTasks.push({
        id: task.projectTaskId,
        title: task.taskName,
        status: normalizeStatus(task.status),
        description: task.description,
        deadline: task.deadline,
        priority: task.priority,
        assignedTo: assignedTo,
        pic: task.pic, // Keep the original GUID for API calls
        projectId: task.projectId,
        comments: []
      });
    }
    
    return transformedTasks;
  };

  // Task handlers
  const handleCreateTask = async (taskData) => {
    try {
      if (!currentProject) {
        throw new Error('No project selected');
      }

      // Find the project ID
      const allProjects = await projectAPI.getAllProjects();
      const project = allProjects.find(p => p.projectName === currentProject.name);
      
      if (!project) {
        throw new Error('Project not found');
      }

      // Prepare task data for API
      const newTaskData = {
        projectId: project.projectId,
        taskName: taskData.title,
        pic: taskData.assignedTo || '00000000-0000-0000-0000-000000000000', // Default GUID if empty
        deadline: taskData.deadline ? new Date(taskData.deadline).toISOString() : new Date().toISOString(),
        description: taskData.description,
        status: normalizeStatus('Todo'), // Always start with Todo status
        priority: taskData.priority
      };

      // Create task using API
      const createdTask = await taskAPI.createTask(newTaskData);
      
      // Resolve user information for the created task
      const assignedTo = await resolveUserInfo(createdTask.pic);
      
      // Add to local state
      const newTask = {
        id: createdTask.projectTaskId,
        title: createdTask.taskName,
        status: normalizeStatus(createdTask.status),
        description: createdTask.description,
        deadline: createdTask.deadline,
        priority: createdTask.priority,
        assignedTo: assignedTo,
        pic: createdTask.pic, // Keep the original GUID for API calls
        projectId: project.projectId,
        comments: []
      };

      setTodoTasks(prev => [...prev, newTask]);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleEditTask = async (updatedTask) => {
    try {
      // Get the projectId from the task or currentProject
      const projectId = updatedTask.projectId || currentProject?.projectId;
      
      if (!projectId) {
        throw new Error('Project ID not found for task update');
      }

      // Prepare task data for API
      const taskData = {
        projectId: projectId,
        taskName: updatedTask.title,
        pic: updatedTask.pic || updatedTask.assignedTo || '00000000-0000-0000-0000-000000000000',
        deadline: updatedTask.deadline ? new Date(updatedTask.deadline).toISOString() : new Date().toISOString(),
        description: updatedTask.description,
        status: normalizeStatus(updatedTask.status),
        priority: updatedTask.priority
      };

      console.log('Updating task with data:', taskData);

      // Update task using API
      await taskAPI.updateTask(updatedTask.id, taskData);
      
      // Resolve user information for the updated task
      const assignedTo = await resolveUserInfo(taskData.pic);
      
      // Remove task from all arrays first
      setTodoTasks(prev => prev.filter(task => task.id !== updatedTask.id));
      setInProgressTasks(prev => prev.filter(task => task.id !== updatedTask.id));
      setCompletedTasks(prev => prev.filter(task => task.id !== updatedTask.id));

      // Add task to the correct array based on its new status
      const normalizedStatus = normalizeStatus(updatedTask.status);
      const taskWithNormalizedStatus = { 
        ...updatedTask, 
        status: normalizedStatus,
        projectId: projectId, // Ensure projectId is preserved
        assignedTo: assignedTo, // Use resolved user information
        pic: taskData.pic // Keep the original GUID for API calls
      };

      if (normalizedStatus === 'Todo') {
        setTodoTasks(prev => [...prev, taskWithNormalizedStatus]);
      } else if (normalizedStatus === 'In Progress') {
        setInProgressTasks(prev => [...prev, taskWithNormalizedStatus]);
      } else if (normalizedStatus === 'Completed') {
        setCompletedTasks(prev => [...prev, taskWithNormalizedStatus]);
      }

      setIsEditModalOpen(false);
      setSelectedTask(null);
    } catch (err) {
      console.error('Error updating task:', err);
      alert('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      setTodoTasks(prev => prev.filter(t => t.id !== taskId));
      setInProgressTasks(prev => prev.filter(t => t.id !== taskId));
      setCompletedTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleChangeStatus = async (task, newStatus) => {
    try {
      const updatedTask = { ...task, status: normalizeStatus(newStatus) };
      await handleEditTask(updatedTask);
    } catch (err) {
      console.error('Error changing task status:', err);
      alert('Failed to update task status. Please try again.');
    }
  };

  // Get next status in the workflow
  const getNextStatus = (currentStatus) => {
    const currentIndex = statusList.findIndex(s => s.key.toLowerCase() === currentStatus.toLowerCase());
    return currentIndex < statusList.length - 1 ? statusList[currentIndex + 1].key : null;
  };

  // Get previous status in the workflow
  const getPreviousStatus = (currentStatus) => {
    const currentIndex = statusList.findIndex(s => s.key.toLowerCase() === currentStatus.toLowerCase());
    return currentIndex > 0 ? statusList[currentIndex - 1].key : null;
  };

  // Filter tasks based on search query
  const filterTasks = (taskList, status) => {
    return taskList
      .filter(task => task.status.toLowerCase() === status.toLowerCase())
      .filter(task => 
        searchQuery === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  // Format date to display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      low: darkMode ? 'text-green-300' : 'text-green-600',
      medium: darkMode ? 'text-yellow-300' : 'text-yellow-600',
      high: darkMode ? 'text-red-300' : 'text-red-600'
    };
    return colors[priority] || colors.medium;
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const isTaskAssignedToMe = (task) => {
    if (!currentUser) return false;
    return task.assignedTo === currentUser.username || task.assignedTo === currentUser.email;
  };

  const openViewModal = (task) => {
    setSelectedTask(task);
    setIsViewModalOpen(true);
  };

  // Add new function to handle comments
  const handleAddComment = (taskId, commentText) => {
    const comment = {
      id: Date.now(),
      text: commentText,
      author: currentUser ? currentUser.username || currentUser.email : 'Anonymous',
      timestamp: new Date().toISOString(),
    };

    setTodoTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              comments: [comment, ...(task.comments || [])]
            }
          : task
      )
    );
    setInProgressTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              comments: [comment, ...(task.comments || [])]
            }
          : task
      )
    );
    setCompletedTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              comments: [comment, ...(task.comments || [])]
            }
          : task
      )
    );
  };

  const renderTaskCard = (task) => {
    const isOverdue = isTaskOverdue(task);
    const priorityColors = {
      low: darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800',
      medium: darkMode ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      high: darkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-800'
    };

    const nextStatus = getNextStatus(task.status);
    const previousStatus = getPreviousStatus(task.status);
    const isMyTask = isTaskAssignedToMe(task);

    return (
      <div
        key={task.id}
        className={`p-4 rounded-lg mb-3 ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        } shadow-sm`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            {isMyTask && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-800'
                }`}
                title="Assigned to me"
              >
                <User className="w-3 h-3" />
                My Task
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openViewModal(task)}
              className={`p-1.5 rounded-lg ${
                darkMode
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {previousStatus && (
              <button
                onClick={() => handleChangeStatus(task, previousStatus)}
                className={`p-1.5 rounded-lg ${
                  darkMode
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                title={`Move to ${previousStatus}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {nextStatus && (
              <button
                onClick={() => handleChangeStatus(task, nextStatus)}
                className={`p-1.5 rounded-lg ${
                  darkMode
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                title={`Move to ${nextStatus}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => openEditModal(task)}
              className={`p-1.5 rounded-lg ${
                darkMode
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteTask(task.id)}
              className={`p-1.5 rounded-lg ${
                darkMode
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {task.description}
        </p>
        
        <div className="flex flex-wrap gap-2 items-center">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          
          {isOverdue && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              darkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-800'
            }`}>
              <Clock className="w-3 h-3" />
              Overdue
            </span>
          )}
          
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Due: {new Date(task.deadline).toLocaleDateString()}
          </span>
          
          {task.assignedTo && (
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Assigned to: {task.assignedTo}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-extrabold mb-2 ${darkMode ? 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent' : 'text-gray-900'}`}>
              My Tasks for {decodeURIComponent(projectName)}
            </h2>
            {currentProject && (
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Project Deadline: {formatDate(currentProject.dueDate)}
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className={`text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p>Loading tasks...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center justify-center py-12">
              <div className={`text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          {/* Main Content */}
          {!loading && !error && (
            <>
              <div className="flex justify-between items-center mb-6">
                {/* Search Bar */}
                <div className={`relative flex-1 max-w-md ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      darkMode
                        ? 'bg-gray-800 border-gray-600 focus:ring-cyan-500 text-gray-200 placeholder-gray-400'
                        : 'bg-white border-gray-300 focus:ring-blue-500 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* Add Task Button */}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className={`ml-4 px-4 py-2 rounded-lg flex items-center ${
                    darkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Task
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statusList.map(({ key, color }) => (
                  <div key={key} className={`${darkMode ? 'bg-gray-800 border-' + color + '-500/30' : 'bg-white border-' + color + '-300'} border rounded-lg shadow-xl p-4 flex flex-col`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-semibold ${darkMode ? `text-${color}-300` : `text-${color}-700`}`}>{key}</h3>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {filterTasks(key === 'Todo' ? todoTasks : key === 'In Progress' ? inProgressTasks : completedTasks, key).length} tasks
                      </span>
                    </div>
                    <div className="flex-1 space-y-4">
                      {filterTasks(key === 'Todo' ? todoTasks : key === 'In Progress' ? inProgressTasks : completedTasks, key).length === 0 && (
                        <div className={`text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {searchQuery ? 'No matching tasks' : 'No tasks'}
                        </div>
                      )}
                      {filterTasks(key === 'Todo' ? todoTasks : key === 'In Progress' ? inProgressTasks : completedTasks, key).map(renderTaskCard)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Results Count */}
              <div className="mt-8 text-center">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {[
                    ...todoTasks.filter(task => 
                      searchQuery === '' ||
                      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
                    ),
                    ...inProgressTasks.filter(task => 
                      searchQuery === '' ||
                      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
                    ),
                    ...completedTasks.filter(task => 
                      searchQuery === '' ||
                      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                  ].length} of {todoTasks.length + inProgressTasks.length + completedTasks.length} tasks
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {isViewModalOpen && (
        <ViewTaskModal
          task={selectedTask}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedTask(null);
          }}
          onAddComment={(commentText) => handleAddComment(selectedTask.id, commentText)}
        />
      )}
      
      {isEditModalOpen && (
        <EditTaskModal
          task={selectedTask}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTask(null);
          }}
          onSave={handleEditTask}
        />
      )}
      
      {isAddModalOpen && (
        <AddTaskModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleCreateTask}
        />
      )}
    </Layout>
  );
};

export default MyTask; 