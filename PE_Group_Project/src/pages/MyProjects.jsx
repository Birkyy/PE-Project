import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Search, Calendar, Users, Save, X, ChevronDown, UserCheck } from 'lucide-react';
import Layout from '../components/Layout';
import { useState, useRef, useEffect } from 'react';
import { fetchProjects, editProject, deleteProject } from '../API/ProjectAPI';

const MyProjects = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // State
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewProject, setViewProject] = useState(null);
  const [editProjectObj, setEditProjectObj] = useState(null);
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

  // Fetch projects on mount
  useEffect(() => {
    fetchAllProjects();
  }, []);

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

  const fetchAllProjects = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
      setFilteredProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const handleView = (project) => {
    setViewProject(project);
  };

  const handleEdit = (project) => {
    setEditProjectObj(project);
    setEditForm({
      projectName: project.projectName,
      date: project.date ? project.date.slice(0, 10) : '',
      status: project.status,
      priorityLevel: project.priorityLevel,
      projectManagerInCharge: project.projectManagerInCharge,
      contributors: project.contributors || [],
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    if (!editProjectObj) return;
    try {
      await editProject(editProjectObj.projectId, editForm);
      await fetchAllProjects();
      setEditProjectObj(null);
    } catch (err) {
      console.error('Error editing project:', err);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.projectId !== projectId));
      setFilteredProjects((prev) => prev.filter((p) => p.projectId !== projectId));
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const closeModal = () => {
    setViewProject(null);
    setEditProjectObj(null);
  };

  const filteredUsers = projects.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredLeaderUsers = projects.filter(user =>
    user.name.toLowerCase().includes(leaderSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(leaderSearchTerm.toLowerCase())
  );

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

  const handleProjectClick = (projectName) => {
    navigate(`/my-tasks/${encodeURIComponent(projectName)}`);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-extrabold mb-4 ${
              darkMode 
                ? 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent'
                : 'text-gray-900'
            }`}>
              My Projects
            </h2>
            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <input
                  type="text"
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
          
          {/* Projects Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div
                key={project.projectId}
                className={`${darkMode ? `bg-gray-800 border-purple-500/30` : `bg-white border-purple-300`} border overflow-hidden shadow-xl rounded-lg hover:shadow-lg ${darkMode ? `hover:shadow-purple-500/20` : `hover:shadow-purple-300/30`} transition-all duration-300 cursor-pointer`}
                onClick={() => handleProjectClick(project.projectName)}
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
                      <div className={`bg-purple-500 h-2 rounded-full`} style={{width: `${project.progress}%`}}></div>
                    </div>
                  </div>
                  {/* Action Icons */}
                  <div className="flex justify-end space-x-2" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => handleView(project)}
                      className={`p-2 rounded-full transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-purple-300' : 'hover:bg-gray-100 text-gray-600 hover:text-purple-600'}`}
                      title="View Project"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEdit(project)}
                      className={`p-2 rounded-full transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-cyan-300' : 'hover:bg-gray-100 text-gray-600 hover:text-cyan-600'}`}
                      title="Edit Project"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(project.projectId)}
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

          {/* Create New Project Button */}
          <div className="mt-8 text-center">
            <button 
              onClick={() => navigate('/add-project')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            >
              + Create New Project
            </button>
          </div>
        </div>
      </div>

      {/* View Project Modal */}
      {viewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
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
      {editProjectObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`w-full max-w-2xl mx-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-xl p-6 space-y-6 overflow-y-auto max-h-[80vh]`}>
            <h2 className={`text-3xl font-extrabold mb-4 text-center ${darkMode ? 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent' : 'text-gray-900'}`}>Edit Project</h2>
            <form onSubmit={e => { e.preventDefault(); handleEditSave(); }} className="space-y-6">
              {/* Project Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Project Name *</label>
                <input type="text" name="projectName" value={editForm.projectName} onChange={handleEditFormChange} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'}`} />
              </div>
              {/* Date */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date</label>
                <input type="date" name="date" value={editForm.date} onChange={handleEditFormChange} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-400' : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'}`} />
              </div>
              {/* Priority Level */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Priority Level</label>
                <input type="text" name="priorityLevel" value={editForm.priorityLevel} onChange={handleEditFormChange} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-400' : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'}`} />
              </div>
              {/* Status */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                <input type="text" name="status" value={editForm.status} onChange={handleEditFormChange} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-400' : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'}`} />
              </div>
              {/* Project Manager */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Project Manager</label>
                <input type="text" name="projectManagerInCharge" value={editForm.projectManagerInCharge} onChange={handleEditFormChange} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-400' : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'}`} />
              </div>
              {/* Contributors */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Contributors (comma separated user IDs)</label>
                <input type="text" name="contributors" value={editForm.contributors.join(',')} onChange={e => setEditForm(prev => ({ ...prev, contributors: e.target.value.split(',').map(s => s.trim()) }))} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-400' : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'}`} />
              </div>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button type="submit" className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400/50">
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </button>
                <button type="button" onClick={closeModal} className={`flex-1 flex items-center justify-center px-6 py-3 border rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400/50 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500' : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'}`}>
                  <X className="w-5 h-5 mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MyProjects; 