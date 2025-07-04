import { useTheme } from '../context/ThemeContext';
import { X, Clock, User, Calendar, AlertCircle, Send, MessageSquare } from 'lucide-react';
import { useState } from 'react';

const ViewTaskModal = ({ task, onClose, onAddComment }) => {
  const { darkMode } = useTheme();
  const [newComment, setNewComment] = useState('');

  if (!task) return null;

  // Initialize comments array if it doesn't exist
  const comments = task.comments || [];

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCommentDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment.trim());
    setNewComment('');
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800',
      medium: darkMode ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      high: darkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Todo': darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800',
      'In Progress': darkMode ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      'Completed': darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-800'
    };
    return colors[status] || colors['Todo'];
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
            Task Details
          </h2>

          <div className="space-y-6">
            {/* Task Title */}
            <div>
              <h3 className={`text-xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {task.title}
              </h3>
            </div>

            {/* Status and Priority */}
            <div className="flex flex-wrap gap-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                <AlertCircle className="w-4 h-4" />
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </span>
            </div>

            {/* Description */}
            <div>
              <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </h4>
              <div className={`p-3 rounded-lg ${
                darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {task.description || 'No description provided'}
                </p>
              </div>
            </div>

            {/* Assignment */}
            <div>
              <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Assigned To
              </h4>
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <User className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {task.assignedTo || 'Unassigned'}
                </span>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Deadline */}
              <div>
                <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Deadline
                </h4>
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <Calendar className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {formatDate(task.deadline)}
                  </span>
                </div>
              </div>

              {/* Time Remaining */}
              {task.status !== 'Completed' && (
                <div>
                  <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Time Remaining
                  </h4>
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <Clock className={`w-4 h-4 ${
                      new Date(task.deadline) < new Date()
                        ? darkMode ? 'text-red-400' : 'text-red-500'
                        : darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <span className={`text-sm ${
                      new Date(task.deadline) < new Date()
                        ? darkMode ? 'text-red-400' : 'text-red-600'
                        : darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {new Date(task.deadline) < new Date() ? 'Overdue' : 'Due ' + formatDate(task.deadline)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <h4 className={`text-sm font-medium mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <MessageSquare className="w-4 h-4" />
                Comments
              </h4>

              {/* Comment Input */}
              <div className={`flex gap-2 mb-4`}>
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className={`flex-1 px-4 py-2 rounded-lg text-sm ${
                    darkMode
                      ? 'bg-gray-700/50 text-white placeholder-gray-400 border-gray-600'
                      : 'bg-gray-50 text-gray-900 placeholder-gray-500 border-gray-300'
                  } border focus:outline-none focus:ring-2 ${
                    darkMode ? 'focus:ring-blue-500/50' : 'focus:ring-blue-500/50'
                  }`}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddComment();
                    }
                  }}
                />
                <button
                  onClick={handleAddComment}
                  className={`p-2 rounded-lg ${
                    darkMode
                      ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-lg ${
                      darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`font-medium text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {comment.author}
                      </span>
                      <span className={`text-xs ${
                        darkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {formatCommentDate(comment.timestamp)}
                      </span>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {comment.text}
                    </p>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    No comments yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                darkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTaskModal; 