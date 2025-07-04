import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Search, Calendar, Users, Save, X, ChevronDown, UserCheck } from 'lucide-react';
import Layout from '../components/Layout';
import { useState, useRef, useEffect } from 'react';

const MyProjects = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Modal state
  const [searchTerm, setSearchTerm] = useState('');
  const [leaderSearchTerm, setLeaderSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const leaderDropdownRef = useRef(null);

  // Example project data (replace with real data as needed)
  const projects = [
    {
      id: 1,
      name: 'Project Alpha',
      description: 'Web application development with modern React framework',
      due: 'Dec 25, 2024',
      progress: 75,
      color: 'purple'
    },
    {
      id: 2,
      name: 'Project Beta',
      description: 'Mobile application with cross-platform compatibility',
      due: 'Jan 15, 2025',
      progress: 50,
      color: 'cyan'
    },
    {
      id: 3,
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

  const handleDelete = (projectName) => {
    console.log(`Deleting ${projectName}`);
    // Add delete logic here
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
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
                onClick={() => handleProjectClick(project.id)}
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
        </div>
      </div>
    </Layout>
  );
};

export default MyProjects; 