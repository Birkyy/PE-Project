import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import { Calendar, Users, Eye, RotateCcw, Trash2, Search } from 'lucide-react';

const Archive = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [archivedProjects, setArchivedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setArchivedProjects([
        {
          id: 1,
          name: "Legacy Website Redesign",
          description: "Complete overhaul of the company website with modern design principles and improved user experience.",
          due: "Mar 30, 2024",
          progress: 100,
          color: 'green',
          status: "Completed",
          priority: "high",
          archivedDate: "2024-04-05",
          teamMembers: [
            { id: 1, name: "John Doe", role: "Project Manager" },
            { id: 2, name: "Jane Smith", role: "Lead Designer" },
            { id: 3, name: "Mike Johnson", role: "Frontend Developer" }
          ]
        },
        {
          id: 2,
          name: "Customer Portal V1",
          description: "Development of customer self-service portal for account management and support tickets.",
          due: "Feb 15, 2024",
          progress: 100,
          color: 'blue',
          status: "Completed",
          priority: "medium",
          archivedDate: "2024-03-01",
          teamMembers: [
            { id: 4, name: "Sarah Wilson", role: "Backend Developer" },
            { id: 5, name: "Tom Brown", role: "QA Engineer" }
          ]
        },
        {
          id: 3,
          name: "Mobile App Beta",
          description: "Beta version of mobile application with core functionality for early user testing.",
          due: "Dec 31, 2023",
          progress: 53,
          color: 'red',
          status: "Cancelled",
          priority: "low",
          archivedDate: "2024-01-15",
          teamMembers: [
            { id: 6, name: "Alex Chen", role: "Mobile Developer" },
            { id: 1, name: "John Doe", role: "Project Manager" }
          ]
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleRestoreProject = (projectId) => {
    const projectToRestore = archivedProjects.find(p => p.id === projectId);
    if (projectToRestore) {
      setArchivedProjects(prev => prev.filter(p => p.id !== projectId));
      console.log('Restoring project:', projectId);
      alert(`"${projectToRestore.name}" has been restored to active projects!`);
      // In a real app, this would make an API call to restore the project
    }
  };

  const handlePermanentDelete = (projectId) => {
    if (window.confirm('Are you sure you want to permanently delete this project? This action cannot be undone.')) {
      setArchivedProjects(prev => prev.filter(p => p.id !== projectId));
      console.log('Permanently deleting project:', projectId);
    }
  };

  const handleViewProject = (project) => {
    navigate(`/project/${project.id}`, { state: { archived: true } });
  };

  const filteredProjects = archivedProjects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                key={project.name}
                className={`${darkMode ? `bg-gray-800 border-${project.color}-500/30` : `bg-white border-${project.color}-300`} border overflow-hidden shadow-xl rounded-lg hover:shadow-lg ${darkMode ? `hover:shadow-${project.color}-500/20` : `hover:shadow-${project.color}-300/30`} transition-all duration-300 cursor-pointer`}
                onClick={() => handleViewProject(project)}
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-lg font-semibold ${darkMode ? `text-${project.color}-300` : `text-${project.color}-700`}`}>{project.name}</h3>
                  </div>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{project.description}</p>
                  
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
                        Due: {project.due}
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}> 
                      <div className={`bg-${project.color}-500 h-2 rounded-full`} style={{width: `${project.progress}%`}}></div>
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
                      onClick={() => handleRestoreProject(project.id)}
                      className={`p-2 rounded-full transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-green-300' : 'hover:bg-gray-100 text-gray-600 hover:text-green-600'}`}
                      title="Restore Project"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(project.id)}
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