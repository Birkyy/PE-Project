import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Calendar,
  Users,
  Save,
  X,
  Search,
  ChevronDown,
  UserCheck,
  Upload,
  File,
  Trash2,
} from "lucide-react";
import FileUpload from "./FileUpload";
import ContributorSelector from "./ContributorSelector";
import { projectAPI, userAPI, fileAPI } from "../API/apiService";

const AddProjectModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const { darkMode } = useTheme();

  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    date: "",
    priorityLevel: "Low",
    status: "Todo",
    projectManagerInCharge: "",
    contributors: [],
    attachments: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [projectFiles, setProjectFiles] = useState([]);

  // Load current user data and check permissions
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
    }
  }, []);

  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      // Reset form when modal opens
      setFormData({
        projectName: "",
        description: "",
        date: "",
        priorityLevel: "Low",
        status: "Todo",
        projectManagerInCharge: "",
        contributors: [],
        attachments: [],
      });
      setError(null);
      setProjectFiles([]);
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const users = await userAPI.getAllUsers();
      setAllUsers(users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsersError("Failed to load users. Please try again.");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic validation
    if (!formData.projectName.trim()) {
      setError("Project name is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Helper function to convert string to GUID
      const stringToGuid = (str) => {
        if (!str || str.trim() === "") return null;
        const trimmed = str.trim();
        // Basic GUID validation
        const guidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!guidRegex.test(trimmed)) {
          console.error("Invalid GUID format:", trimmed);
          return null;
        }
        return trimmed;
      };

      // Convert form data to match the API DTO structure
      const projectData = {
        ProjectName: formData.projectName,
        Description: formData.description,
        Date: formData.date
          ? new Date(formData.date).toISOString()
          : new Date().toISOString(),
        Status: formData.status,
        PriorityLevel: formData.priorityLevel,
        ProjectManagerInCharge:
          stringToGuid(formData.projectManagerInCharge) ||
          "00000000-0000-0000-0000-000000000000",
        Contributors: formData.contributors
          .map((contributor) =>
            stringToGuid(
              contributor.userId || contributor.UserId || contributor.id
            )
          )
          .filter((id) => id !== null),
      };

      console.log("Sending project data:", projectData);

      // Create project using API
      const createdProject = await projectAPI.createProject(projectData);

      console.log("Project created:", createdProject);

      // Handle file uploads if any (upload in parallel after project is created)
      if (formData.attachments.length > 0 && createdProject.projectId) {
        await Promise.all(
          formData.attachments.map(async (fileObj) => {
            console.log("Uploading file object:", fileObj);
            if (fileObj.originalFile) {
              try {
                await fileAPI.uploadProjectFile(
                  fileObj.originalFile,
                  createdProject.projectId
                );
              } catch (err) {
                console.error("Error uploading file:", err);
              }
            }
          })
        );
      }

      // Call the onSubmit callback with the created project
      if (onSubmit) {
        await onSubmit(createdProject);
      }

      // Close the modal
      onClose();
    } catch (err) {
      console.error("Error creating project:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create project. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  // Filter users for dropdowns: only show users with role 'user'
  const userRoleUsers = allUsers.filter(
    (u) => (u.role || u.Role || "").toLowerCase() === "user"
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full max-w-4xl rounded-lg shadow-xl ${
            darkMode ? "bg-gray-800" : "bg-white"
          } max-h-[90vh] overflow-y-auto`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute right-4 top-4 z-10 p-1 rounded-full ${
              darkMode
                ? "hover:bg-gray-700 text-gray-400 hover:text-gray-300"
                : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2
              className={`text-2xl font-bold ${
                darkMode
                  ? "bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
                  : "text-gray-900"
              }`}
            >
              Add New Project
            </h2>
            <p
              className={`text-sm mt-1 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Create a new project and set up your team for success
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Project Name */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Project Name *
              </label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                placeholder="Enter project name"
                required
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500"
                }`}
              />
            </div>

            {/* Description */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your project goals and objectives"
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 resize-none ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500"
                }`}
              />
            </div>

            {/* Project Manager */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Project Manager
              </label>
              <select
                name="projectManagerInCharge"
                value={formData.projectManagerInCharge || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    projectManagerInCharge: e.target.value,
                  }))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                disabled={usersLoading}
              >
                <option value="">Select a project manager</option>
                {userRoleUsers.map((user) => (
                  <option
                    key={user.userId || user.UserId}
                    value={user.userId || user.UserId}
                  >
                    {user.username || user.Username} ({user.email || user.Email}
                    )
                  </option>
                ))}
              </select>
              {usersLoading && (
                <p className="text-xs mt-1 text-gray-400">Loading users...</p>
              )}
              {usersError && (
                <p className="text-xs mt-1 text-red-400">{usersError}</p>
              )}
            </div>

            {/* Contributors */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Contributors
              </label>
              <ContributorSelector
                availableUsers={userRoleUsers}
                selectedContributors={formData.contributors}
                onChange={(contributors) => {
                  setFormData((prev) => ({
                    ...prev,
                    contributors: contributors,
                  }));
                }}
                disabled={usersLoading}
                loading={usersLoading}
                error={usersError}
                placeholder="Search and select contributors..."
              />
            </div>

            {/* Due Date and Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Due Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:border-purple-400"
                      : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Priority Level
                </label>
                <select
                  name="priorityLevel"
                  value={formData.priorityLevel}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:border-purple-400"
                      : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                  }`}
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-purple-400"
                    : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                }`}
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* File Attachments */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Attachments
              </label>
              <FileUpload
                onFileUploaded={(fileInfo) => {
                  console.log("File uploaded for project:", fileInfo);
                  setFormData((prev) => ({
                    ...prev,
                    attachments: [...prev.attachments, fileInfo],
                  }));
                }}
                category="project"
                maxFiles={10}
                acceptedTypes=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi,.zip,.rar"
                maxFileSize={50 * 1024 * 1024} // 50MB
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400/50 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Save className="w-5 h-5 mr-2" />
                {isSubmitting ? "Creating Project..." : "Create Project"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className={`flex-1 flex items-center justify-center px-6 py-3 border rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400/50 ${
                  darkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </button>
            </div>

            {projectFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Uploaded Files:</h4>
                <ul className="list-disc pl-5">
                  {projectFiles.map((file) => (
                    <li key={file.fileId || file.name}>
                      <a
                        href={file.url || file.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {file.fileName || file.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;
