import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  File,
  Download,
  ExternalLink,
  Calendar,
  Users,
  Clock,
  AlertCircle,
  Plus,
  ListTodo,
  Edit,
  Trash2,
  Search,
  MoveRight,
  ChevronRight,
  ChevronLeft,
  User,
  Eye,
  ArrowLeft,
  Filter,
} from "lucide-react";
import Layout from "../components/Layout";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";
import ViewTaskModal from "./ViewTaskModal";
import EditProjectModal from "./EditProjectModal";
import { projectAPI, taskAPI, userAPI, commentAPI } from "../API/apiService";

const statusList = [
  { key: "Todo", color: "blue" },
  { key: "In Progress", color: "yellow" },
  { key: "Completed", color: "green" },
];

// Helper function to check if a task is overdue
const isTaskOverdue = (task) => {
  if (task.status === "Completed") return false;
  if (!task.deadline) return false;
  return new Date(task.deadline) < new Date();
};

// Helper function to validate GUID format
const isValidGuid = (str) => {
  const guidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return guidRegex.test(str);
};

// Helper function to convert string to GUID
const stringToGuid = (str) => {
  // If it's already a valid GUID, return it as is
  if (isValidGuid(str)) {
    return str;
  }

  // Simple hash function to convert string to consistent GUID
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert hash to GUID format
  const hashStr = Math.abs(hash).toString(16).padStart(8, "0");
  return `${hashStr}-0000-0000-0000-000000000000`.substring(0, 36);
};

// Store assigned person names for display
const assignedPersonNames = new Map();

// Helper function to get assigned person name
const getAssignedPersonName = (picGuid) => {
  if (!picGuid || picGuid === "00000000-0000-0000-0000-000000000000") {
    return "Unassigned";
  }
  return assignedNames[picGuid] || "Loading...";
};

