import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { X, Upload, Trash2, File, Download } from "lucide-react";
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

  const handleSubmit = async (e) => {
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
    await onSubmit(payload);

    // Upload new files after saving changes
    if (project && project.projectId && formData.files.length > 0) {
      for (const fileObj of formData.files) {
        if (fileObj.file) {
          try {
            await fileAPI.uploadProjectFile(fileObj.file, project.projectId);
          } catch (err) {
            // Optionally show error
          }
        }
      }
      // Refresh file list
      const filesList = await fileAPI.getFilesByProjectId(project.projectId);
      setProjectFiles(filesList || []);
      // Optionally clear the files from formData after upload
      setFormData((prev) => ({ ...prev, files: [] }));
    }
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

  const handleDownload = async (file) => {
    try {
      const fileId = file.fileId || file.Id || file.id;
      if (!fileId) {
        alert("File ID not found.");
        return;
      }
      const response = await fileAPI.downloadFile(fileId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.fileName || file.name);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download file.");
      console.error(err);
    }
  };

  const handleDelete = async (file) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      const fileId = file.fileId || file.Id || file.id;
      if (!fileId) {
        alert("File ID not found.");
        return;
      }
      await fileAPI.deleteFileById(fileId);
      const filesList = await fileAPI.getFilesByProjectId(project.projectId);
      setProjectFiles(filesList || []);
    } catch (err) {
      alert("Failed to delete file.");
      console.error(err);
    }
  };

  // Helper to get user display name or fallback
  const getUserDisplayName = (userId) => {
    const user = allUsers.find(
      (u) => (u.userId || u.id || u.UserId) === userId
    );
    return user
      ? `${user.username || user.Username} (${user.email || user.Email})`
      : "Unknown User";
  };

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

              {/* Project Attachments List (existing files) */}
              {projectFiles.length > 0 && (
                <div className="mt-4 mb-2">
                  <label
                    className={`block mb-1 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Project Attachments
                  </label>
                  <ul className="space-y-1">
                    {projectFiles.map((file) => (
                      <li
                        key={file.Id || file.fileId || file.id || file.name}
                        className="flex items-center justify-between"
                      >
                        <span
                          className={`truncate ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {file.fileName || file.name}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleDownload(file)}
                            aria-label="Download"
                            className={`p-1 rounded-full ${
                              darkMode
                                ? "hover:bg-blue-700 text-blue-400"
                                : "hover:bg-blue-100 text-blue-600"
                            }`}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(file)}
                            aria-label="Delete"
                            className={`p-1 rounded-full ${
                              darkMode
                                ? "hover:bg-red-700 text-red-400"
                                : "hover:bg-red-100 text-red-600"
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

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
                {/* If the current value is not in allUsers, show Unknown User */}
                {formData.projectManagerInCharge &&
                  !allUsers.some(
                    (u) =>
                      (u.userId || u.id || u.UserId) ===
                      formData.projectManagerInCharge
                  ) && (
                    <option value={formData.projectManagerInCharge}>
                      Unknown User
                    </option>
                  )}
                {allUsers.map((user) => (
                  <option
                    key={user.userId || user.UserId}
                    value={user.userId || user.UserId}
                  >
                    {user.username || user.Username} ({user.email || user.Email}
                    )
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className={`block mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Contributors
              </label>
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
                size={Math.min(6, allUsers.length)}
              >
                {/* Show Unknown User for any contributor not in allUsers */}
                {formData.contributors.map((contributorId) =>
                  !allUsers.some(
                    (u) => (u.userId || u.id || u.UserId) === contributorId
                  ) ? (
                    <option key={contributorId} value={contributorId}>
                      Unknown User
                    </option>
                  ) : null
                )}
                {allUsers.map((user) => (
                  <option
                    key={user.userId || user.UserId}
                    value={user.userId || user.UserId}
                  >
                    {user.username || user.Username} ({user.email || user.Email}
                    )
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className={`w-full p-2 rounded-lg ${
                darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
              }`}
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProjectModal;
