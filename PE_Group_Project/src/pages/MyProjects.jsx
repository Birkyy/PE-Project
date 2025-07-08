import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Search, 
  Calendar, 
  Users, 
  Save, 
  X, 
  ChevronDown, 
  UserCheck, 
  Plus, 
  Archive, 
  Eye, 
  Edit,
  AlertTriangle 
} from 'lucide-react';
import Layout from '../components/Layout';
import { useState, useRef, useEffect } from 'react';
import { projectAPI, taskAPI } from '../API/apiService';
import EditProjectModal from './EditProjectModal';
import AddProjectModal from '../components/AddProjectModal';
import ArchiveConfirmModal from '../components/ArchiveConfirmModal';

const MyProjects = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // State
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewProject, setViewProject] = useState(null);
  const [editProjectObj, setEditProjectObj] = useState(null);
  const [editProjectLoading, setEditProjectLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, projectId: null, projectName: '' });
  const [archiveModal, setArchiveModal] = useState({ isOpen: false, projectId: null, projectName: '' });
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    projectName: '',
    date: '',
    status: '',
    priorityLevel: '',
    projectManagerInCharge: '',
    contributors: [],
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLeaderDropdownOpen, setIsLeaderDropdownOpen] = useState(false);
  const [leaderSearchTerm, setLeaderSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const leaderDropdownRef = useRef(null);
  const [projectProgress, setProjectProgress] = useState({});

  // Load current user data
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  // Helper function to check if user is admin
  const isUserAdmin = () => {
    return currentUser?.role?.toLowerCase() === 'admin';
  };

  // Fetch all projects on component mount
  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser]);

  // Filter projects when searchTerm changes
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(
        projects.filter((project) =>
          project.projectName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, projects]);

  // Fetch progress for all projects after they are loaded
  useEffect(() => {
    const fetchAllProgress = async () => {
      if (projects.length === 0) return;
      const progressMap = {};
      await Promise.all(projects.map(async (project) => {
        try {
          const tasks = await taskAPI.getTasksByProjectId(project.projectId);
          if (tasks.length === 0) {
            progressMap[project.projectId] = 0;
          } else {
            const completed = tasks.filter(t => t.status === 'Completed').length;
            progressMap[project.projectId] = Math.round((completed / tasks.length) * 100);
          }
        } catch (e) {
          progressMap[project.projectId] = 0;
        }
      }));
      setProjectProgress(progressMap);
    };
    fetchAllProgress();
  }, [projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      // Pass the current user's ID to get projects based on user permissions
      // Check for both userId and id fields since the API might use different naming
      const userId = currentUser?.userId || currentUser?.id || currentUser?.UserId;
      const data = await projectAPI.getAllProjects(userId);
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to fetch projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (project) => {
    setViewProject(project);
  };

  const handleEdit = async (project) => {
    setEditProjectLoading(true);
    try {
      const fullProject = await projectAPI.getProjectById(project.projectId);
      setEditProjectObj(fullProject);
    } catch (err) {
      alert('Failed to fetch project details.');
      console.error('Error fetching project details:', err);
    } finally {
      setEditProjectLoading(false);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditProjectModalClose = () => {
    setEditProjectObj(null);
  };

  const handleEditProjectModalSubmit = async (updatedProject) => {
    if (!editProjectObj) return;
    try {
      // Update the project using API
      const edited = await projectAPI.updateProject(editProjectObj.projectId, updatedProject);
      // Update the project in local state
      setProjects(prev => prev.map(p => 
        p.projectId === editProjectObj.projectId 
          ? { ...p, ...edited }
          : p
      ));
      setFilteredProjects(prev => prev.map(p => 
        p.projectId === editProjectObj.projectId 
          ? { ...p, ...edited }
          : p
      ));
      setEditProjectObj(null);
      console.log('Project updated:', edited);
    } catch (err) {
      console.error('Error editing project:', err);
      alert('Failed to update project. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      // Delete all tasks for this project first
      const tasks = await taskAPI.getTasksByProjectId(deleteModal.projectId);
      await Promise.all(tasks.map(task => taskAPI.deleteTask(task.projectTaskId)));
      
      // Delete the project using API
      await projectAPI.deleteProject(deleteModal.projectId);
      
      // Remove from local state
      setProjects((prev) => prev.filter((p) => p.projectId !== deleteModal.projectId));
      setFilteredProjects((prev) => prev.filter((p) => p.projectId !== deleteModal.projectId));
      
      // Close the modal
      setDeleteModal({ isOpen: false, projectId: null, projectName: '' });
      
      console.log('Project and all its tasks deleted:', deleteModal.projectId);
    } catch (err) {
      console.error('Error deleting project and its tasks:', err);
      alert('Failed to delete project and its tasks. Please try again.');
    }
  };

  const handleArchive = async (projectId, projectName) => {
    setArchiveModal({ isOpen: true, projectId, projectName });
  };

  const handleArchiveConfirm = async () => {
    try {
      await projectAPI.archiveProject(archiveModal.projectId, currentUser?.userId);
      // Remove project from active projects list
      setProjects(prevProjects => prevProjects.filter(project => project.projectId !== archiveModal.projectId));
      setFilteredProjects(prevProjects => prevProjects.filter(project => project.projectId !== archiveModal.projectId));
      // Close the modal
      setArchiveModal({ isOpen: false, projectId: null, projectName: '' });
    } catch (err) {
      console.error('Error archiving project:', err);
      alert('Failed to archive project. Please try again.');
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleAddProject = () => {
    setIsAddProjectModalOpen(true);
  };

  const handleAddProjectSubmit = async (newProject) => {
    try {
      // Add the new project to local state
      setProjects(prev => [...prev, newProject]);
      setFilteredProjects(prev => [...prev, newProject]);
      
      // Refresh projects to get the latest data
      await fetchProjects();
      
      console.log('Project created:', newProject);
    } catch (err) {
      console.error('Error after creating project:', err);
      // Still refresh to get accurate data
      await fetchProjects();
    }
  };

  const closeModal = () => {
    setViewProject(null);
    setEditProjectObj(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (leaderDropdownRef.current && !leaderDropdownRef.current.contains(event.target)) {
        setIsLeaderDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserSelect = (user) => {
    if (!editForm.contributors.find(member => member.id === user.id)) {
      setEditForm(prev => ({
        ...prev,
        contributors: [...prev.contributors, user]
      }));
    }
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleUserRemove = (userId) => {
    setEditForm(prev => ({
      ...prev,
      contributors: prev.contributors.filter(member => member.id !== userId)
    }));
  };

  const handleLeaderSelect = (user) => {
    setEditForm(prev => ({
      ...prev,
      projectManagerInCharge: user
    }));
    setLeaderSearchTerm('');
    setIsLeaderDropdownOpen(false);
  };

  const handleLeaderRemove = () => {
    setEditForm(prev => ({
      ...prev,
      projectManagerInCharge: null
    }));
  };

  // Helper function to filter projects based on user role
  const getFilteredProjectsByRole = () => {
    if (!currentUser || !filteredProjects.length) return { managingProjects: [], contributingProjects: [] };

    const userId = currentUser?.userId || currentUser?.id || currentUser?.UserId;
    const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

    if (isAdmin) {
      // For admin, return all projects in managingProjects (no change in display)
      return { managingProjects: filteredProjects, contributingProjects: [] };
    }

    // For regular users, separate projects based on their role
    const managingProjects = filteredProjects.filter(project => 
      project.projectManagerInCharge === userId
    );
    
    const contributingProjects = filteredProjects.filter(project => 
      project.projectManagerInCharge !== userId && 
      project.contributors && 
      project.contributors.includes(userId)
    );

    return { managingProjects, contributingProjects };
  };

  // Helper function to render project card
  const renderProjectCard = (project, isManagingProject = false) => (
    <div
      key={project.projectId}
      className={`${darkMode ? `bg-gray-800 border-purple-500/30` : `bg-white border-purple-300`} border overflow-hidden shadow-xl rounded-lg hover:shadow-lg ${darkMode ? `hover:shadow-purple-500/20` : `hover:shadow-purple-300/30`} transition-all duration-300 cursor-pointer`}
      onClick={() => handleProjectClick(project.projectId)}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-lg font-semibold ${darkMode ? `text-purple-300` : `text-purple-700`}`}>{project.projectName}</h3>
        </div>
        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{project.description || ''}</p>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Due: {project.date ? project.date.slice(0, 10) : ''}</span>
          </div>
          <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}> 
            <div className={`bg-purple-500 h-2 rounded-full`} style={{width: `${projectProgress[project.projectId] || 0}%`}}></div>
          </div>
          <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Progress: {projectProgress[project.projectId] || 0}%</div>
        </div>
        {/* Action Icons */}
        <div className="flex justify-end space-x-2" onClick={e => e.stopPropagation()}>
          {isManagingProject && (
            <>
              <button 
                onClick={() => handleEdit(project)}
                className={`p-2 rounded-full transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-cyan-300' : 'hover:bg-gray-100 text-gray-600 hover:text-cyan-600'}`}
                title="Edit Project"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleArchive(project.projectId, project.projectName)}
                className={`p-2 rounded-full transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-yellow-300' : 'hover:bg-gray-100 text-gray-600 hover:text-yellow-600'}`}
                title="Archive Project"
              >
                <Archive className="w-4 h-4" />
              </button>
              {currentUser?.role?.toLowerCase() === 'admin' && (
                <button 
                  onClick={() => setDeleteModal({ isOpen: true, projectId: project.projectId, projectName: project.projectName })}
                  className={`p-2 rounded-full transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-red-300' : 'hover:bg-gray-100 text-gray-600 hover:text-red-600'}`}
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Helper function to render project section
  const renderProjectSection = (title, projects, emptyMessage, isManagingProject = false) => (
    <div className="mb-8">
      <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
        {title}
      </h3>
      {projects.length === 0 ? (
        <div className="text-center py-8">
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => renderProjectCard(project, isManagingProject))}
        </div>
      )}
    </div>
  );

  const { managingProjects, contributingProjects } = getFilteredProjectsByRole();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1"></div>
              <h2 className={`text-3xl font-extrabold ${
                darkMode 
                  ? 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent'
                  : 'text-gray-900'
              }`}>
                My Projects
              </h2>
              <div className="flex-1 flex justify-end">
                {isUserAdmin() && (
                  <button
                    onClick={handleAddProject}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      darkMode
                        ? 'text-white bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 hover:shadow-lg hover:shadow-purple-500/25'
                        : 'text-white bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 hover:shadow-lg hover:shadow-purple-300/30'
                    }`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </button>
                )}
              </div>
            </div>
            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-8">
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
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className={`text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p>Loading projects...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center justify-center py-12">
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
          )}

          {/* Projects Grid */}
          {!loading && !error && (
            <>
              {filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {searchTerm ? 'No projects match your search.' : 'No projects found.'}
                  </p>
                </div>
              ) : (
                <>
                  {currentUser?.role?.toLowerCase() === 'admin' ? (
                    renderProjectSection('All Projects', managingProjects, 'No projects found.', true)
                  ) : (
                    <>
                      {renderProjectSection('Managing Projects', managingProjects, 'You are not currently managing any projects.', true)}
                      {renderProjectSection('Contributing Projects', contributingProjects, 'You are not currently contributing to any projects.', false)}
                    </>
                  )}
                </>
              )}

              {/* Results Count */}
              <div className="mt-8 text-center">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentUser?.role?.toLowerCase() === 'admin' ? (
                    `Showing ${filteredProjects.length} of ${projects.length} projects`
                  ) : (
                    `Showing ${managingProjects.length} managing projects and ${contributingProjects.length} contributing projects (${filteredProjects.length} total)`
                  )}
                </p>
              </div>
            </>
          )}


        </div>
      </div>

      {/* View Project Modal */}
      {viewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all duration-300">
          <div className={`w-full max-w-2xl mx-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-xl p-6 space-y-6 overflow-y-auto max-h-[80vh]`}>
            <h2 className={`text-3xl font-extrabold mb-4 text-center ${darkMode ? 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent' : 'text-gray-900'}`}>Project Details</h2>
            <div className="space-y-6">
              {/* Project Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Project Name</label>
                <div className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>{viewProject.projectName}</div>
              </div>
              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                <div className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>{viewProject.description || ''}</div>
              </div>
              {/* Project Manager */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Project Manager</label>
                <div className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>{viewProject.projectManagerInCharge}</div>
              </div>
              {/* Contributors */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Contributors</label>
                <div className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>{Array.isArray(viewProject.contributors) ? viewProject.contributors.join(', ') : ''}</div>
              </div>
              {/* Date and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date</label>
                  <div className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>{viewProject.date ? viewProject.date.slice(0, 10) : ''}</div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Priority Level</label>
                  <div className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>{viewProject.priorityLevel}</div>
                </div>
              </div>
              {/* Status */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                <div className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>{viewProject.status}</div>
              </div>
              {/* Action Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                <button onClick={closeModal} className="px-6 py-3 border rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400/50 bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:from-purple-700 hover:to-cyan-700">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {(editProjectObj || editProjectLoading) && (
        <EditProjectModal
          isOpen={!!editProjectObj || editProjectLoading}
          onClose={handleEditProjectModalClose}
          onSubmit={handleEditProjectModalSubmit}
          project={editProjectObj}
          loading={editProjectLoading}
        />
      )}

      {/* Delete Project Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteModal({ isOpen: false, projectId: null, projectName: '' })}
          ></div>
          
          {/* Modal */}
          <div className={`relative w-full max-w-md p-6 rounded-xl shadow-xl ${
            darkMode 
              ? "bg-gray-800" 
              : "bg-white"
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-500/10">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <h3 className={`text-xl font-semibold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}>
                  Delete Project
                </h3>
              </div>
              <button
                onClick={() => setDeleteModal({ isOpen: false, projectId: null, projectName: '' })}
                className={`p-1 rounded-lg transition-colors ${
                  darkMode
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning Message */}
            <div className={`mb-6 p-4 rounded-lg ${
              darkMode 
                ? "bg-red-900/20 border border-red-800" 
                : "bg-red-50 border border-red-100"
            }`}>
              <div className="flex gap-3">
                <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                  darkMode ? "text-red-400" : "text-red-600"
                }`} />
                <div>
                  <h4 className={`font-medium mb-1 ${
                    darkMode ? "text-red-400" : "text-red-600"
                  }`}>
                    Warning: This action cannot be undone
                  </h4>
                  <p className={`text-sm ${
                    darkMode ? "text-red-300" : "text-red-500"
                  }`}>
                    You are about to permanently delete this project and all associated tasks, comments, and files.
                  </p>
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div className={`mb-6 p-4 rounded-lg ${
              darkMode 
                ? "bg-gray-900" 
                : "bg-gray-50"
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                Project to be deleted:
              </h4>
              <p className={`font-medium ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>
                Name: {deleteModal.projectName}
              </p>
            </div>

            <p className={`mb-6 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}>
              This will permanently remove the project and all its data from the system. Are you sure you want to continue?
            </p>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, projectId: null, projectName: '' })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      <ArchiveConfirmModal
        isOpen={archiveModal.isOpen}
        onClose={() => setArchiveModal({ isOpen: false, projectId: null, projectName: '' })}
        onConfirm={handleArchiveConfirm}
        projectName={archiveModal.projectName}
      />

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onSubmit={handleAddProjectSubmit}
      />
    </Layout>
  );
};

export default MyProjects;