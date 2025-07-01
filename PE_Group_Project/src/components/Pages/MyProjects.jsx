import { useTheme } from '../../context/ThemeContext';
import Layout from '../Layout';

const MyProjects = () => {
  const { darkMode } = useTheme();
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
            <p className={`text-lg mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage and track all your projects in one place
            </p>
          </div>
          
          {/* Projects Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Project Card 1 */}
            <div className={`${darkMode ? 'bg-gray-800 border-purple-500/30' : 'bg-white border-purple-300'} border overflow-hidden shadow-xl rounded-lg hover:shadow-lg ${darkMode ? 'hover:shadow-purple-500/20' : 'hover:shadow-purple-300/30'} transition-all duration-300`}>
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>Project Alpha</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>Active</span>
                </div>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Web application development with modern React framework
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Due: Dec 25, 2024</span>
                  <div className={`w-16 rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="bg-purple-500 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Card 2 */}
            <div className={`${darkMode ? 'bg-gray-800 border-cyan-500/30' : 'bg-white border-cyan-300'} border overflow-hidden shadow-xl rounded-lg hover:shadow-lg ${darkMode ? 'hover:shadow-cyan-500/20' : 'hover:shadow-cyan-300/30'} transition-all duration-300`}>
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>Project Beta</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${darkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-700'}`}>In Progress</span>
                </div>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Mobile application with cross-platform compatibility
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Due: Jan 15, 2025</span>
                  <div className={`w-16 rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="bg-cyan-500 h-2 rounded-full w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Card 3 */}
            <div className={`${darkMode ? 'bg-gray-800 border-pink-500/30' : 'bg-white border-pink-300'} border overflow-hidden shadow-xl rounded-lg hover:shadow-lg ${darkMode ? 'hover:shadow-pink-500/20' : 'hover:shadow-pink-300/30'} transition-all duration-300`}>
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-pink-300' : 'text-pink-700'}`}>Project Gamma</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>Planning</span>
                </div>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  AI-powered analytics dashboard for business intelligence
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Due: Feb 28, 2025</span>
                  <div className={`w-16 rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
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