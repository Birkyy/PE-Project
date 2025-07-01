import Layout from '../Layout';

const MyProjects = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              My Projects
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Manage and track all your projects in one place
            </p>
          </div>
          
          {/* Projects Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Project Card 1 */}
            <div className="bg-gray-800 border border-purple-500/30 overflow-hidden shadow-xl rounded-lg hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-purple-300">Project Alpha</h3>
                  <span className="px-2 py-1 text-xs font-medium bg-green-900/50 text-green-300 rounded">Active</span>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Web application development with modern React framework
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Due: Dec 25, 2024</span>
                  <div className="w-16 bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Card 2 */}
            <div className="bg-gray-800 border border-cyan-500/30 overflow-hidden shadow-xl rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-cyan-300">Project Beta</h3>
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-900/50 text-yellow-300 rounded">In Progress</span>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Mobile application with cross-platform compatibility
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Due: Jan 15, 2025</span>
                  <div className="w-16 bg-gray-700 rounded-full h-2">
                    <div className="bg-cyan-500 h-2 rounded-full w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Card 3 */}
            <div className="bg-gray-800 border border-pink-500/30 overflow-hidden shadow-xl rounded-lg hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-pink-300">Project Gamma</h3>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-900/50 text-blue-300 rounded">Planning</span>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  AI-powered analytics dashboard for business intelligence
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Due: Feb 28, 2025</span>
                  <div className="w-16 bg-gray-700 rounded-full h-2">
                    <div className="bg-pink-500 h-2 rounded-full w-1/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Create New Project Button */}
          <div className="mt-8 text-center">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50">
              + Create New Project
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyProjects; 