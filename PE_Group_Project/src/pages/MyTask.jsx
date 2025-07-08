import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { useTheme } from "../context/ThemeContext";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  MoveRight,
  Clock,
  Edit2,
  ChevronRight,
  ChevronLeft,
  User,
  Eye,
  Upload,
  File,
  X,
  Download,
  Filter,
  MoreVertical,
  Calendar,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";
import ViewTaskModal from "./ViewTaskModal";
import { taskAPI, projectAPI, userAPI, commentAPI } from "../API/apiService";

const statusList = [
  { key: "Todo", color: "blue" },
  { key: "In Progress", color: "yellow" },
  { key: "Completed", color: "green" },
];

// Helper function to normalize status values
const normalizeStatus = (status) => {
  const statusLower = status.toLowerCase();
  if (statusLower === "todo" || statusLower === "to do") return "Todo";
  if (
    statusLower === "in progress" ||
    statusLower === "inprogress" ||
    statusLower === "progress"
  )
    return "In Progress";
  if (
    statusLower === "completed" ||
    statusLower === "complete" ||
    statusLower === "done"
  )
    return "Completed";
  return status; // Return original if no match
};

// Helper function to check if a task is overdue
const isTaskOverdue = (task) => {
  if (task.status.toLowerCase() === "completed") return false;
  if (!task.deadline) return false;
  return new Date(task.deadline) < new Date();
};

// Helper function to determine user's role in the project
const getUserProjectRole = (currentUser, project) => {
  if (!currentUser || !project) return null;
  
  const userId = currentUser?.userId || currentUser?.id || currentUser?.UserId;
  
  // Check if user is admin
  if (currentUser?.role?.toLowerCase() === 'admin') {
    return 'admin';
  }
  
  // Check if user is project manager
  if (project.projectManagerInCharge === userId) {
    return 'manager';
  }
  
  // Check if user is contributor
  if (project.contributors && project.contributors.includes(userId)) {
    return 'contributor';
  }
  
  return null;
};

// Helper function to check if user can add tasks
const canUserAddTasks = (currentUser, project) => {
  const role = getUserProjectRole(currentUser, project);
  return role === 'admin' || role === 'manager';
};

// Helper function to check if user can edit/delete tasks
const canUserEditTasks = (currentUser, project) => {
  const role = getUserProjectRole(currentUser, project);
  return role === 'admin' || role === 'manager';
};

