import { X, AlertCircle, Search, ChevronDown, UserCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';

// Mock users data (replace with API call later)
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john.doe@company.com', role: 'Frontend Developer' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com', role: 'Backend Developer' },
  { id: 3, name: 'Mike Johnson', email: 'mike.johnson@company.com', role: 'UI/UX Designer' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah.wilson@company.com', role: 'Project Manager' },
  { id: 5, name: 'David Brown', email: 'david.brown@company.com', role: 'Full Stack Developer' },
  { id: 6, name: 'Lisa Davis', email: 'lisa.davis@company.com', role: 'QA Engineer' }
];

const EditTaskModal = ({ isOpen, task, onClose, onSubmit }) => {
  const { darkMode } = useTheme();
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    assignedTo: '',
    status: 'Todo'
  });
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Get tomorrow's date as the minimum date for the deadline
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Filter users based on search term
  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initialize form with task data when modal is opened
  useEffect(() => {
    if (task && isOpen) {
      // Find the assigned user from mockUsers
      const assignedUser = mockUsers.find(user => user.name === task.assignedTo);
      
      setTaskData({
        id: task.id,
        title: task.title,
        description: task.description,
        deadline: task.deadline,
        priority: task.priority || 'medium',
        status: task.status || 'Todo',
        assignedTo: assignedUser ? assignedUser.name : task.assignedTo,
        comments: task.comments || []
      });
      setError('');
      setSearchTerm('');
      setIsDropdownOpen(false);
    }
  }, [task, isOpen]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Submit the updated task data while preserving the original task's data
    onSubmit({
      ...task,
      ...taskData,
      id: task.id,
      comments: task.comments || []
    });
    
    onClose();
  };

  const handleUserSelect = (user) => {
    setTaskData(prev => ({
      ...prev,
      assignedTo: user.name
    }));
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleUserRemove = () => {
    setTaskData(prev => ({
      ...prev,
      assignedTo: ''
    }));
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full max-w-2xl rounded-lg shadow-xl ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } p-6`}>
          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute right-4 top-4 p-1 rounded-full ${
              darkMode
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <h2 className={`text-2xl font-bold mb-6 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Edit Task
          </h2>

          {/* Error Message */}
          {error && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              darkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-600'
            }`}>
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className={`block text-sm font-medium mb-1 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Task Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={taskData.title}
                onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } p-2.5 focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter task title"
              />
            </div>

            {/* Description Input */}
            <div>
              <label htmlFor="description" className={`block text-sm font-medium mb-1 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Description *
              </label>
              <textarea
                id="description"
                required
                value={taskData.description}
                onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
                rows="3"
                className={`w-full rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } p-2.5 focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter task description"
              />
            </div>

            {/* Status Input */}
            <div>
              <label htmlFor="status" className={`block text-sm font-medium mb-1 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Status *
              </label>
              <select
                id="status"
                required
                value={taskData.status}
                onChange={(e) => setTaskData(prev => ({ ...prev, status: e.target.value }))}
                className={`w-full rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } p-2.5 focus:ring-2 focus:ring-blue-500`}
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Priority Input */}
            <div>
              <label htmlFor="priority" className={`block text-sm font-medium mb-1 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Priority *
              </label>
              <select
                id="priority"
                required
                value={taskData.priority}
                onChange={(e) => setTaskData(prev => ({ ...prev, priority: e.target.value }))}
                className={`w-full rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } p-2.5 focus:ring-2 focus:ring-blue-500`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Deadline Input */}
            <div>
              <label htmlFor="deadline" className={`block text-sm font-medium mb-1 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Deadline *
              </label>
              <input
                type="date"
                id="deadline"
                required
                min={minDate}
                value={taskData.deadline}
                onChange={(e) => setTaskData(prev => ({ ...prev, deadline: e.target.value }))}
                className={`w-full rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } p-2.5 focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            {/* Assigned To Input */}
            <div className="relative" ref={dropdownRef}>
              <label className={`block text-sm font-medium mb-1 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Assigned To *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onClick={() => setIsDropdownOpen(true)}
                  placeholder={taskData.assignedTo || "Search users..."}
                  className={`w-full rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } p-2.5 pr-10 focus:ring-2 focus:ring-blue-500`}
                />
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`absolute inset-y-0 right-0 flex items-center px-2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              {/* Selected User */}
              {taskData.assignedTo && (
                <div className={`mt-2 p-2 rounded-lg flex items-center justify-between ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <UserCheck className={`w-5 h-5 ${
                      darkMode ? 'text-green-400' : 'text-green-600'
                    }`} />
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                      {taskData.assignedTo}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleUserRemove}
                    className={`p-1 rounded-full ${
                      darkMode
                        ? 'hover:bg-gray-600 text-gray-400'
                        : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className={`absolute z-10 mt-1 w-full rounded-lg shadow-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-white'
                } border ${
                  darkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleUserSelect(user)}
                        className={`w-full text-left px-4 py-2 first:rounded-t-lg last:rounded-b-lg ${
                          darkMode
                            ? 'hover:bg-gray-600 text-gray-200'
                            : 'hover:bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="font-medium">{user.name}</div>
                        <div className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {user.role}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className={`px-4 py-2 text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      No users found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal; 