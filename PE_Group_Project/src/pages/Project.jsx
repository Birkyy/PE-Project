import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { File, Download, ExternalLink, Calendar, Users, Clock, AlertCircle, Plus, ListTodo, Edit, Trash2, Search, MoveRight, ChevronRight, ChevronLeft, User, Eye, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';
import ViewTaskModal from './ViewTaskModal';
import EditProjectModal from './EditProjectModal';

const statusList = [
  { key: 'Todo', color: 'blue' },
  { key: 'In Progress', color: 'yellow' },
  { key: 'Completed', color: 'green' },
];

// Helper function to check if a task is overdue
const isTaskOverdue = (task) => {
  if (task.status === 'Completed') return false;
  if (!task.deadline) return false;
  return new Date(task.deadline) < new Date();
};

function Project() {
    const { darkMode } = useTheme();
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([
        {
            id: 1,
            title: "Design UI Components",
            description: "Create reusable UI components for the project dashboard",
            status: "In Progress",
            priority: "high",
            assignedTo: "John Doe",
            deadline: "2024-12-20",
            comments: [
                {
                    id: 1,
                    author: "John Doe",
                    text: "Working on the component structure",
                    timestamp: "2024-12-10T10:30:00Z"
                }
            ],
            attachments: [
                {
                    id: 1,
                    name: "Component_Designs.pdf",
                    size: 2048576,
                    type: "application/pdf",
                    url: "#"
                },
                {
                    id: 2,
                    name: "Wireframes.png",
                    size: 1024000,
                    type: "image/png", 
                    url: "#"
                }
            ]
        },
        {
            id: 2,
            title: "Database Schema",
            description: "Design and implement the database schema for user management",
            status: "Todo",
            priority: "medium",
            assignedTo: "Jane Smith",
            deadline: "2024-12-25",
            comments: [],
            attachments: [
                {
                    id: 3,
                    name: "Schema_Draft.sql",
                    size: 15360,
                    type: "text/sql",
                    url: "#"
                }
            ]
        },
        {
            id: 3,
            title: "API Integration",
            description: "Integrate third-party APIs for authentication and notifications",
            status: "Completed",
            priority: "low",
            assignedTo: "John Doe", 
            deadline: "2024-12-15",
            comments: [
                {
                    id: 2,
                    author: "Jane Smith",
                    text: "API documentation looks good",
                    timestamp: "2024-12-08T14:15:00Z"
                }
            ],
            attachments: []
        }
    ]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
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
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }
    }, []);

    // Mock project data - replace with actual API call
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setProject({
                id: 1,
                name: "Project Management System",
                description: "A comprehensive project management system with task tracking and team collaboration features.",
                startDate: "2024-03-01",
                dueDate: "2024-06-30",
                status: "In Progress",
                priority: "high",
                teamMembers: [
                    { id: 1, name: "John Doe", role: "Project Manager" },
                    { id: 2, name: "Jane Smith", role: "Developer" }
                ],
                attachments: [
                    { 
                        id: 1, 
                        name: "Project_Specs.pdf", 
                        size: 1024576,
                        type: "application/pdf",
                        url: "#"
                    },
                    { 
                        id: 2, 
                        name: "Design_Mockups.zip", 
                        size: 5242880,
                        type: "application/zip",
                        url: "#"
                    }
                ]
            });
            setLoading(false);
        }, 1000);
    }, [id]);

    // Task handlers
    const handleCreateTask = (taskData) => {
        const newTask = {
            id: Date.now(),
            ...taskData,
            status: 'Todo',
            comments: [],
            attachments: taskData.attachments || []
        };
        setTasks([...tasks, newTask]);
        setIsAddTaskModalOpen(false);
    };

    const handleEditTask = (updatedTask) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === updatedTask.id ? {
                    ...task,
                    ...updatedTask,
                    status: updatedTask.status || task.status,
                    priority: updatedTask.priority || task.priority,
                    comments: task.comments || [], // Preserve comments
                    attachments: updatedTask.attachments || task.attachments || [] // Preserve attachments
                } : task
            )
        );
        setIsEditModalOpen(false);
        setEditTask(null);
    };

    const handleDeleteTask = (taskId) => {
        setTasks(tasks.filter(t => t.id !== taskId));
    };

    const handleChangeStatus = (task, newStatus) => {
        setTasks(tasks.map(t => 
            t.id === task.id ? { ...t, status: newStatus } : t
        ));
    };

    // Get next status in the workflow
    const getNextStatus = (currentStatus) => {
        const currentIndex = statusList.findIndex(s => s.key === currentStatus);
        return currentIndex < statusList.length - 1 ? statusList[currentIndex + 1].key : null;
    };

    // Get previous status in the workflow
    const getPreviousStatus = (currentStatus) => {
        const currentIndex = statusList.findIndex(s => s.key === currentStatus);
        return currentIndex > 0 ? statusList[currentIndex - 1].key : null;
    };

    // Filter tasks based on search query
    const filterTasks = (taskList, status) => {
        return taskList
            .filter(task => task.status === status)
            .filter(task => 
                searchQuery === '' ||
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
            );
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

    const handleDownload = (file) => {
        window.open(file.url, '_blank');
    };

    const handleEditProject = (updatedProject) => {
        // Here you would typically make an API call to update the project
        setProject(prev => ({
            ...prev,
            name: updatedProject.projectName,
            description: updatedProject.description,
            status: updatedProject.status,
            priority: updatedProject.priorityLevel,
            dueDate: updatedProject.date,
            attachments: updatedProject.files
        }));
        setIsEditProjectModalOpen(false);
    };

    // Add navigation handler
    const handleBack = () => {
        navigate('/my-projects');
    };

    // Comment handling functions
    const handleAddComment = async (comment) => {
        try {
            // In a real app, you would save this to your backend
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === comment.taskId
                        ? { ...task, comments: [...(task.comments || []), comment] }
                        : task
                )
            );
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    };

    const handleEditComment = async (commentId, updatedComment) => {
        try {
            // In a real app, you would save this to your backend
            setTasks(prevTasks =>
                prevTasks.map(task => ({
                    ...task,
                    comments: (task.comments || []).map(comment =>
                        comment.id === commentId ? updatedComment : comment
                    )
                }))
            );
        } catch (error) {
            console.error('Error editing comment:', error);
            throw error;
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            // In a real app, you would delete this from your backend
            setTasks(prevTasks =>
                prevTasks.map(task => ({
                    ...task,
                    comments: (task.comments || []).filter(comment => comment.id !== commentId)
                }))
            );
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    };

    const renderTaskCard = (task) => {
        const isOverdue = isTaskOverdue(task);
        const nextStatus = getNextStatus(task.status);
        const previousStatus = getPreviousStatus(task.status);

        return (
            <div
                key={task.id}
                className={`p-4 rounded-lg mb-3 ${
                    darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                } shadow-sm`}
            >
                <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {task.title}
                    </h3>
                    <div className="flex items-center gap-2">
                        {previousStatus && (
                            <button
                                onClick={() => handleChangeStatus(task, previousStatus)}
                                className={`p-1 rounded-full ${
                                    darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                }`}
                                title={`Move to ${previousStatus}`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        )}
                        {nextStatus && (
                            <button
                                onClick={() => handleChangeStatus(task, nextStatus)}
                                className={`p-1 rounded-full ${
                                    darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                }`}
                                title={`Move to ${nextStatus}`}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
                <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {task.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                    <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        {task.assignedTo}
                    </div>
                    <div className={`flex items-center gap-2 ${
                        isOverdue ? (darkMode ? 'text-red-400' : 'text-red-600') : (darkMode ? 'text-gray-400' : 'text-gray-500')
                    }`}>
                        <Clock className="w-4 h-4" />
                        {formatDate(task.deadline)}
                    </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                    <button
                        onClick={() => {
                            setViewTask(task);
                            setIsViewModalOpen(true);
                        }}
                        className={`p-1.5 rounded-lg ${
                            darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => {
                            setEditTask(task);
                            setIsEditModalOpen(true);
                        }}
                        className={`p-1.5 rounded-lg ${
                            darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteTask(task.id)}
                        className={`p-1.5 rounded-lg ${
                            darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Loading project...
                    </div>
                </div>
            </Layout>
        );
    }

    if (!project) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className={`text-lg ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
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
                                    ? 'hover:bg-gray-700 text-gray-400 hover:text-purple-400' 
                                    : 'hover:bg-gray-100 text-gray-600 hover:text-purple-600'
                            }`}
                            title="Back to Projects"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div className="flex-1">
                            <h1 className={`text-3xl font-extrabold ${
                                darkMode 
                                    ? 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent' 
                                    : 'text-gray-900'
                            }`}>
                                {project.name}
                            </h1>
                        </div>
                    </div>

                    {/* Project Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <h1 className={`text-3xl font-bold ${
                                        darkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        {project.name}
                                    </h1>
                                    <button
                                        onClick={() => setIsEditProjectModalOpen(true)}
                                        className={`p-2 rounded-lg ${
                                            darkMode
                                                ? 'hover:bg-gray-700 text-gray-400'
                                                : 'hover:bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                                        {project.status}
                                    </span>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority)}`}>
                                        <AlertCircle className="w-4 h-4" />
                                        {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)} Priority
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
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
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
                                    <Search className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search tasks..."
                                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                                        darkMode
                                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Project Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Project Info */}
                        <div className={`p-6 rounded-lg ${
                            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        } border`}>
                            <h2 className={`text-lg font-medium mb-4 ${
                                darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                                Project Information
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <p className={`text-sm ${
                                        darkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                        {project.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className={`w-5 h-5 ${
                                        darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`} />
                                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                        Due: {formatDate(project.dueDate)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className={`w-5 h-5 ${
                                        darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`} />
                                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                        {project.teamMembers.length} Team Members
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Project Attachments */}
                        <div className={`p-6 rounded-lg ${
                            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        } border`}>
                            <h2 className={`text-lg font-medium mb-4 flex items-center gap-2 ${
                                darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                                <File className="w-5 h-5" />
                                Attachments
                            </h2>
                            <div className="space-y-3">
                                {project.attachments && project.attachments.length > 0 ? (
                                    project.attachments.map(file => (
                                        <div
                                            key={file.id}
                                            className={`flex items-center justify-between p-3 rounded-lg ${
                                                darkMode ? 'bg-gray-700' : 'bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <File className={`w-5 h-5 ${
                                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                                }`} />
                                                <div>
                                                    <p className={`font-medium ${
                                                        darkMode ? 'text-white' : 'text-gray-900'
                                                    }`}>
                                                        {file.name}
                                                    </p>
                                                    <p className={`text-sm ${
                                                        darkMode ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDownload(file)}
                                                    className={`p-2 rounded-lg ${
                                                        darkMode
                                                            ? 'hover:bg-gray-600 text-gray-400'
                                                            : 'hover:bg-gray-200 text-gray-600'
                                                    }`}
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => window.open(file.url, '_blank')}
                                                    className={`p-2 rounded-lg ${
                                                        darkMode
                                                            ? 'hover:bg-gray-600 text-gray-400'
                                                            : 'hover:bg-gray-200 text-gray-600'
                                                    }`}
                                                    title="Open in new tab"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className={`text-center py-4 ${
                                        darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                        No attachments yet
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tasks Kanban Board */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {statusList.map(({ key: status, color }) => (
                            <div key={status} className={`p-4 rounded-lg ${
                                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                            } border`}>
                                <h3 className={`text-lg font-medium mb-4 flex items-center justify-between ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    <span>{status}</span>
                                    <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(status)}`}>
                                        {filterTasks(tasks, status).length}
                                    </span>
                                </h3>
                                <div className="space-y-3">
                                    {filterTasks(tasks, status).map(task => renderTaskCard(task))}
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
                onSubmit={handleCreateTask}
            />
            <EditTaskModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditTask(null);
                }}
                onSubmit={handleEditTask}
                task={editTask}
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