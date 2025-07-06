import { X, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect } from 'react';

const AddTaskModal = ({ onClose, onSave }) => {
  const { darkMode } = useTheme();
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    assignedTo: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get tomorrow's date as the minimum date for the deadline
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Reset form when modal is opened
  useEffect(() => {
    setTaskData({
      title: '',
      description: '',
      deadline: '',
      priority: 'medium',
      assignedTo: ''
    });
    setError('');
    setIsSubmitting(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Basic validation
      if (!taskData.title.trim()) {
        setError('Task title is required.');
        return;
      }

      if (!taskData.description.trim()) {
        setError('Task description is required.');
        return;
      }

      if (!taskData.deadline) {
        setError('Task deadline is required.');
        return;
      }

      // Validate GUID format for assignedTo if provided
      if (taskData.assignedTo && taskData.assignedTo.trim()) {
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!guidRegex.test(taskData.assignedTo.trim())) {
          setError('Please enter a valid user ID (GUID format).');
          return;
        }
      }

      // Call the onSave function with the task data
      await onSave({
        title: taskData.title,
        description: taskData.description,
        deadline: taskData.deadline,
        priority: taskData.priority,
        assignedTo: taskData.assignedTo.trim() || '00000000-0000-0000-0000-000000000000'
      });

      // Reset form and close modal
      setTaskData({
        title: '',
        description: '',
        deadline: '',
        priority: 'medium',
        assignedTo: ''
      });
      setError('');
      onClose();
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                Deadline *
              </label>
              <input
                type="date"
                id="deadline"
                required
                min={minDate}
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

            {/* Assigned To Input */}
            <div>
              <label htmlFor="assignedTo" className={`block text-sm font-medium mb-1 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Assigned To (User ID)
              </label>
              <input
                type="text"
                id="assignedTo"
                value={taskData.assignedTo}
                onChange={(e) => setTaskData({ ...taskData, assignedTo: e.target.value })}
                className={`w-full rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } p-2.5 focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter user ID (GUID) or leave empty for default"
              />
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Enter the user ID (GUID) of the person assigned to this task. Leave empty to use default.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal; 