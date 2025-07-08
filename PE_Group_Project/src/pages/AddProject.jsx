import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
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
import Layout from "../components/Layout";
import FileUpload from "../components/FileUpload";
import { projectAPI, userAPI, fileAPI } from "../API/apiService";

const AddProject = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

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

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLeaderDropdownOpen, setIsLeaderDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [leaderSearchTerm, setLeaderSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const leaderDropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Load current user data and check permissions
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);

      // Check if user is admin, if not redirect to projects page
      if (user?.role?.toLowerCase() !== "admin") {
        alert("Access denied. Only administrators can create projects.");
        navigate("/my-projects");
        return;
      }
    } else {
      // No user found, redirect to login
      navigate("/login");
      return;
    }
  }, [navigate]);

  // Filter users based on search term (empty array for now)
  const filteredUsers = [];

  // Filter users for project leader based on leader search term (empty array for now)
  const filteredLeaderUsers = [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        leaderDropdownRef.current &&
        !leaderDropdownRef.current.contains(event.target)
      ) {
        setIsLeaderDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const users = await userAPI.getAllUsers();
        setAllUsers(users);
      } catch (err) {
        setUsersError("Failed to load users");
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
          .map((id) => stringToGuid(id))
          .filter((id) => id !== null),
      };

      console.log("Sending project data:", projectData);
      console.log("Project data JSON:", JSON.stringify(projectData, null, 2));

      // Create project using API
      const createdProject = await projectAPI.createProject(projectData);

      // Upload attachments if any
      if (
        formData.attachments &&
        formData.attachments.length > 0 &&
        createdProject?.projectId
      ) {
        for (const attachment of formData.attachments) {
          if (attachment.file) {
            try {
              await fileAPI.uploadProjectFile(
                attachment.file,
                createdProject.projectId
              );
            } catch (err) {
              console.error(
                "Failed to upload project file:",
                attachment.name,
                err
              );
            }
          }
        }
      }

      // Navigate back to projects page
      navigate("/my-projects");
    } catch (err) {
      console.error("Error creating project:", err);
      console.error("Error response:", err.response);
      console.error("Error data:", err.response?.data);

      // Show more specific error messages
      if (err.response?.status === 400) {
        setError(
          `Bad Request: ${err.response.data || "Invalid data provided"}`
        );
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (err.code === "NETWORK_ERROR") {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(
          err.response?.data || "Failed to create project. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
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
    navigate("/my-projects");
  };

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
    const newFiles = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    }));

    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...newFiles],
    }));
  };

  const removeFile = (fileId) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((file) => file.id !== fileId),
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="text-center mb-8">
            <h2
              className={`text-3xl font-extrabold mb-4 ${
                darkMode
                  ? "bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
                  : "text-gray-900"
              }`}
            >
              Add New Project
            </h2>
            <p
              className={`text-lg ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Create a new project and set up your team for success
            </p>
          </div>

          {/* Form */}
          <div
            className={`${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border rounded-lg shadow-xl overflow-hidden`}
          >
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
                  {allUsers.map((user) => (
                    <option
                      key={user.userId || user.UserId}
                      value={user.userId || user.UserId}
                    >
                      {user.username || user.Username} (
                      {user.email || user.Email})
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
                
                {/* Selected Contributors Tags */}
                {formData.contributors.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {formData.contributors.map((contributorId) => {
                        const user = allUsers.find(u => (u.userId || u.UserId) === contributorId);
                        const userName = user ? (user.username || user.Username) : contributorId;
                        const userEmail = user ? (user.email || user.Email) : '';
                        
                        return (
                          <div
                            key={contributorId}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 ${
                              darkMode
                                ? "bg-purple-900/30 border-purple-700 text-purple-300"
                                : "bg-purple-50 border-purple-200 text-purple-700"
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              darkMode ? "bg-purple-400" : "bg-purple-500"
                            }`}></div>
                            <span className="text-sm font-medium">{userName}</span>
                            {userEmail && (
                              <span className={`text-xs ${
                                darkMode ? "text-purple-400" : "text-purple-600"
                              }`}>
                                ({userEmail})
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  contributors: prev.contributors.filter(id => id !== contributorId)
                                }));
                              }}
                              className={`ml-1 hover:bg-red-100 hover:text-red-600 rounded-full p-0.5 transition-colors ${
                                darkMode ? "hover:bg-red-900/30 hover:text-red-400" : ""
                              }`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <p className={`text-xs mt-2 ${
                      darkMode ? "text-green-400" : "text-green-600"
                    }`}>
                      {formData.contributors.length} contributor(s) selected
                    </p>
                  </div>
                )}

                {/* Search and Add Contributors */}
                <div className={`border rounded-lg ${
                  darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-white"
                }`}>
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                    <div className="relative">
                      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`} />
                      <input
                        type="text"
                        placeholder="Search contributors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 border-0 bg-transparent focus:ring-0 focus:outline-none ${
                          darkMode ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Available Contributors Grid */}
                  <div className="p-3">
                    {usersLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                        <span className={`ml-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Loading users...
                        </span>
                      </div>
                    ) : usersError ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-red-500">{usersError}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                        {allUsers
                          .filter(user => {
                            const userId = user.userId || user.UserId;
                            const userName = (user.username || user.Username || '').toLowerCase();
                            const userEmail = (user.email || user.Email || '').toLowerCase();
                            const search = searchTerm.toLowerCase();
                            
                            // Don't show already selected contributors
                            if (formData.contributors.includes(userId)) return false;
                            
                            // Filter by search term
                            if (searchTerm && !userName.includes(search) && !userEmail.includes(search)) return false;
                            
                            return true;
                          })
                          .map((user) => {
                            const userId = user.userId || user.UserId;
                            const userName = user.username || user.Username;
                            const userEmail = user.email || user.Email;
                            
                            return (
                              <div
                                key={userId}
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    contributors: [...prev.contributors, userId]
                                  }));
                                  setSearchTerm('');
                                }}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                                  darkMode
                                    ? "hover:bg-gray-600 border-transparent hover:border-purple-500"
                                    : "hover:bg-gray-50 border-transparent hover:border-purple-300"
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                  darkMode
                                    ? "bg-purple-900/50 text-purple-300"
                                    : "bg-purple-100 text-purple-700"
                                }`}>
                                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${
                                    darkMode ? "text-white" : "text-gray-900"
                                  }`}>
                                    {userName}
                                  </p>
                                  <p className={`text-xs truncate ${
                                    darkMode ? "text-gray-400" : "text-gray-500"
                                  }`}>
                                    {userEmail}
                                  </p>
                                </div>
                                <UserCheck className={`w-4 h-4 ${
                                  darkMode ? "text-gray-400" : "text-gray-500"
                                }`} />
                              </div>
                            );
                          })}
                        
                        {/* No Results Message */}
                        {allUsers.filter(user => {
                          const userId = user.userId || user.UserId;
                          const userName = (user.username || user.Username || '').toLowerCase();
                          const userEmail = (user.email || user.Email || '').toLowerCase();
                          const search = searchTerm.toLowerCase();
                          
                          if (formData.contributors.includes(userId)) return false;
                          if (searchTerm && !userName.includes(search) && !userEmail.includes(search)) return false;
                          
                          return true;
                        }).length === 0 && (
                          <div className="text-center py-8">
                            <Users className={`w-12 h-12 mx-auto mb-3 ${
                              darkMode ? "text-gray-600" : "text-gray-400"
                            }`} />
                            <p className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}>
                              {searchTerm ? 'No users found matching your search' : 'All available users have been selected'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
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
                    // You can store the file info in formData if needed
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
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddProject;
