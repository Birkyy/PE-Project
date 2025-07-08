import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import { Calendar, Users, Eye, RotateCcw, Trash2, Search } from 'lucide-react';
import { projectAPI } from '../API/apiService';

const Archive = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [archivedProjects, setArchivedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Load current user data
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  // Fetch archived projects
  useEffect(() => {
    if (currentUser) {
      fetchArchivedProjects();
    }
  }, [currentUser]);

  const fetchArchivedProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const projects = await projectAPI.getArchivedProjects(currentUser.userId);
      setArchivedProjects(projects);
    } catch (err) {
      console.error('Error fetching archived projects:', err);
      setError('Failed to load archived projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleRestoreProject = async (projectId) => {
    try {
      await projectAPI.restoreProject(projectId, currentUser?.userId);
      const projectToRestore = archivedProjects.find(p => p.projectId === projectId);
      if (projectToRestore) {
        setArchivedProjects(prev => prev.filter(p => p.projectId !== projectId));
        alert(`"${projectToRestore.projectName}" has been restored to active projects!`);
      }
    } catch (err) {
      console.error('Error restoring project:', err);
      alert('Failed to restore project. Please try again.');
    }
  };

  const handlePermanentDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to permanently delete this project? This action cannot be undone.')) {
      try {
        await projectAPI.deleteProject(projectId);
        setArchivedProjects(prev => prev.filter(p => p.projectId !== projectId));
        alert('Project permanently deleted successfully!');
      } catch (err) {
        console.error('Error deleting project:', err);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const handleViewProject = (project) => {
    navigate(`/project/${project.projectId}`, { state: { archived: true } });
  };

  const filteredProjects = archivedProjects.filter(project =>
    project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    project.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className={`text-center py-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
              <div className={`text-4xl mb-4 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
                ❌
              </div>
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                Error Loading Archive
              </h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {error}
              </p>
              <button
                onClick={fetchArchivedProjects}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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
                Project Archive
              </h2>
              <div className="flex-1 flex justify-end">
                <div className={`text-sm px-3 py-1 rounded-full ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>
                  {archivedProjects.length} archived project{archivedProjects.length !== 1 ? 's' : ''}
                </div>
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search archived projects..."
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                  }`}
                />
              </div>
            </div>
          </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!loading && filteredProjects.length === 0 && (
          <div className={`text-center py-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
            <div className={`text-4xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              📁
            </div>
            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              No archived projects
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Projects that are archived will appear here
            </p>
          </div>
        )}

        {!loading && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div
                key={project.projectId}
                className={`${darkMode ? `bg-gray-800 border-purple-500/30` : `bg-white border-purple-300`} border overflow-hidden shadow-xl rounded-lg hover:shadow-lg ${darkMode ? `hover:shadow-purple-500/20` : `hover:shadow-purple-300/30`} transition-all duration-300 cursor-pointer`}
                onClick={() => handleViewProject(project)}
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-lg font-semibold ${darkMode ? `text-purple-300` : `text-purple-700`}`}>{project.projectName}</h3>
                  </div>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{project.description || ''}</p>
                  
                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.status === 'Completed' 
                        ? darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-800'
                        : project.status === 'Cancelled'
                        ? darkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-800'
                        : darkMode ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Archived: {formatDate(project.archivedDate)}
                      </span>
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Due: {formatDate(project.date)}
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}> 
                      <div className={`bg-purple-500 h-2 rounded-full`} style={{width: `${project.progress || 0}%`}}></div>
                    </div>
                  </div>

                  {/* Action Icons */}
                  <div className="flex justify-end space-x-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleViewProject(project)}
                      className={`p-2 rounded-full transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-blue-300' : 'hover:bg-gray-100 text-gray-600 hover:text-blue-600'}`}
                      title="View Project"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRestoreProject(project.projectId)}
                      className={`p-2 rounded-full transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-green-300' : 'hover:bg-gray-100 text-gray-600 hover:text-green-600'}`}
                      title="Restore Project"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(project.projectId)}
                      className={`p-2 rounded-full transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-red-300' : 'hover:bg-gray-100 text-gray-600 hover:text-red-600'}`}
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
};

export default Archive; 