import { X, AlertCircle, Search, ChevronDown, UserCheck, Upload, File, Trash2 } from 'lucide-react';
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

const AddTaskModal = ({ isOpen, onClose, onSubmit, projectDeadline }) => {
  const { darkMode } = useTheme();
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    assignedTo: null,
    attachments: []
  });
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setTaskData({
        title: '',
        description: '',
        deadline: '',
        priority: 'medium',
        assignedTo: null,
        attachments: []
      });
      setError('');
      setSearchTerm('');
      setIsDropdownOpen(false);
      setDragActive(false);
    }
  }, [isOpen]);

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

  // File handling functions
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));

    setTaskData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newFiles]
    }));
  };

  const removeFile = (fileId) => {
    setTaskData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(file => file.id !== fileId)
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate deadline against project deadline
    if (projectDeadline && new Date(taskData.deadline) > new Date(projectDeadline)) {
      setError('Task deadline cannot be later than the project deadline');
      return;
    }

    onSubmit({
      ...taskData,
      assignedTo: taskData.assignedTo ? taskData.assignedTo.name : ''
    });
    setTaskData({
      title: '',
      description: '',
      deadline: '',
      priority: 'medium',
      assignedTo: null,
      attachments: []
    });
    setError('');
    onClose();
  };

  const handleUserSelect = (user) => {
    setTaskData(prev => ({
      ...prev,
      assignedTo: user
    }));
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleUserRemove = () => {
    setTaskData(prev => ({
      ...prev,
      assignedTo: null
    }));
  };

  if (!isOpen) return null;

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
            Create New Task
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
                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
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
                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                rows="3"
                className={`w-full rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } p-2.5 focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter task description"
              />
            </div>

            {/* Deadline Input */}
            <div>
              <label htmlFor="deadline" className={`block text-sm font-medium mb-1 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Deadline * {projectDeadline && (
                  <span className="text-xs ml-1">
                    (Project deadline: {new Date(projectDeadline).toLocaleDateString()})
                  </span>
                )}
              </label>
              <input
                type="date"
                id="deadline"
                required
                min={minDate}
                max={projectDeadline}
                value={taskData.deadline}
                onChange={(e) => {
                  setTaskData({ ...taskData, deadline: e.target.value });
                  setError(''); // Clear error when date is changed
                }}
                className={`w-full rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } p-2.5 focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            {/* Priority Select */}
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
                onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
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

            {/* Assigned To Dropdown */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Assigned To
              </label>
              <div className="relative" ref={dropdownRef}>
                {/* Selected User Display */}
                {taskData.assignedTo ? (
                  <div className="flex items-center justify-between p-2.5 border rounded-lg mb-2">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5" />
                      <div>
                        <div className={darkMode ? 'text-white' : 'text-gray-900'}>{taskData.assignedTo.name}</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{taskData.assignedTo.role}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleUserRemove}
                      className={`p-1 rounded-full hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full flex items-center justify-between p-2.5 border rounded-lg ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Select team member</span>
                    <ChevronDown className="w-5 h-5" />
                  </button>
                )}

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className={`absolute z-10 mt-1 w-full rounded-lg border shadow-lg ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <div className="p-2">
                      <div className="relative">
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search team members..."
                          className={`w-full pl-9 pr-3 py-2 border rounded-md ${
                            darkMode
                              ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredUsers.map(user => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleUserSelect(user)}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                            darkMode ? 'hover:bg-gray-600 text-white' : 'text-gray-900'
                          }`}
                        >
                          <div className="font-medium">{user.name}</div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {user.role}
                          </div>
                        </button>
                      ))}
                      {filteredUsers.length === 0 && (
                        <div className={`px-4 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No team members found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* File Attachments */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Attachments
              </label>
              
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                  transition-all duration-200 ease-in-out
                  ${darkMode 
                    ? 'border-gray-600 hover:border-blue-500' 
                    : 'border-gray-300 hover:border-blue-500'
                  }
                  ${dragActive 
                    ? darkMode 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-blue-500 bg-blue-50'
                    : ''
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className={`w-10 h-10 mx-auto mb-3 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Drag and drop files here, or click to select files
                </p>
              </div>

              {/* File List */}
              {taskData.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {taskData.attachments.map(file => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        darkMode 
                          ? 'bg-gray-700 border border-gray-600' 
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <File className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                        <div>
                          <p className={`text-sm font-medium ${
                            darkMode ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                            {file.name}
                          </p>
                          <p className={`text-xs ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className={`p-1 rounded-full hover:bg-red-500 hover:text-white transition-colors ${
                          darkMode 
                            ? 'text-gray-400 hover:text-white' 
                            : 'text-gray-500 hover:text-white'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
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
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal; 