function Project() {
  const { darkMode } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Separate states for view and edit modals
  const [viewTask, setViewTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Load current user data
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  // Fetch project data
  useEffect(() => {
    if (id) {
      fetchProject();
      fetchTasks();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const projectData = await projectAPI.getProjectById(id);
      // Normalize description field
      const normalizedProject = {
        ...projectData,
        description: projectData.description || projectData.Description || "",
      };
      setProject(normalizedProject);
    } catch (err) {
      console.error("Error fetching project:", err);
      setError("Failed to fetch project. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const tasksData = await taskAPI.getTasksByProjectId(id);
      setTasks(tasksData || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      // Don't set error here as project might still load
    }
  };

  // Task handlers
  const handleCreateTask = async (taskData) => {
    try {
      // Convert assignedTo string to GUID
      const picGuid = taskData.assignedTo
        ? stringToGuid(taskData.assignedTo)
        : "00000000-0000-0000-0000-000000000000";

      // Store the assigned person's name for display
      if (taskData.assignedTo) {
        assignedPersonNames.set(picGuid, taskData.assignedTo);
      }

      // Map frontend data to backend DTO structure
      const createTaskRequest = {
        projectTaskId: "00000000-0000-0000-0000-000000000000", // Let backend generate this
        projectId: id, // Use the current project ID
        taskName: taskData.title, // Map title to TaskName
        PIC: picGuid, // Convert assignedTo to GUID
        deadline: new Date(taskData.deadline), // Convert string to DateTime
        description: taskData.description,
        status: "Todo", // Default status
        priority: taskData.priority,
      };

      const newTask = await taskAPI.createTask(createTaskRequest);
      setTasks([...tasks, newTask]);
      setIsAddTaskModalOpen(false);
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Failed to create task. Please try again.");
    }
  };

  const handleEditTask = async (updatedTask) => {
    try {
      const taskId = updatedTask.projectTaskId || updatedTask.id;
      const editedTask = await taskAPI.updateTask(taskId, updatedTask);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          (task.projectTaskId || task.id) === taskId ? editedTask : task
        )
      );
      setIsEditModalOpen(false);
      setEditTask(null);
    } catch (err) {
      console.error("Error updating task:", err);
      alert("Failed to update task. Please try again.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      setTasks(tasks.filter((t) => (t.projectTaskId || t.id) !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Failed to delete task. Please try again.");
    }
  };

  const handleChangeStatus = async (task, newStatus) => {
    try {
      const taskId = task.projectTaskId || task.id;
      const updatedTask = await taskAPI.updateTask(taskId, {
        ...task,
        status: newStatus,
      });
      setTasks(
        tasks.map((t) =>
          (t.projectTaskId || t.id) === taskId ? updatedTask : t
        )
      );
    } catch (err) {
      console.error("Error updating task status:", err);
      alert("Failed to update task status. Please try again.");
    }
  };

  // Get next status in the workflow
  const getNextStatus = (currentStatus) => {
    const statusIndex = statusList.findIndex((s) => s.key === currentStatus);
    return statusIndex < statusList.length - 1
      ? statusList[statusIndex + 1].key
      : currentStatus;
  };

  const getPreviousStatus = (currentStatus) => {
    const statusIndex = statusList.findIndex((s) => s.key === currentStatus);
    return statusIndex > 0 ? statusList[statusIndex - 1].key : currentStatus;
  };

  const filterTasks = (taskList, status) => {
    return taskList.filter((task) => task.status === status);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date set";
    return new Date(dateString).toLocaleDateString();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Todo":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const handleDownload = (file) => {
    // Implement file download logic
    console.log("Downloading:", file.name);
  };

  const handleEditProject = async (updatedProject) => {
    try {
      const editedProject = await projectAPI.updateProject(id, updatedProject);
      setProject(editedProject);
      setIsEditProjectModalOpen(false);
    } catch (err) {
      console.error("Error updating project:", err);
      alert("Failed to update project. Please try again.");
    }
  };

  const handleBack = () => {
    navigate("/my-projects");
  };

  const handleAddComment = async (taskId, commentData) => {
    console.log("=== PROJECT: handleAddComment START ===");
    console.log("taskId:", taskId);
    console.log("commentData:", commentData);

    try {
      // Format the comment data according to backend DTO structure
      const formatted = {
        ProjectTaskId: taskId,
        Comment: commentData.comment || commentData.Comment,
        UserId:
          commentData.userId ||
          commentData.UserId ||
          currentUser?.userId ||
          currentUser?.id,
      };

      console.log("=== PROJECT: Formatted comment data ===");
      console.log("Formatted data:", formatted);

      console.log("=== PROJECT: About to call commentAPI.createComment ===");
      const newComment = await commentAPI.createComment(taskId, formatted);
      console.log("=== PROJECT: commentAPI.createComment completed ===");
      console.log("API returned:", newComment);

      // Refresh the tasks to get updated comments
      await fetchTasks();
      console.log("=== PROJECT: Tasks refreshed ===");

      return newComment;
    } catch (error) {
      console.error("=== PROJECT: Error in handleAddComment ===", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      alert("Failed to add comment. Please try again.");
    }
  };

  const handleEditComment = async (commentId, updatedComment) => {
    console.log("=== PROJECT: handleEditComment START ===");
    console.log("commentId:", commentId);
    console.log("updatedComment:", updatedComment);

    try {
      console.log("=== PROJECT: About to call commentAPI.updateComment ===");
      const updated = await commentAPI.updateComment(commentId, {
        Comment: updatedComment.comment || updatedComment.Comment,
      });
      console.log("=== PROJECT: commentAPI.updateComment completed ===");
      console.log("API returned:", updated);

      // Refresh the tasks to get updated comments
      await fetchTasks();
      console.log("=== PROJECT: Tasks refreshed after edit ===");

      return updated;
    } catch (error) {
      console.error("=== PROJECT: Error in handleEditComment ===", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      alert("Failed to edit comment. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    console.log("=== PROJECT: handleDeleteComment START ===");
    console.log("commentId:", commentId);

    try {
      console.log("=== PROJECT: About to call commentAPI.deleteComment ===");
      await commentAPI.deleteComment(commentId);
      console.log("=== PROJECT: commentAPI.deleteComment completed ===");

      // Refresh the tasks to get updated comments
      await fetchTasks();
      console.log("=== PROJECT: Tasks refreshed after deletion ===");
    } catch (error) {
      console.error("=== PROJECT: Error in handleDeleteComment ===", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const renderTaskCard = (task) => {
    const isOverdue = isTaskOverdue(task);
    const taskId = task.projectTaskId || task.id;

    return (
      <div
        key={taskId}
        className={`p-4 rounded-lg border ${
          darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
        } hover:shadow-md transition-all duration-200 cursor-pointer`}
        onClick={() => {
          setViewTask(task);
          setIsViewModalOpen(true);
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <h4
            className={`font-medium ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {task.taskName || task.title}
          </h4>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditTask(task);
                setIsEditModalOpen(true);
              }}
              className={`p-1 rounded ${
                darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"
              }`}
            >
              <Edit className="w-4 h-4 text-blue-500" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTask(taskId);
              }}
              className={`p-1 rounded ${
                darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"
              }`}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        <p
          className={`text-sm mb-3 ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {task.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority?.charAt(0).toUpperCase() +
                task.priority?.slice(1) || "Not Set"}
            </span>
            {isOverdue && (
              <span className="text-xs text-red-500 font-medium">Overdue</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3 h-3" />
            <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
              Due: {formatDate(task.deadline)}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const prevStatus = getPreviousStatus(task.status);
                if (prevStatus !== task.status) {
                  handleChangeStatus(task, prevStatus);
                }
              }}
              disabled={task.status === statusList[0].key}
              className={`p-1 rounded ${
                task.status === statusList[0].key
                  ? "opacity-50 cursor-not-allowed"
                  : darkMode
                  ? "hover:bg-gray-600"
                  : "hover:bg-gray-100"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const nextStatus = getNextStatus(task.status);
                if (nextStatus !== task.status) {
                  handleChangeStatus(task, nextStatus);
                }
              }}
              disabled={task.status === statusList[statusList.length - 1].key}
              className={`p-1 rounded ${
                task.status === statusList[statusList.length - 1].key
                  ? "opacity-50 cursor-not-allowed"
                  : darkMode
                  ? "hover:bg-gray-600"
                  : "hover:bg-gray-100"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div
            className={`text-center ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Loading project...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div
            className={`text-center ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchProject}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div
            className={`text-lg ${darkMode ? "text-red-400" : "text-red-600"}`}
          >
            Project not found
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Back button and Project Title */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBack}
              className={`p-2 rounded-full transition-colors duration-200 ${
                darkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-purple-400"
                  : "hover:bg-gray-100 text-gray-600 hover:text-purple-600"
              }`}
              title="Back to Projects"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1
                className={`text-3xl font-extrabold ${
                  darkMode
                    ? "bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
                    : "text-gray-900"
                }`}
              >
                {project.projectName || project.name}
              </h1>
              {/* Progress Bar */}
              <div
                className={`w-full rounded-full h-3 mt-3 ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <div
                  className={`bg-purple-500 h-3 rounded-full transition-all duration-300`}
                  style={{
                    width: `${
                      tasks.length > 0
                        ? Math.round(
                            (tasks.filter((t) => t.status === "Completed")
                              .length /
                              tasks.length) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <div
                className={`text-xs mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Progress:{" "}
                {tasks.length > 0
                  ? Math.round(
                      (tasks.filter((t) => t.status === "Completed").length /
                        tasks.length) *
                        100
                    )
                  : 0}
                %
              </div>
            </div>
          </div>

          {/* Project Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <h1
                    className={`text-3xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {project.projectName || project.name}
                  </h1>
                  <button
                    onClick={() => setIsEditProjectModalOpen(true)}
                    className={`p-2 rounded-lg ${
                      darkMode
                        ? "hover:bg-gray-700 text-gray-400"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status || "Not Set"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                      project.priorityLevel || project.priority
                    )}`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    {(project.priorityLevel || project.priority || "Not Set")
                      .charAt(0)
                      .toUpperCase() +
                      (
                        project.priorityLevel ||
                        project.priority ||
                        "Not Set"
                      ).slice(1)}{" "}
                    Priority
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsAddTaskModalOpen(true);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  darkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                } transition-colors`}
              >
                <Plus className="w-5 h-5" />
                Add Task
              </button>
            </div>

            {/* Search Bar */}
            <div className="max-w-md mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search
                    className={`h-5 w-5 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Project Info */}
            <div
              className={`p-6 rounded-lg ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } border`}
            >
              <h2
                className={`text-lg font-medium mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Project Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {project.description || "No description available"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar
                    className={`w-5 h-5 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span
                    className={darkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    Due: {formatDate(project.date || project.dueDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users
                    className={`w-5 h-5 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span
                    className={darkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    {project.contributors?.length ||
                      project.teamMembers?.length ||
                      0}{" "}
                    Team Members
                  </span>
                </div>
              </div>
            </div>

            {/* Project Attachments */}
            <div
              className={`p-6 rounded-lg ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } border`}
            >
              <h2
                className={`text-lg font-medium mb-4 flex items-center gap-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <File className="w-5 h-5" />
                Attachments
              </h2>
              <div className="space-y-3">
                {project.attachments && project.attachments.length > 0 ? (
                  project.attachments.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        darkMode ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <File
                          className={`w-5 h-5 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                        <div>
                          <p
                            className={`font-medium ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {file.name}
                          </p>
                          <p
                            className={`text-sm ${
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
                          className={`p-2 rounded-lg ${
                            darkMode
                              ? "hover:bg-gray-600 text-gray-400"
                              : "hover:bg-gray-200 text-gray-600"
                          }`}
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(file.url, "_blank")}
                          className={`p-2 rounded-lg ${
                            darkMode
                              ? "hover:bg-gray-600 text-gray-400"
                              : "hover:bg-gray-200 text-gray-600"
                          }`}
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p
                    className={`text-center py-4 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    No attachments yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tasks Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statusList.map(({ key: status, color }) => (
              <div
                key={status}
                className={`p-4 rounded-lg ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                } border`}
              >
                <h3
                  className={`text-lg font-medium mb-4 flex items-center justify-between ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <span>{status}</span>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${getStatusColor(
                      status
                    )}`}
                  >
                    {filterTasks(tasks, status).length}
                  </span>
                </h3>
                <div className="space-y-3">
                  {filterTasks(tasks, status).map((task) => {
                    const taskId = task.projectTaskId || task.id;
                    return <div key={taskId}>{renderTaskCard(task)}</div>;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSave={handleCreateTask}
        contributors={project.contributors || []}
      />
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditTask(null);
        }}
        onSubmit={handleEditTask}
        task={editTask}
        contributors={project.contributors || []}
      />
      <ViewTaskModal
        task={viewTask}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewTask(null);
        }}
        onAddComment={handleAddComment}
        onEditComment={handleEditComment}
        onDeleteComment={handleDeleteComment}
        currentUser={currentUser}
      />
      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        onSubmit={handleEditProject}
        project={project}
      />
    </Layout>
  );
}

export default Project;
