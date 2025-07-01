import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 shadow-lg border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Task.io
              </h1>
            </div>
            
            {/* Navigation Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/member-home"
                className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-gray-700/50"
              >
                Home
              </Link>
              <Link
                to="/my-projects"
                className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-gray-700/50"
              >
                My Projects
              </Link>
              <Link
                to="/users-management"
                className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-gray-700/50"
              >
                Users Management
              </Link>
              <Link
                to="/profile"
                className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-gray-700/50"
              >
                Profile
              </Link>
            </div>
            
            {/* Cyberpunk Logout Button */}
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="relative px-6 py-2 font-medium text-purple-300 transition-all duration-300 bg-transparent border-2 border-purple-500 rounded-lg hover:bg-purple-500/20 hover:text-white hover:shadow-lg hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 group"
                style={{
                  textShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
                }}
              >
                <span className="relative z-10">LOGOUT</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1 border-t border-purple-500/30">
              <Link
                to="/member-home"
                className="block text-gray-300 hover:text-purple-400 hover:bg-gray-700/50 px-3 py-2 rounded-md text-base font-medium transition-all duration-300"
              >
                Home
              </Link>
              <Link
                to="/my-projects"
                className="block text-gray-300 hover:text-purple-400 hover:bg-gray-700/50 px-3 py-2 rounded-md text-base font-medium transition-all duration-300"
              >
                My Projects
              </Link>
              <Link
                to="/users-management"
                className="block text-gray-300 hover:text-purple-400 hover:bg-gray-700/50 px-3 py-2 rounded-md text-base font-medium transition-all duration-300"
              >
                Users Management
              </Link>
              <Link
                to="/profile"
                className="block text-gray-300 hover:text-purple-400 hover:bg-gray-700/50 px-3 py-2 rounded-md text-base font-medium transition-all duration-300"
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Welcome to Task.io Dashboard
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Your task management dashboard is ready to use!
            </p>
            
            <div className="bg-gray-800 border border-purple-500/30 overflow-hidden shadow-xl rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-purple-300 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-500/30 p-4 rounded-lg hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
                    <h4 className="font-semibold text-purple-300">Create Task</h4>
                    <p className="text-gray-400">Add a new task to your list</p>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 border border-cyan-500/30 p-4 rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
                    <h4 className="font-semibold text-cyan-300">View Tasks</h4>
                    <p className="text-gray-400">See all your current tasks</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 border border-pink-500/30 p-4 rounded-lg hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300">
                    <h4 className="font-semibold text-pink-300">Reports</h4>
                    <p className="text-gray-400">Track your productivity</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <Link
                to="/login"
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-300"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 