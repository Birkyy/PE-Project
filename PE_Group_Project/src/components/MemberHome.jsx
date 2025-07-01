import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MemberHome = () => {
  const navigate = useNavigate();
  const [memberData, setMemberData] = useState({
    name: 'John Doe',
    role: 'Project Member',
    assignedTasks: 8,
    completedTasks: 5,
    pendingTasks: 3
  });

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setMemberData(prev => ({
        ...prev,
        name: user.username || user.name || 'Project Member',
        role: user.role === 'project_member' ? 'Project Member' : 
              user.role === 'project_manager' ? 'Project Manager' : 
              user.role === 'project_admin' ? 'Project Admin' : 'Project Member'
      }));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const projects = [
    { id: 1, title: 'Current Project' },
    { id: 2, title: 'Current Project' }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="bg-gray-600 px-4 py-2 rounded-lg">
                <span className="text-white font-medium text-sm">Task.io</span>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-8">
              <button className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium">
                Home
              </button>
              <button className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
                Project
              </button>
              <button className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
                Task
              </button>
              <button 
                onClick={handleLogout}
                className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium"
              >
                User
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-8">
            Welcome to Task.io
          </h1>
        </div>

        {/* Project Cards */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="text-center">
                {/* Project Card */}
                <div className="bg-white h-48 rounded-lg flex items-center justify-center mb-6">
                  <h2 className="text-2xl font-bold text-black">
                    {project.title}
                  </h2>
                </div>

                {/* View Button */}
                <button 
                  className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-full font-medium transition-colors"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberHome; 