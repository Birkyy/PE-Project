import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useTheme } from '../context/ThemeContext';
import { Plus, Edit, Trash2, Search, MoveRight, Clock, Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';

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

// Mock project data (replace with API call later)
const mockProjects = [
  {
    name: 'Project Alpha',
    description: 'Web application development with modern React framework',
    dueDate: '2024-12-20',
    progress: 75,
    color: 'purple'
  },
  {
    name: 'Project Beta',
    description: 'Mobile application with cross-platform compatibility',
    dueDate: '2025-01-15',
    progress: 50,
    color: 'cyan'
  },
  {
    name: 'Project Gamma',
    description: 'AI-powered analytics dashboard for business intelligence',
    dueDate: '2025-02-28',
    progress: 25,
    color: 'pink'
  }
];

const initialTasks = [
  { 
    id: 1, 
    title: 'Design UI', 
    status: 'Todo', 
    description: 'Design the user interface.',
    deadline: '2024-03-25', // Example date
    priority: 'high',
    assignedTo: 'John Doe'
  },
  { 
    id: 2, 
    title: 'Setup Backend', 
    status: 'In Progress', 
    description: 'Setup backend API.',
    deadline: '2024-03-30',
    priority: 'medium',
    assignedTo: 'Jane Smith'
  },
  { 
    id: 3, 
    title: 'Write Tests', 
    status: 'Completed', 
    description: 'Write unit tests.',
    deadline: '2024-03-20',
    priority: 'low',
    assignedTo: 'Mike Johnson'
  }
];

const MyTask = () => {
  const { projectName } = useParams();
  const { darkMode } = useTheme();
  const [tasks, setTasks] = useState(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);

  // Load project data
  useEffect(() => {
    const project = mockProjects.find(p => p.name === decodeURIComponent(projectName));
    if (project) {
      setCurrentProject(project);
    }
  }, [projectName]);

  // Task handlers
  const handleCreateTask = (taskData) => {
    const newTask = {
      id: tasks.length + 1,
      ...taskData,
      status: 'Todo', // Always start with Todo status
    };
    setTasks([...tasks, newTask]);
  };

  const handleEditTask = (updatedTask) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleChangeStatus = (task, newStatus) => {
    setTasks(tasks.map(t => 
      t.id === task.id ? { ...t, status: newStatus } : t
    ));
  };

  // Get next status in the workflow
  const getNextStatus = (currentStatus) => {
    const currentIndex = statusList.findIndex(s => s.key === currentStatus);
    return currentIndex < statusList.length - 1 ? statusList[currentIndex + 1].key : null;
  };

  // Filter tasks based on search query
  const filterTasks = (taskList, status) => {
    return taskList
      .filter(task => task.status === status)
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

  const renderTaskCard = (task) => {
    const isOverdue = isTaskOverdue(task);
    const priorityColors = {
      low: darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800',
      medium: darkMode ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      high: darkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-800'
    };

    return (
      <div
        key={task.id}
        className={`p-4 rounded-lg mb-3 ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        } shadow-sm`}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {task.title}
          </h3>
          <div className="flex items-center gap-2">
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
                </div>
                <div className="flex-1 space-y-4">
                  {filterTasks(tasks, key).length === 0 && (
                    <div className={`text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {searchQuery ? 'No matching tasks' : 'No tasks'}
                    </div>
                  )}
                  {filterTasks(tasks, key).map(renderTaskCard)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateTask}
        projectDeadline={currentProject?.dueDate}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleEditTask}
        projectDeadline={currentProject?.dueDate}
        task={selectedTask}
      />
    </Layout>
  );
};

export default MyTask; 