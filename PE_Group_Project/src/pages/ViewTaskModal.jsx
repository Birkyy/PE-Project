import { useTheme } from "../context/ThemeContext";
import {
  X,
  Clock,
  User,
  Calendar,
  AlertCircle,
  File,
  Download,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import CommentList from "../components/CommentList";

const ViewTaskModal = ({
  task,
  onClose,
  onAddComment,
  onEditComment,
  onDeleteComment,
  currentUser,
}) => {
  const { darkMode } = useTheme();

  if (!task) return null;

  // Initialize comments array if it doesn't exist
  const comments = task.comments || [];
  // Initialize attachments array if it doesn't exist
  const attachments = task.attachments || [];

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: darkMode
        ? "bg-blue-500/20 text-blue-300"
        : "bg-blue-100 text-blue-800",
      medium: darkMode
        ? "bg-yellow-500/20 text-yellow-300"
        : "bg-yellow-100 text-yellow-800",
      high: darkMode ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-800",
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      Todo: darkMode
        ? "bg-blue-500/20 text-blue-300"
        : "bg-blue-100 text-blue-800",
      "In Progress": darkMode
        ? "bg-yellow-500/20 text-yellow-300"
        : "bg-yellow-100 text-yellow-800",
      Completed: darkMode
        ? "bg-green-500/20 text-green-300"
        : "bg-green-100 text-green-800",
    };
    return colors[status] || colors["Todo"];
  };

  // Function to handle file download
  const handleDownload = (file) => {
    // In a real implementation, this would download from your backend
    // For now, we'll create a download link for the file object
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full max-w-2xl rounded-lg shadow-xl ${
            darkMode ? "bg-gray-800" : "bg-white"
          } p-6`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute right-4 top-4 p-1 rounded-full ${
              darkMode
                ? "hover:bg-gray-700 text-gray-400 hover:text-gray-300"
                : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <h2
            className={`text-2xl font-bold mb-6 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Task Details
          </h2>

          <div className="space-y-6">
            {/* Task Title */}
            <div>
              <h3
                className={`text-xl font-medium ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {task.title}
              </h3>
            </div>

            {/* Status and Priority */}
            <div className="flex flex-wrap gap-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  task.status
                )}`}
              >
                {task.status}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                  task.priority
                )}`}
              >
                <AlertCircle className="w-4 h-4" />
                {task.priority.charAt(0).toUpperCase() +
                  task.priority.slice(1)}{" "}
                Priority
              </span>
            </div>

            {/* Description */}
            <div>
              <h4
                className={`text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Description
              </h4>
              <div
                className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700/50" : "bg-gray-50"
                }`}
              >
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {task.description || "No description provided"}
                </p>
              </div>
            </div>

            {/* Assignment */}
            <div>
              <h4
                className={`text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Assigned To
              </h4>
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  darkMode ? "bg-gray-700/50" : "bg-gray-50"
                }`}
              >
                <User
                  className={`w-4 h-4 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {task.assignedTo || "Unassigned"}
                </span>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Deadline */}
              <div>
                <h4
                  className={`text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Deadline
                </h4>
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    darkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <Calendar
                    className={`w-4 h-4 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {formatDate(task.deadline)}
                  </span>
                </div>
              </div>

              {/* Time Remaining */}
              {task.status !== "Completed" && (
                <div>
                  <h4
                    className={`text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Time Remaining
                  </h4>
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      darkMode ? "bg-gray-700/50" : "bg-gray-50"
                    }`}
                  >
                    <Clock
                      className={`w-4 h-4 ${
                        new Date(task.deadline) < new Date()
                          ? darkMode
                            ? "text-red-400"
                            : "text-red-500"
                          : darkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        new Date(task.deadline) < new Date()
                          ? darkMode
                            ? "text-red-400"
                            : "text-red-600"
                          : darkMode
                          ? "text-gray-300"
                          : "text-gray-600"
                      }`}
                    >
                      {new Date(task.deadline) < new Date()
                        ? "Overdue"
                        : "Due " + formatDate(task.deadline)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Attachments Section */}
            {attachments.length > 0 && (
              <div>
                <h4
                  className={`text-sm font-medium mb-3 flex items-center gap-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <File className="w-4 h-4" />
                  Attachments ({attachments.length})
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {attachments.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        darkMode
                          ? "bg-gray-700/50 hover:bg-gray-700"
                          : "bg-gray-50 hover:bg-gray-100"
                      } transition-colors`}
                    >
                      <div className="flex items-center space-x-3">
                        <File
                          className={
                            darkMode ? "text-blue-400" : "text-blue-600"
                          }
                        />
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              darkMode ? "text-gray-200" : "text-gray-900"
                            }`}
                          >
                            {file.name}
                          </p>
                          <p
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(file)}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode
                              ? "hover:bg-gray-600 text-gray-400 hover:text-gray-200"
                              : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                          }`}
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {file.url && (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode
                                ? "hover:bg-gray-600 text-gray-400 hover:text-gray-200"
                                : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                            }`}
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="mt-8">
              <CommentList
                comments={comments}
                currentUser={currentUser}
                onAddComment={onAddComment}
                onEditComment={onEditComment}
                onDeleteComment={onDeleteComment}
                taskId={task.projectTaskId}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                darkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
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