const MyTask = () => {
  const { projectName } = useParams();
  const { darkMode } = useTheme();
  const [todoTasks, setTodoTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadingTaskId, setUploadingTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Load project data and tasks
  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, get all projects to find the current project
        const allProjects = await projectAPI.getAllProjects();
        console.log("All projects:", allProjects);
        console.log("Looking for project:", decodeURIComponent(projectName));

        const project = allProjects.find(
          (p) => p.projectName === decodeURIComponent(projectName)
        );
        console.log("Found project:", project);

        if (project) {
          setCurrentProject({
            name: project.projectName,
            description: project.description || "",
            dueDate: project.date,
            progress: 0, // You can calculate this based on completed tasks
            color: "purple",
            projectId: project.projectId, // Add projectId to currentProject
          });

          console.log("Project ID for task fetching:", project.projectId);

          // First, let's get all tasks to see what's available
          const allTasks = await taskAPI.getAllTasks();
          console.log("All tasks from backend:", allTasks);
          console.log(
            "Tasks for this project:",
            allTasks.filter((task) => task.projectId === project.projectId)
          );

          // Fetch tasks for each status separately
          const finalTodoTasks = allTasks.filter(
            (task) =>
              task.projectId === project.projectId &&
              task.status.toLowerCase() === "todo"
          );
          const finalInProgressTasks = allTasks.filter(
            (task) =>
              task.projectId === project.projectId &&
              (task.status.toLowerCase() === "in progress" ||
                task.status.toLowerCase() === "inprogress")
          );
          const finalCompletedTasks = allTasks.filter(
            (task) =>
              task.projectId === project.projectId &&
              task.status.toLowerCase() === "completed"
          );

          // Transform tasks with user information
          const transformedTodo = await transformTasksWithUserInfo(
            finalTodoTasks
          );
          const transformedInProgress = await transformTasksWithUserInfo(
            finalInProgressTasks
          );
          const transformedCompleted = await transformTasksWithUserInfo(
            finalCompletedTasks
          );

          setTodoTasks(transformedTodo);
          setInProgressTasks(transformedInProgress);
          setCompletedTasks(transformedCompleted);

          console.log("Transformed Todo tasks:", transformedTodo);
          console.log("Transformed In Progress tasks:", transformedInProgress);
          console.log("Transformed Completed tasks:", transformedCompleted);
          console.log(
            "Total tasks set:",
            transformedTodo.length +
              transformedInProgress.length +
              transformedCompleted.length
          );
        } else {
          setError("Project not found");
        }
      } catch (err) {
        console.error("Error fetching project and tasks:", err);
        setError("Failed to load project and tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndTasks();
  }, [projectName]);

  // Load current user data
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  // Function to resolve user information from GUID
  const resolveUserInfo = async (picGuid) => {
    if (!picGuid || picGuid === "00000000-0000-0000-0000-000000000000") {
      return "Unassigned";
    }

    try {
      const user = await userAPI.getUserById(picGuid);
      return user.username || user.email || "Unknown User";
    } catch (error) {
      console.error("Error resolving user info:", error);
      return "Unknown User";
    }
  };

  // Enhanced task transformation with user resolution and comments
  const transformTasksWithUserInfo = async (tasks) => {
    const transformedTasks = [];

    for (const task of tasks) {
      const assignedTo = await resolveUserInfo(task.pic);

      // Fetch comments for this task
      let comments = [];
      try {
        comments = await commentAPI.getCommentsByTaskId(task.projectTaskId);
        console.log(`Comments for task ${task.projectTaskId}:`, comments);
      } catch (error) {
        console.error(
          `Error fetching comments for task ${task.projectTaskId}:`,
          error
        );
        // Continue with empty comments array if there's an error
      }

      transformedTasks.push({
        id: task.projectTaskId,
        title: task.taskName,
        status: normalizeStatus(task.status),
        description: task.description,
        deadline: task.deadline,
        priority: task.priority,
        assignedTo: assignedTo,
        pic: task.pic, // Keep the original GUID for API calls
        projectId: task.projectId,
        comments: comments || [],
      });
    }

    return transformedTasks;
  };

  // Task handlers
  const handleCreateTask = async (taskData) => {
    try {
      if (!currentProject) {
        throw new Error("No project selected");
      }

      // Find the project ID
      const allProjects = await projectAPI.getAllProjects();
      const project = allProjects.find(
        (p) => p.projectName === currentProject.name
      );

      if (!project) {
        throw new Error("Project not found");
      }

      // Prepare task data for API
      const newTaskData = {
        projectId: project.projectId,
        taskName: taskData.title,
        pic: taskData.assignedTo || "00000000-0000-0000-0000-000000000000", // Default GUID if empty
        deadline: taskData.deadline
          ? new Date(taskData.deadline).toISOString()
          : new Date().toISOString(),
        description: taskData.description,
        status: normalizeStatus("Todo"), // Always start with Todo status
        priority: taskData.priority,
      };

      // Create task using API
      const createdTask = await taskAPI.createTask(newTaskData);

      // Resolve user information for the created task
      const assignedTo = await resolveUserInfo(createdTask.pic);

      // Add to local state
      const newTask = {
        id: createdTask.projectTaskId,
        title: createdTask.taskName,
        status: normalizeStatus(createdTask.status),
        description: createdTask.description,
        deadline: createdTask.deadline,
        priority: createdTask.priority,
        assignedTo: assignedTo,
        pic: createdTask.pic, // Keep the original GUID for API calls
        projectId: project.projectId,
        comments: [],
      };

      setTodoTasks((prev) => [...prev, newTask]);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Failed to create task. Please try again.");
    }
  };

  const handleEditTask = async (updatedTask) => {
    try {
      // Get the projectId from the task or currentProject
      const projectId = updatedTask.projectId || currentProject?.projectId;

      if (!projectId) {
        throw new Error("Project ID not found for task update");
      }

      // Prepare task data for API
      const taskData = {
        projectId: projectId,
        taskName: updatedTask.title,
        pic:
          updatedTask.pic ||
          updatedTask.assignedTo ||
          "00000000-0000-0000-0000-000000000000",
        deadline: updatedTask.deadline
          ? new Date(updatedTask.deadline).toISOString()
          : new Date().toISOString(),
        description: updatedTask.description,
        status: normalizeStatus(updatedTask.status),
        priority: updatedTask.priority,
      };

      console.log("Updating task with data:", taskData);

      // Update task using API
      await taskAPI.updateTask(updatedTask.id, taskData);

      // Resolve user information for the updated task
      const assignedTo = await resolveUserInfo(taskData.pic);

      // Remove task from all arrays first
      setTodoTasks((prev) => prev.filter((task) => task.id !== updatedTask.id));
      setInProgressTasks((prev) =>
        prev.filter((task) => task.id !== updatedTask.id)
      );
      setCompletedTasks((prev) =>
        prev.filter((task) => task.id !== updatedTask.id)
      );

      // Add task to the correct array based on its new status
      const normalizedStatus = normalizeStatus(updatedTask.status);
      const taskWithNormalizedStatus = {
        ...updatedTask,
        status: normalizedStatus,
        projectId: projectId, // Ensure projectId is preserved
        assignedTo: assignedTo, // Use resolved user information
        pic: taskData.pic, // Keep the original GUID for API calls
      };

      if (normalizedStatus === "Todo") {
        setTodoTasks((prev) => [...prev, taskWithNormalizedStatus]);
      } else if (normalizedStatus === "In Progress") {
        setInProgressTasks((prev) => [...prev, taskWithNormalizedStatus]);
      } else if (normalizedStatus === "Completed") {
        setCompletedTasks((prev) => [...prev, taskWithNormalizedStatus]);
      }

      setIsEditModalOpen(false);
      setSelectedTask(null);
    } catch (err) {
      console.error("Error updating task:", err);
      alert("Failed to update task. Please try again.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      setTodoTasks((prev) => prev.filter((t) => t.id !== taskId));
      setInProgressTasks((prev) => prev.filter((t) => t.id !== taskId));
      setCompletedTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Failed to delete task. Please try again.");
    }
  };

  const handleChangeStatus = async (task, newStatus) => {
    try {
      const updatedTask = { ...task, status: normalizeStatus(newStatus) };
      await handleEditTask(updatedTask);
    } catch (err) {
      console.error("Error changing task status:", err);
      alert("Failed to update task status. Please try again.");
    }
  };

  // Get next status in the workflow
  const getNextStatus = (currentStatus) => {
    const currentIndex = statusList.findIndex(
      (s) => s.key.toLowerCase() === currentStatus.toLowerCase()
    );
    return currentIndex < statusList.length - 1
      ? statusList[currentIndex + 1].key
      : null;
  };

  // Get previous status in the workflow
  const getPreviousStatus = (currentStatus) => {
    const currentIndex = statusList.findIndex(
      (s) => s.key.toLowerCase() === currentStatus.toLowerCase()
    );
    return currentIndex > 0 ? statusList[currentIndex - 1].key : null;
  };

  // Filter tasks based on search query
  const filterTasks = (taskList, status) => {
    return taskList
      .filter((task) => task.status.toLowerCase() === status.toLowerCase())
      .filter(
        (task) =>
          searchQuery === "" ||
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.assignedTo &&
            task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  };

  // Format date to display
  const formatDate = (dateString) => {
    if (!dateString) return "No date set";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      low: darkMode ? "text-green-300" : "text-green-600",
      medium: darkMode ? "text-yellow-300" : "text-yellow-600",
      high: darkMode ? "text-red-300" : "text-red-600",
    };
    return colors[priority] || colors.medium;
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const isTaskAssignedToMe = (task) => {
    if (!currentUser) return false;
    return (
      task.assignedTo === currentUser.username ||
      task.assignedTo === currentUser.email
    );
  };

  const openViewModal = (task) => {
    setSelectedTask(task);
    setIsViewModalOpen(true);
  };

  // Function to refresh comments for a specific task
  const refreshTaskComments = async (taskId) => {
    console.log("=== REFRESH: refreshTaskComments START ===");
    console.log("taskId:", taskId);

    try {
      console.log("=== REFRESH: About to call getCommentsByTaskId ===");
      const comments = await commentAPI.getCommentsByTaskId(taskId);
      console.log("=== REFRESH: getCommentsByTaskId completed ===");
      console.log("Comments received:", comments);

      // Update comments in all task arrays
      const updateTaskComments = (taskArray) =>
        taskArray.map((task) =>
          task.id === taskId ? { ...task, comments: comments || [] } : task
        );

      console.log("=== REFRESH: About to update task states ===");
      setTodoTasks(updateTaskComments);
      setInProgressTasks(updateTaskComments);
      setCompletedTasks(updateTaskComments);
      console.log("=== REFRESH: Task states updated ===");

      console.log(`Comments refreshed for task ${taskId}:`, comments);
    } catch (error) {
      console.error("=== REFRESH: Error in refreshTaskComments ===", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
    }
  };

  // Comment handling functions
  const handleAddComment = async (taskId, commentData) => {
    console.log("=== MYTASK: handleAddComment START ===");
    console.log("taskId received:", taskId);
    console.log("commentData received:", commentData);
    console.log("currentUser:", currentUser);

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

    console.log("=== MYTASK: Formatted comment data ===");
    console.log("Formatted data:", formatted);

    try {
      console.log("=== MYTASK: About to call commentAPI.createComment ===");
      const newComment = await commentAPI.createComment(taskId, formatted);
      console.log("=== MYTASK: commentAPI.createComment completed ===");
      console.log("API returned:", newComment);

      console.log("=== MYTASK: About to call refreshTaskComments ===");
      // Refresh comments from the server to ensure we have the latest data
      await refreshTaskComments(taskId);
      console.log("=== MYTASK: refreshTaskComments completed ===");

      return newComment;
    } catch (error) {
      console.error("=== MYTASK: Error in handleAddComment ===", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      alert("Failed to add comment. Please try again.");
    }
  };

  const handleEditComment = async (commentId, updatedComment) => {
    console.log("=== MYTASK: handleEditComment START ===");
    console.log("commentId:", commentId);
    console.log("updatedComment:", updatedComment);

    try {
      console.log("=== MYTASK: About to call commentAPI.updateComment ===");
      const updated = await commentAPI.updateComment(commentId, {
        Comment: updatedComment.comment || updatedComment.Comment,
      });
      console.log("=== MYTASK: commentAPI.updateComment completed ===");
      console.log("API returned:", updated);

      // Refresh comments for the task
      const taskId =
        updatedComment.projectTaskId || updatedComment.ProjectTaskId;
      if (taskId) {
        await refreshTaskComments(taskId);
      }

      return updated;
    } catch (error) {
      console.error("=== MYTASK: Error in handleEditComment ===", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      alert("Failed to edit comment. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    console.log("=== MYTASK: handleDeleteComment START ===");
    console.log("commentId:", commentId);

    try {
      console.log("=== MYTASK: About to call commentAPI.deleteComment ===");
      await commentAPI.deleteComment(commentId);
      console.log("=== MYTASK: commentAPI.deleteComment completed ===");

      // Refresh comments for all tasks to update the UI
      const allTasks = [...todoTasks, ...inProgressTasks, ...completedTasks];
      for (const task of allTasks) {
        if (
          task.comments.some(
            (c) => c.taskCommentId === commentId || c.commentId === commentId
          )
        ) {
          await refreshTaskComments(task.id);
          break;
        }
      }

      console.log("=== MYTASK: Comments refreshed after deletion ===");
    } catch (error) {
      console.error("=== MYTASK: Error in handleDeleteComment ===", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const handleFileUpload = (taskId, files) => {
    // Here you would typically upload the files to your backend
    // For now, we'll just update the task with the file information
    const fileList = Array.from(files).map((file) => ({
      id: Date.now(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedBy: currentUser?.username || "Anonymous",
      uploadedAt: new Date().toISOString(),
    }));

    // Update the appropriate task array with new attachments
    setTodoTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              attachments: [...(task.attachments || []), ...fileList],
            }
          : task
      )
    );
    setInProgressTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              attachments: [...(task.attachments || []), ...fileList],
            }
          : task
      )
    );
    setCompletedTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              attachments: [...(task.attachments || []), ...fileList],
            }
          : task
      )
    );
  };

  const handleFileSelect = (event, taskId) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileUpload(taskId, files);
    }
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const renderTaskCard = (task) => {
    const nextStatus = getNextStatus(task.status);
    const previousStatus = getPreviousStatus(task.status);
    const isOverdue = isTaskOverdue(task);

    return (
      <div
        className={`p-4 rounded-lg ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border shadow-sm hover:shadow-md transition-shadow duration-200`}
      >
        {/* Task Header */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3
              className={`font-medium ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {task.title}
            </h3>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {task.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {previousStatus && canUserEditTasks(currentUser, currentProject) && (
              <button
                onClick={() => handleChangeStatus(task, previousStatus)}
                className={`p-1 rounded-full ${
                  darkMode
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
                title={`Move to ${previousStatus}`}
              >
                <ChevronLeft size={16} />
              </button>
            )}
            {nextStatus && canUserEditTasks(currentUser, currentProject) && (
              <button
                onClick={() => handleChangeStatus(task, nextStatus)}
                className={`p-1 rounded-full ${
                  darkMode
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
                title={`Move to ${nextStatus}`}
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Task Info */}
        <div className="flex items-center justify-between text-sm mt-4">
          <div className="flex items-center gap-2">
            <User
              size={16}
              className={darkMode ? "text-gray-400" : "text-gray-500"}
            />
            <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
              {task.assignedTo || "Unassigned"}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 ${
              isOverdue
                ? darkMode
                  ? "text-red-400"
                  : "text-red-600"
                : darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            <Clock size={16} />
            <span>{formatDate(task.deadline)}</span>
          </div>
        </div>

        {/* Task Actions */}
        <div className="flex justify-end items-center gap-2 mt-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileSelect(e, task.id)}
            className="hidden"
            multiple
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-lg ${
              darkMode
                ? "hover:bg-gray-700 text-gray-400"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            title="Upload Files"
          >
            <Upload size={16} />
          </button>
          <button
            onClick={() => openViewModal(task)}
            className={`p-2 rounded-lg ${
              darkMode
                ? "hover:bg-gray-700 text-gray-400"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            title="View Details"
          >
            <Eye size={16} />
          </button>
          {canUserEditTasks(currentUser, currentProject) && (
            <>
              <button
                onClick={() => openEditModal(task)}
                className={`p-2 rounded-lg ${
                  darkMode
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
                title="Edit Task"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className={`p-2 rounded-lg ${
                  darkMode
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
                title="Delete Task"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>

        {/* File Attachments */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            <div
              className={`text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Attachments:
            </div>
            <div className="space-y-1">
              {task.attachments.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <File
                      size={16}
                      className={darkMode ? "text-gray-400" : "text-gray-500"}
                    />
                    <span
                      className={darkMode ? "text-gray-300" : "text-gray-700"}
                    >
                      {file.name}
                    </span>
                    <span
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                  <button
                    onClick={() => window.open(file.url, "_blank")}
                    className={`p-1 rounded-lg ${
                      darkMode
                        ? "hover:bg-gray-600 text-gray-400"
                        : "hover:bg-gray-200 text-gray-600"
                    }`}
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h2
              className={`text-3xl font-extrabold mb-2 ${
                darkMode
                  ? "bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
                  : "text-gray-900"
              }`}
            >
              My Tasks for {decodeURIComponent(projectName)}
            </h2>
            {currentProject && (
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Project Deadline: {formatDate(currentProject.dueDate)}
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div
                className={`text-center ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p>Loading tasks...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center justify-center py-12">
              <div
                className={`text-center ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Main Content */}
          {!loading && !error && (
            <>
              <div className="flex justify-between items-center mb-6">
                {/* Search Bar */}
                <div
                  className={`relative flex-1 max-w-md ${
                    darkMode ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search
                      className={`h-5 w-5 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      darkMode
                        ? "bg-gray-800 border-gray-600 focus:ring-cyan-500 text-gray-200 placeholder-gray-400"
                        : "bg-white border-gray-300 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>

                {/* Add Task Button */}
                {canUserAddTasks(currentUser, currentProject) && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className={`ml-4 px-4 py-2 rounded-lg flex items-center ${
                      darkMode
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Task
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statusList.map(({ key, color }) => (
                  <div
                    key={key}
                    className={`${
                      darkMode
                        ? "bg-gray-800 border-" + color + "-500/30"
                        : "bg-white border-" + color + "-300"
                    } border rounded-lg shadow-xl p-4 flex flex-col`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3
                        className={`text-lg font-semibold ${
                          darkMode ? `text-${color}-300` : `text-${color}-700`
                        }`}
                      >
                        {key}
                      </h3>
                      <span
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {
                          filterTasks(
                            key === "Todo"
                              ? todoTasks
                              : key === "In Progress"
                              ? inProgressTasks
                              : completedTasks,
                            key
                          ).length
                        }{" "}
                        tasks
                      </span>
                    </div>
                    <div className="flex-1 space-y-4">
                      {filterTasks(
                        key === "Todo"
                          ? todoTasks
                          : key === "In Progress"
                          ? inProgressTasks
                          : completedTasks,
                        key
                      ).length === 0 && (
                        <div
                          className={`text-center text-sm ${
                            darkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          {searchQuery ? "No matching tasks" : "No tasks"}
                        </div>
                      )}
                      {filterTasks(
                        key === "Todo"
                          ? todoTasks
                          : key === "In Progress"
                          ? inProgressTasks
                          : completedTasks,
                        key
                      ).map(renderTaskCard)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Results Count */}
              <div className="mt-8 text-center">
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Showing{" "}
                  {
                    [
                      ...todoTasks.filter(
                        (task) =>
                          searchQuery === "" ||
                          task.title
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          task.description
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          task.assignedTo
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                      ),
                      ...inProgressTasks.filter(
                        (task) =>
                          searchQuery === "" ||
                          task.title
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          task.description
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          task.assignedTo
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                      ),
                      ...completedTasks.filter(
                        (task) =>
                          searchQuery === "" ||
                          task.title
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          task.description
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          task.assignedTo
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                      ),
                    ].length
                  }{" "}
                  of{" "}
                  {todoTasks.length +
                    inProgressTasks.length +
                    completedTasks.length}{" "}
                  tasks
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddTaskModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleCreateTask}
          darkMode={darkMode}
          contributors={currentProject?.contributors || []}
        />
      )}

      {isEditModalOpen && selectedTask && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onSubmit={handleEditTask}
          darkMode={darkMode}
          contributors={currentProject?.contributors || []}
        />
      )}

      {isViewModalOpen && selectedTask && (
        <ViewTaskModal
          task={selectedTask}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedTask(null);
          }}
          onAddComment={handleAddComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
          currentUser={currentUser}
        />
      )}
    </Layout>
  );
};

export default MyTask;
