import { Link } from 'react-router-dom';
import Layout from '../Layout';

const Home = () => {
  return (
    <Layout>
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
    </Layout>
  );
};

export default Home; 