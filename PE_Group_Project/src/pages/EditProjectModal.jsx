import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { X, Upload, Trash2, File, Search, UserCheck, Users } from "lucide-react";
import { userAPI, fileAPI } from "../API/apiService";

function EditProjectModal({ isOpen, onClose, onSubmit, project, loading }) {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    status: "",
    priorityLevel: "",
    date: "",
    files: [],
    projectManagerInCharge: "",
    contributors: [],
  });
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [projectReady, setProjectReady] = useState(false);
  const [projectFiles, setProjectFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Ensure IDs are always strings for dropdown compatibility
  function toStringId(id) {
    return id ? String(id) : "";
  }

  // Set form data when project changes and users are loaded
  useEffect(() => {
    if (project && allUsers.length > 0) {
      setFormData({
        projectName: project.projectName || "",
        description: project.description,
        status: project.status || "",
        priorityLevel: project.priorityLevel || "",
        date: project.date ? project.date.slice(0, 10) : "",
        files: project.attachments || [],
        projectManagerInCharge: toStringId(project.projectManagerInCharge),
        contributors: Array.isArray(project.contributors)
          ? project.contributors.map(toStringId)
          : [],
      });
      setProjectReady(true);
    }
  }, [project, allUsers]);

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

  // Fetch project files when project changes
  useEffect(() => {
    async function fetchFiles() {
      if (project && project.projectId) {
        try {
          const files = await fileAPI.getFilesByProjectId(project.projectId);
          setProjectFiles(files || []);
        } catch (err) {
          setProjectFiles([]);
        }
      }
    }
    fetchFiles();
  }, [project]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setFileError(`File ${file.name} is too large. Maximum size is 5MB.`);
      return false;
    }
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setFileError("");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter(validateFile);

      if (validFiles.length > 0) {
        setFormData((prev) => ({
          ...prev,
          files: [
            ...prev.files,
            ...validFiles.map((file) => ({
              id: Date.now() + Math.random(),
              name: file.name,
              size: file.size,
              type: file.type,
              file: file,
            })),
          ],
        }));
      }
    }
  };

  const handleFileInput = (e) => {
    setFileError("");
    const files = Array.from(e.target.files);
    const validFiles = files.filter(validateFile);

    if (validFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        files: [
          ...prev.files,
          ...validFiles.map((file) => ({
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            file: file,
          })),
        ],
      }));
    }
  };

  const removeFile = (fileId) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.id !== fileId),
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Map formData to backend DTO field names
    const payload = {
      projectName: formData.projectName,
      Description: formData.description,
      status: formData.status,
      priorityLevel: formData.priorityLevel,
      date: formData.date,
      projectManagerInCharge: formData.projectManagerInCharge,
      contributors: formData.contributors,
      // Add attachments if needed
    };
    onSubmit(payload);
  };

  const handleProjectFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!project || !project.projectId) return;
    setUploading(true);
    for (const file of files) {
      try {
        await fileAPI.uploadProjectFile(file, project.projectId);
      } catch (err) {
        // Optionally show error
      }
    }
    // Refresh file list
    const filesList = await fileAPI.getFilesByProjectId(project.projectId);
    setProjectFiles(filesList || []);
    setUploading(false);
  };

  const handleDownload = (file) => {
    if (file.url) {
      window.open(file.url, "_blank");
    }
  };

  const handleDelete = async (file) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await fileAPI.deleteProjectFile(project.projectId, file.name);
      const filesList = await fileAPI.getFilesByProjectId(project.projectId);
      setProjectFiles(filesList || []);
    } catch (err) {
      // Optionally show error
    }
  };

  // Filter out admin users for dropdowns
  const nonAdminUsers = allUsers.filter(user => user.role?.toLowerCase() !== 'admin');

  if (!isOpen || usersLoading || !projectReady) return null;
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div
          className={`w-full max-w-2xl mx-auto ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } border rounded-lg shadow-xl p-6 flex flex-col items-center justify-center`}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
          <p className={darkMode ? "text-white" : "text-gray-900"}>
            Loading project details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black opacity-50"></div>

        <div
          className={`relative w-full max-w-2xl p-6 rounded-lg shadow-lg ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2
              className={`text-xl font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Edit Project
            </h2>
            <button
              onClick={onClose}
              className={`p-1 rounded-full ${
                darkMode
                  ? "hover:bg-gray-700 text-gray-400"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className={`block mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Project Name
              </label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    projectName: e.target.value,
                  }))
                }
                className={`w-full p-2 border rounded-lg ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                required
              />
            </div>

            <div>
              <label
                className={`block mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className={`w-full p-2 border rounded-lg ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                rows="3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className={`block mb-1 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className={`w-full p-2 border rounded-lg ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label
                  className={`block mb-1 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Priority Level
                </label>
                <select
                  value={formData.priorityLevel}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priorityLevel: e.target.value,
                    }))
                  }
                  className={`w-full p-2 border rounded-lg ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                >
                  <option value="">Select Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label
                className={`block mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Due Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
                className={`w-full p-2 border rounded-lg ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                required
              />
            </div>

            {/* File Upload Section */}
            <div>
              <label
                className={`block mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Attachments
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                  dragActive
                    ? darkMode
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-blue-500 bg-blue-50"
                    : darkMode
                    ? "border-gray-600 hover:border-gray-500"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload
                    className={`w-8 h-8 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Drag and drop files here, or
                  </p>
                  <label
                    className={`px-4 py-2 rounded-lg cursor-pointer ${
                      darkMode
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    Browse Files
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFileInput}
                    />
                  </label>
                </div>
              </div>

              {fileError && (
                <p className="mt-2 text-sm text-red-500">{fileError}</p>
              )}

              {/* File List */}
              {formData.files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.files.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        darkMode ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <File
                          className={`w-4 h-4 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              darkMode ? "text-white" : "text-gray-900"
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
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className={`p-1 rounded-full ${
                          darkMode
                            ? "hover:bg-gray-600 text-gray-400"
                            : "hover:bg-gray-200 text-gray-500"
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Project Manager */}
            <div>
              <label
                className={`block mb-1 ${
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
                className={`w-full p-2 border rounded-lg ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                disabled={usersLoading}
              >
                <option value="">Select a project manager</option>
                {nonAdminUsers.map((user) => (
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
                className={`block mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Contributors
              </label>
<<<<<<< Updated upstream
              
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
=======
              <select
                name="contributors"
                multiple
                value={formData.contributors}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  setFormData((prev) => ({ ...prev, contributors: selected }));
                }}
                className={`w-full p-2 border rounded-lg ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                disabled={usersLoading}
                size={Math.min(6, nonAdminUsers.length)}
              >
                {nonAdminUsers.map((user) => (
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
              {formData.contributors && formData.contributors.length > 0 && (
                <div className="mt-2">
                  <p
                    className={`text-xs ${
                      darkMode ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    Contributors: {formData.contributors.length} user(s) added
>>>>>>> Stashed changes
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

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-lg ${
                  darkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
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
}

export default EditProjectModal;
