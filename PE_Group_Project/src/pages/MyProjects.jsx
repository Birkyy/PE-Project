import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Search, Calendar, Users, Save, X, ChevronDown, UserCheck } from 'lucide-react';
import Layout from '../components/Layout';
import { useState, useRef, useEffect } from 'react';

const MyProjects = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Modal state
  const [viewProject, setViewProject] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo',
    teamMembers: [],
    projectLeader: null
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLeaderDropdownOpen, setIsLeaderDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [leaderSearchTerm, setLeaderSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const leaderDropdownRef = useRef(null);

  // Example project data (replace with real data as needed)
  const projects = [
    {
      name: 'Project Alpha',
      description: 'Web application development with modern React framework',
      due: 'Dec 25, 2024',
      progress: 75,
      color: 'purple'
    },
    {
      name: 'Project Beta',
      description: 'Mobile application with cross-platform compatibility',
      due: 'Jan 15, 2025',
      progress: 50,
      color: 'cyan'
    },
    {
      name: 'Project Gamma',
      description: 'AI-powered analytics dashboard for business intelligence',
      due: 'Feb 28, 2025',
      progress: 25,
      color: 'pink'
    }
  ];

  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john.doe@company.com', role: 'Frontend Developer' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com', role: 'Backend Developer' },
    { id: 3, name: 'Mike Johnson', email: 'mike.johnson@company.com', role: 'UI/UX Designer' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah.wilson@company.com', role: 'Project Manager' },
    { id: 5, name: 'David Brown', email: 'david.brown@company.com', role: 'Full Stack Developer' },
    { id: 6, name: 'Lisa Davis', email: 'lisa.davis@company.com', role: 'QA Engineer' },
    { id: 7, name: 'Tom Anderson', email: 'tom.anderson@company.com', role: 'DevOps Engineer' },
    { id: 8, name: 'Emily Taylor', email: 'emily.taylor@company.com', role: 'Product Owner' }
  ];

  const handleView = (projectName) => {
    const project = projects.find(p => p.name === projectName);
    setViewProject(project);
  };

  const handleEdit = (projectName) => {
    const project = projects.find(p => p.name === projectName);
    setEditProject(project);
    setEditForm({
      name: project.name,
      description: project.description,
      dueDate: project.due,
      priority: 'medium',
      status: 'todo',
      teamMembers: [],
      projectLeader: null
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = () => {
    // Save logic here (API call, etc.)
    setEditProject(null);
  };

  const handleDelete = (projectName) => {
    console.log(`Deleting ${projectName}`);
    // Add delete logic here
  };

  const closeModal = () => {
    setViewProject(null);
    setEditProject(null);
  };

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredLeaderUsers = mockUsers.filter(user =>
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
    if (!editForm.teamMembers.find(member => member.id === user.id)) {
      setEditForm(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, user]
      }));
    }
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleUserRemove = (userId) => {
    setEditForm(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(member => member.id !== userId)
    }));
  };

  const handleLeaderSelect = (user) => {
    setEditForm(prev => ({
      ...prev,
      projectLeader: user
    }));
    setLeaderSearchTerm('');
    setIsLeaderDropdownOpen(false);
  };

  const handleLeaderRemove = () => {
    setEditForm(prev => ({
      ...prev,
      projectLeader: null
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
            {projects.map((project) => (
              <div
                key={project.name}
                className={`${darkMode ? `bg-gray-800 border-${project.color}-500/30` : `bg-white border-${project.color}-300`} border overflow-hidden shadow-xl rounded-lg hover:shadow-lg ${darkMode ? `hover:shadow-${project.color}-500/20` : `hover:shadow-${project.color}-300/30`} transition-all duration-300 cursor-pointer`}
                onClick={() => handleProjectClick(project.name)}
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-lg font-semibold ${darkMode ? `text-${project.color}-300` : `text-${project.color}-700`}`}>{project.name}</h3>
                  </div>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{project.description}</p>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Due: {project.due}</span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}> 
                      <div className={`bg-${project.color}-500 h-2 rounded-full`} style={{width: `${project.progress}%`}}></div>
                    </div>
                  </div>
                  {/* Action Icons */}
                  <div className="flex justify-end space-x-2" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => handleView(project.name)}
                      className={`p-2 rounded-full transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-purple-300' : 'hover:bg-gray-100 text-gray-600 hover:text-purple-600'}`}
                      title="View Project"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEdit(project.name)}
                      className={`p-2 rounded-full transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-cyan-300' : 'hover:bg-gray-100 text-gray-600 hover:text-cyan-600'}`}
                      title="Edit Project"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(project.name)}
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
                <div className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>{viewProject.name}</div>
              </div>
              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                <div className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>{viewProject.description}</div>
              </div>
              {/* Project Leader */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Project Leader</label>
                {viewProject.projectLeader ? (
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm w-fit ${darkMode ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-700' : 'bg-cyan-100 text-cyan-700 border border-cyan-300'}`}> <UserCheck className="w-3 h-3" /> <span>{viewProject.projectLeader.name}</span> </div>
                ) : (
                  <div className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-white border-gray-300 text-gray-500'}`}>No leader assigned</div>
                )}
              </div>
              {/* Team Members */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Team Members</label>
                {viewProject.teamMembers && viewProject.teamMembers.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {viewProject.teamMembers.map(member => (
                      <div key={member.id} className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-purple-900/50 text-purple-300 border border-purple-700' : 'bg-purple-100 text-purple-700 border border-purple-300'}`}> <UserCheck className="w-3 h-3" /> <span>{member.name}</span> </div>
                    ))}
                  </div>
                ) : (
                  <div className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-white border-gray-300 text-gray-500'}`}>No team members assigned</div>
                )}
              </div>
              {/* Due Date and Priority Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Due Date</label>
                  <div className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>{viewProject.dueDate}</div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Priority Level</label>
                  <div className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>{viewProject.priority ? viewProject.priority.charAt(0).toUpperCase() + viewProject.priority.slice(1) : ''}</div>
                </div>
              </div>
              {/* Status */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                <div className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>{viewProject.status ? viewProject.status.charAt(0).toUpperCase() + viewProject.status.slice(1) : ''}</div>
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
      {editProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`w-full max-w-2xl mx-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-xl p-6 space-y-6 overflow-y-auto max-h-[80vh]`}>
            <h2 className={`text-3xl font-extrabold mb-4 text-center ${darkMode ? 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent' : 'text-gray-900'}`}>Edit Project</h2>
            <form onSubmit={e => { e.preventDefault(); handleEditSave(); }} className="space-y-6">
              {/* Project Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Project Name *</label>
                <input type="text" name="name" value={editForm.name} onChange={handleEditFormChange} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'}`} />
              </div>
              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                <textarea name="description" value={editForm.description} onChange={handleEditFormChange} rows={4} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 resize-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'}`} />
              </div>
              {/* Project Leader */}
              <div className="relative">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Project Leader</label>
                {editForm.projectLeader && (
                  <div className="mb-3">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm w-fit ${darkMode ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-700' : 'bg-cyan-100 text-cyan-700 border border-cyan-300'}`}> <UserCheck className="w-3 h-3" /> <span>{editForm.projectLeader.name}</span> <button type="button" onClick={handleLeaderRemove} className={`hover:bg-red-500 hover:text-white rounded-full p-0.5 transition-colors ${darkMode ? 'text-cyan-400 hover:bg-red-600' : 'text-cyan-600 hover:bg-red-500'}`}><X className="w-3 h-3" /></button> </div>
                  </div>
                )}
                <div className="relative" ref={leaderDropdownRef}>
                  <button type="button" onClick={() => setIsLeaderDropdownOpen(!isLeaderDropdownOpen)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 flex items-center justify-between ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-400' : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'}`}> <span className={!editForm.projectLeader ? (darkMode ? 'text-gray-400' : 'text-gray-500') : ''}>{!editForm.projectLeader ? 'Select project leader...' : editForm.projectLeader.name}</span> <ChevronDown className={`w-4 h-4 transition-transform ${isLeaderDropdownOpen ? 'rotate-180' : ''}`} /> </button>
                  {isLeaderDropdownOpen && (
                    <div className={`absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-64 overflow-hidden ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                      <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                        <div className="relative">
                          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <input type="text" placeholder="Search for project leader..." value={leaderSearchTerm} onChange={e => setLeaderSearchTerm(e.target.value)} className={`w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-purple-400 ${darkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`} />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredLeaderUsers.length === 0 ? (
                          <div className={`px-3 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No users found</div>
                        ) : (
                          filteredLeaderUsers.map(user => {
                            const isSelected = editForm.projectLeader && editForm.projectLeader.id === user.id;
                            return (
                              <button key={user.id} type="button" onClick={() => handleLeaderSelect(user)} className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-between ${isSelected ? (darkMode ? 'bg-cyan-900/30 text-cyan-300' : 'bg-cyan-50 text-cyan-600') : (darkMode ? 'text-white' : 'text-gray-900')}`}>{user.name}<div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</div>{isSelected && <UserCheck className="w-4 h-4 text-green-500" />}</button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Team Members */}
              <div className="relative">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Team Members</label>
                {editForm.teamMembers.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {editForm.teamMembers.map(member => (
                        <div key={member.id} className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-purple-900/50 text-purple-300 border border-purple-700' : 'bg-purple-100 text-purple-700 border border-purple-300'}`}> <UserCheck className="w-3 h-3" /> <span>{member.name}</span> <button type="button" onClick={() => handleUserRemove(member.id)} className={`hover:bg-red-500 hover:text-white rounded-full p-0.5 transition-colors ${darkMode ? 'text-purple-400 hover:bg-red-600' : 'text-purple-600 hover:bg-red-500'}`}><X className="w-3 h-3" /></button> </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="relative" ref={dropdownRef}>
                  <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 flex items-center justify-between ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-400' : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'}`}> <span className={editForm.teamMembers.length === 0 ? (darkMode ? 'text-gray-400' : 'text-gray-500') : ''}>{editForm.teamMembers.length === 0 ? 'Select team members...' : `${editForm.teamMembers.length} member${editForm.teamMembers.length > 1 ? 's' : ''} selected`}</span> <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} /> </button>
                  {isDropdownOpen && (
                    <div className={`absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-64 overflow-hidden ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                      <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                        <div className="relative">
                          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <input type="text" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-purple-400 ${darkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`} />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredUsers.length === 0 ? (
                          <div className={`px-3 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No users found</div>
                        ) : (
                          filteredUsers.map(user => {
                            const isSelected = editForm.teamMembers.find(member => member.id === user.id);
                            return (
                              <button key={user.id} type="button" onClick={() => handleUserSelect(user)} disabled={isSelected} className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-between ${isSelected ? (darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-600') : (darkMode ? 'text-white' : 'text-gray-900')}`}>{user.name}<div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</div>{isSelected && <UserCheck className="w-4 h-4 text-green-500" />}</button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Due Date and Priority Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Due Date</label>
                  <input type="date" name="dueDate" value={editForm.dueDate} onChange={handleEditFormChange} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-400' : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'}`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Priority Level</label>
                  <select name="priority" value={editForm.priority} onChange={handleEditFormChange} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-400' : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'}`}>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              {/* Status */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                <select name="status" value={editForm.status} onChange={handleEditFormChange} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-400' : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'}`}>
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
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