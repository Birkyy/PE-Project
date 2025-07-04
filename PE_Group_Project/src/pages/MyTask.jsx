import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useTheme } from '../context/ThemeContext';
import { Plus, Edit, Trash2, Search, MoveRight, Clock, Edit2, ChevronRight, ChevronLeft, User, Eye, Upload, File, X, Download } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';
import ViewTaskModal from './ViewTaskModal';
import { fetchProjectTasks, addProjectTask, editProjectTask, deleteProjectTask } from '../API/ProjectTaskAPI';

const statusList = [
  { key: 'Todo', color: 'blue' },
  { key: 'In Progress', color: 'yellow' },
  { key: 'Completed', color: 'green' },
];

// Helper function to check if a task is overdue
const isTaskOverdue = (task) => {
  if (task.status === 'Completed') return false;
  if (!task.deadline) return false;
  return new Date(task.deadline) < new Date();
};

const MyTask = () => {
  const { projectName } = useParams();
  const { darkMode } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadingTaskId, setUploadingTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Load tasks data
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const fetchedTasks = await fetchProjectTasks();
        setTasks(fetchedTasks);
        setError(null);
      } catch (err) {
        setError('Failed to load tasks. Please try again later.');
        console.error('Error loading tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [projectName]);

  // Load current user data
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  // Task handlers
  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await addProjectTask({
        ...taskData,
        status: 'Todo',
        comments: []
      });
      setTasks(prevTasks => [...prevTasks, newTask]);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error creating task:', err);
      // You might want to show an error message to the user here
    }
  };

  const handleEditTask = async (updatedTask) => {
    try {
      await editProjectTask(updatedTask.id, updatedTask);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task
        )
      );
      setIsEditModalOpen(false);
      setSelectedTask(null);
    } catch (err) {
      console.error('Error updating task:', err);
      // You might want to show an error message to the user here
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteProjectTask(taskId);
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      // You might want to show an error message to the user here
    }
  };

  const handleChangeStatus = async (task, newStatus) => {
    try {
      const updatedTask = { ...task, status: newStatus };
      await editProjectTask(task.id, updatedTask);
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === task.id ? { ...t, status: newStatus } : t
        )
      );
    } catch (err) {
      console.error('Error updating task status:', err);
      // You might want to show an error message to the user here
    }
  };

  // Get next status in the workflow
  const getNextStatus = (currentStatus) => {
    const currentIndex = statusList.findIndex(s => s.key === currentStatus);
    return currentIndex < statusList.length - 1 ? statusList[currentIndex + 1].key : null;
  };

  // Get previous status in the workflow
  const getPreviousStatus = (currentStatus) => {
    const currentIndex = statusList.findIndex(s => s.key === currentStatus);
    return currentIndex > 0 ? statusList[currentIndex - 1].key : null;
  };

  // Filter tasks based on search query
  const filterTasks = (taskList, status) => {
    return taskList
      .filter(task => task.status === status)
      .filter(task => 
        searchQuery === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.assignedTo && task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()))
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

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, comments: [...(task.comments || []), comment] }
          : task
      )
    );
  };

  const handleFileUpload = (taskId, files) => {
    // Here you would typically upload the files to your backend
    // For now, we'll just update the task with the file information
    const fileList = Array.from(files).map(file => ({
      id: Date.now(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedBy: currentUser?.username || 'Anonymous',
      uploadedAt: new Date().toISOString()
    }));

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              attachments: [...(task.attachments || []), ...fileList]
            }
          : task
      )
    );
  };

  const handleFileSelect = (event, taskId) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileUpload(taskId, files);
    }
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderTaskCard = (task) => {
    const nextStatus = getNextStatus(task.status);
    const previousStatus = getPreviousStatus(task.status);
    const isOverdue = isTaskOverdue(task);

    return (
      <div
        className={`p-4 rounded-lg ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border shadow-sm hover:shadow-md transition-shadow duration-200`}
      >
        {/* Task Header */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {previousStatus && (
              <button
                onClick={() => handleChangeStatus(task, previousStatus)}
                className={`p-1 rounded-full ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
                title={`Move to ${previousStatus}`}
              >
                <ChevronLeft size={16} />
              </button>
            )}
            {nextStatus && (
              <button
                onClick={() => handleChangeStatus(task, nextStatus)}
                className={`p-1 rounded-full ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
                title={`Move to ${nextStatus}`}
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Task Info */}
        <div className="flex items-center justify-between text-sm mt-4">
          <div className="flex items-center gap-2">
            <User size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              {task.assignedTo}
            </span>
          </div>
          <div className={`flex items-center gap-2 ${
            isOverdue ? (darkMode ? 'text-red-400' : 'text-red-600') : (darkMode ? 'text-gray-400' : 'text-gray-500')
          }`}>
            <Clock size={16} />
            <span>{formatDate(task.deadline)}</span>
          </div>
        </div>

        {/* Task Actions */}
        <div className="flex justify-end items-center gap-2 mt-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileSelect(e, task.id)}
            className="hidden"
            multiple
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-lg ${
              darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Upload Files"
          >
            <Upload size={16} />
          </button>
          <button
            onClick={() => openViewModal(task)}
            className={`p-2 rounded-lg ${
              darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => openEditModal(task)}
            className={`p-2 rounded-lg ${
              darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Edit Task"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteTask(task.id)}
            className={`p-2 rounded-lg ${
              darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Delete Task"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* File Attachments */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Attachments:
            </div>
            <div className="space-y-1">
              {task.attachments.map(file => (
                <div
                  key={file.id}
                  className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <File size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {file.name}
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                  <button
                    onClick={() => window.open(file.url, '_blank')}
                    className={`p-1 rounded-lg ${
                      darkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                    }`}
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className={`min-h-screen p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{projectName || 'My Tasks'}</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              darkMode
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors`}
          >
            <Plus size={20} />
            Add Task
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className={`flex items-center gap-2 p-2 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-transparent focus:outline-none ${
                darkMode ? 'text-white' : 'text-gray-700'
              }`}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-red-900' : 'bg-red-100'} ${darkMode ? 'text-red-200' : 'text-red-700'}`}>
            <p>{error}</p>
          </div>
        )}

        {/* Task Columns */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statusList.map((status) => (
              <div
                key={status.key}
                className={`p-4 rounded-lg ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full bg-${status.color}-500`}
                  ></span>
                  {status.key}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({filterTasks(tasks, status.key).length})
                  </span>
                </h2>
                <div className="space-y-4">
                  {filterTasks(tasks, status.key).map((task) => renderTaskCard(task))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        {isAddModalOpen && (
          <AddTaskModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleCreateTask}
            darkMode={darkMode}
          />
        )}

        {isEditModalOpen && selectedTask && (
          <EditTaskModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedTask(null);
            }}
            task={selectedTask}
            onSubmit={handleEditTask}
            darkMode={darkMode}
          />
        )}

        {isViewModalOpen && selectedTask && (
          <ViewTaskModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedTask(null);
            }}
            task={selectedTask}
            onAddComment={handleAddComment}
            darkMode={darkMode}
          />
        )}
      </div>
    </Layout>
  );
};

export default MyTask; 