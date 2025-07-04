import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Save, X, Search, ChevronDown, UserCheck } from 'lucide-react';
import Layout from '../Layout';

const AddProject = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  // Mock users data - in real app, this would come from an API
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

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'to-do',
    teamMembers: [],
    projectLeader: null
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLeaderDropdownOpen, setIsLeaderDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [leaderSearchTerm, setLeaderSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const leaderDropdownRef = useRef(null);
  
  // Filter users based on search term
  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter users for project leader based on leader search term
  const filteredLeaderUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(leaderSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(leaderSearchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserSelect = (user) => {
    if (!formData.teamMembers.find(member => member.id === user.id)) {
      setFormData(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, user]
      }));
    }
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleUserRemove = (userId) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(member => member.id !== userId)
    }));
  };

  const handleLeaderSelect = (user) => {
    setFormData(prev => ({
      ...prev,
      projectLeader: user
    }));
    setLeaderSearchTerm('');
    setIsLeaderDropdownOpen(false);
  };

  const handleLeaderRemove = () => {
    setFormData(prev => ({
      ...prev,
      projectLeader: null
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Project data:', formData);
    // Add project creation logic here
    
    // After successful project creation, navigate back to projects page
    navigate('/my-projects');
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      status: 'to-do',
      teamMembers: [],
      projectLeader: null
    });
    setSearchTerm('');
    setLeaderSearchTerm('');
    setIsDropdownOpen(false);
    setIsLeaderDropdownOpen(false);
    navigate('/my-projects');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-extrabold mb-4 ${
              darkMode 
                ? 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent'
                : 'text-gray-900'
            }`}>
              Add New Project
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Create a new project and set up your team for success
            </p>
          </div>

          {/* Form */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-xl overflow-hidden`}>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Project Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Project Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter project name"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                  }`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your project goals and objectives"
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 resize-none ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                  }`}
                />
              </div>

              {/* Team Members */}
              <div className="relative" ref={dropdownRef}>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Users className="w-4 h-4 inline mr-2" />
                  Team Members
                </label>
                
                {/* Selected Users Display */}
                {formData.teamMembers.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {formData.teamMembers.map(member => (
                        <div 
                          key={member.id}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                            darkMode 
                              ? 'bg-purple-900/50 text-purple-300 border border-purple-700' 
                              : 'bg-purple-100 text-purple-700 border border-purple-300'
                          }`}
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>{member.name}</span>
                          <button
                            type="button"
                            onClick={() => handleUserRemove(member.id)}
                            className={`hover:bg-red-500 hover:text-white rounded-full p-0.5 transition-colors ${
                              darkMode ? 'text-purple-400 hover:bg-red-600' : 'text-purple-600 hover:bg-red-500'
                            }`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dropdown Trigger */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 flex items-center justify-between ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-400' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    }`}
                  >
                    <span className={formData.teamMembers.length === 0 ? (darkMode ? 'text-gray-400' : 'text-gray-500') : ''}>
                      {formData.teamMembers.length === 0 
                        ? 'Select team members...' 
                        : `${formData.teamMembers.length} member${formData.teamMembers.length > 1 ? 's' : ''} selected`
                      }
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Content */}
                  {isDropdownOpen && (
                    <div className={`absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-96 overflow-hidden ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {/* Search Input */}
                      <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                        <div className="relative">
                          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2.5 border rounded focus:outline-none focus:ring-1 focus:ring-purple-400 ${
                              darkMode 
                                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Users List */}
                      <div className="max-h-72 overflow-y-auto">
                        {filteredUsers.length === 0 ? (
                          <div className={`px-4 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            No users found
                          </div>
                        ) : (
                          filteredUsers.map(user => {
                            const isSelected = formData.teamMembers.find(member => member.id === user.id);
                            return (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => handleUserSelect(user)}
                                disabled={isSelected}
                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-between ${
                                  isSelected 
                                    ? (darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-600')
                                    : (darkMode ? 'text-white' : 'text-gray-900')
                                }`}
                              >
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {user.email} • {user.role}
                                  </div>
                                </div>
                                {isSelected && <UserCheck className="w-4 h-4 text-green-500" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Leader */}
              <div className="relative">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <UserCheck className="w-4 h-4 inline mr-2" />
                  Project Leader
                </label>
                
                {/* Selected Leader Display */}
                {formData.projectLeader && (
                  <div className="mb-3">
                    <div 
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm w-fit ${
                        darkMode 
                          ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-700' 
                          : 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                      }`}
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>{formData.projectLeader.name}</span>
                      <button
                        type="button"
                        onClick={handleLeaderRemove}
                        className={`hover:bg-red-500 hover:text-white rounded-full p-0.5 transition-colors ${
                          darkMode ? 'text-cyan-400 hover:bg-red-600' : 'text-cyan-600 hover:bg-red-500'
                        }`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Leader Dropdown Trigger */}
                <div className="relative" ref={leaderDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsLeaderDropdownOpen(!isLeaderDropdownOpen)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 flex items-center justify-between ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-400' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    }`}
                  >
                    <span className={!formData.projectLeader ? (darkMode ? 'text-gray-400' : 'text-gray-500') : ''}>
                      {!formData.projectLeader 
                        ? 'Select project leader...' 
                        : formData.projectLeader.name
                      }
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isLeaderDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Leader Dropdown Content */}
                  {isLeaderDropdownOpen && (
                    <div className={`absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-64 overflow-hidden ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {/* Search Input */}
                      <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                        <div className="relative">
                          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <input
                            type="text"
                            placeholder="Search for project leader..."
                            value={leaderSearchTerm}
                            onChange={(e) => setLeaderSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-purple-400 ${
                              darkMode 
                                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Users List */}
                      <div className="max-h-48 overflow-y-auto">
                        {filteredLeaderUsers.length === 0 ? (
                          <div className={`px-3 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            No users found
                          </div>
                        ) : (
                          filteredLeaderUsers.map(user => {
                            const isSelected = formData.projectLeader && formData.projectLeader.id === user.id;
                            return (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => handleLeaderSelect(user)}
                                className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-between ${
                                  isSelected 
                                    ? (darkMode ? 'bg-cyan-900/30 text-cyan-300' : 'bg-cyan-50 text-cyan-600')
                                    : (darkMode ? 'text-white' : 'text-gray-900')
                                }`}
                              >
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {user.email}
                                  </div>
                                </div>
                                {isSelected && <UserCheck className="w-4 h-4 text-green-500" />}
                              </button>
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
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Users className="w-4 h-4 inline mr-2" />
                  Team Members
                </label>
                
                {/* Selected Users Display */}
                {formData.teamMembers.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {formData.teamMembers.map(member => (
                        <div 
                          key={member.id}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                            darkMode 
                              ? 'bg-purple-900/50 text-purple-300 border border-purple-700' 
                              : 'bg-purple-100 text-purple-700 border border-purple-300'
                          }`}
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>{member.name}</span>
                          <button
                            type="button"
                            onClick={() => handleUserRemove(member.id)}
                            className={`hover:bg-red-500 hover:text-white rounded-full p-0.5 transition-colors ${
                              darkMode ? 'text-purple-400 hover:bg-red-600' : 'text-purple-600 hover:bg-red-500'
                            }`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dropdown Trigger */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 flex items-center justify-between ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-400' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    }`}
                  >
                    <span className={formData.teamMembers.length === 0 ? (darkMode ? 'text-gray-400' : 'text-gray-500') : ''}>
                      {formData.teamMembers.length === 0 
                        ? 'Select team members...' 
                        : `${formData.teamMembers.length} member${formData.teamMembers.length > 1 ? 's' : ''} selected`
                      }
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Content */}
                  {isDropdownOpen && (
                    <div className={`absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-96 overflow-hidden ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {/* Search Input */}
                      <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                        <div className="relative">
                          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2.5 border rounded focus:outline-none focus:ring-1 focus:ring-purple-400 ${
                              darkMode 
                                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Users List */}
                      <div className="max-h-72 overflow-y-auto">
                        {filteredUsers.length === 0 ? (
                          <div className={`px-4 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            No users found
                          </div>
                        ) : (
                          filteredUsers.map(user => {
                            const isSelected = formData.teamMembers.find(member => member.id === user.id);
                            return (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => handleUserSelect(user)}
                                disabled={isSelected}
                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-between ${
                                  isSelected 
                                    ? (darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-600')
                                    : (darkMode ? 'text-white' : 'text-gray-900')
                                }`}
                              >
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {user.email}
                                  </div>
                                </div>
                                {isSelected && <UserCheck className="w-4 h-4 text-green-500" />}
                              </button>
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
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-400' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Priority Level
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-400' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    }`}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-400' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                  }`}
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Create Project
                </button>
                
                <button
                  type="button"
                  onClick={handleCancel}
                  className={`flex-1 flex items-center justify-center px-6 py-3 border rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400/50 ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          </div>


        </div>
      </div>
    </Layout>
  );
};

export default AddProject;
