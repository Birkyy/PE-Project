import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Users, Eye, Edit, Trash2, Plus, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import { projectAPI } from '../API/apiService';

function Project() {
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    
    // State
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

    // Fetch all projects on component mount
    useEffect(() => {
        fetchProjects();
    }, []);

    // Filter projects when search term or filters change
    useEffect(() => {
        let filtered = projects;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(project =>
                project.projectName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(project => project.status === statusFilter);
        }

        // Apply priority filter
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(project => project.priorityLevel === priorityFilter);
        }

        setFilteredProjects(filtered);
    }, [searchTerm, statusFilter, priorityFilter, projects]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await projectAPI.getAllProjects();
            setProjects(data);
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError('Failed to fetch projects. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleProjectClick = (project) => {
        // Navigate to project details or tasks
        navigate(`/my-tasks/${encodeURIComponent(project.projectName)}`);
    };

    const handleAddProject = () => {
        navigate('/add-project');
    };

    const handleEditProject = (e, project) => {
        e.stopPropagation();
        // Navigate to edit project page or open modal
        console.log('Edit project:', project);
    };

    const handleDeleteProject = async (e, projectId) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this project?')) {
            return;
        }

        try {
            await projectAPI.deleteProject(projectId);
            setProjects(prev => prev.filter(p => p.projectId !== projectId));
        } catch (err) {
            console.error('Error deleting project:', err);
            alert('Failed to delete project. Please try again.');
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'in progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className={`text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                        <p>Loading projects...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className={`text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={fetchProjects}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className={`text-3xl font-extrabold mb-4 ${
                            darkMode 
                                ? 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent'
                                : 'text-gray-900'
                        }`}>
                            All Projects
                        </h2>
                        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Manage and view all projects in the system
                        </p>
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-8 space-y-4">
                        {/* Search Bar */}
                        <div className="max-w-md mx-auto">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search projects..."
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${
                                        darkMode 
                                            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400' 
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                                    }`}
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap justify-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Filter className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 ${
                                        darkMode 
                                            ? 'bg-gray-800 border-gray-600 text-white' 
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="in progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <select
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 ${
                                        darkMode 
                                            ? 'bg-gray-800 border-gray-600 text-white' 
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                >
                                    <option value="all">All Priorities</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Add Project Button */}
                    <div className="text-center mb-6">
                        <button
                            onClick={handleAddProject}
                            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add New Project
                        </button>
                    </div>

                    {/* Projects Grid */}
                    {filteredProjects.length === 0 ? (
                        <div className="text-center py-12">
                            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                                    ? 'No projects match your filters.' 
                                    : 'No projects found.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredProjects.map((project) => (
                                <div
                                    key={project.projectId}
                                    className={`${darkMode ? 'bg-gray-800 border-purple-500/30' : 'bg-white border-purple-300'} border overflow-hidden shadow-xl rounded-lg hover:shadow-lg ${darkMode ? 'hover:shadow-purple-500/20' : 'hover:shadow-purple-300/30'} transition-all duration-300 cursor-pointer group`}
                                    onClick={() => handleProjectClick(project)}
                                >
                                    <div className="px-6 py-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                                                {project.projectName}
                                            </h3>
                                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => handleEditProject(e, project)}
                                                    className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                                >
                                                    <Edit className="h-4 w-4 text-blue-500" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteProject(e, project.projectId)}
                                                    className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Status */}
                                            <div className="flex items-center justify-between">
                                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status:</span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                                                    {project.status || 'Not Set'}
                                                </span>
                                            </div>

                                            {/* Priority */}
                                            <div className="flex items-center justify-between">
                                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Priority:</span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priorityLevel)}`}>
                                                    {project.priorityLevel || 'Not Set'}
                                                </span>
                                            </div>

                                            {/* Date */}
                                            {project.date && (
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {new Date(project.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Contributors */}
                                            <div className="flex items-center space-x-2">
                                                <Users className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {project.contributors?.length || 0} contributors
                                                </span>
                                            </div>

                                            {/* Project Manager */}
                                            {project.projectManagerInCharge && (
                                                <div className="flex items-center space-x-2">
                                                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        Manager: {project.projectManagerInCharge}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Results Count */}
                    <div className="mt-8 text-center">
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Showing {filteredProjects.length} of {projects.length} projects
                        </p>
                    </div>
                </div>
        </div>
        </Layout>
    );
}

export default Project;