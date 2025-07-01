import Layout from '../Layout';

const UsersManagement = () => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@taskio.com', role: 'Project Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@taskio.com', role: 'Project Member', status: 'Active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@taskio.com', role: 'Team Lead', status: 'Inactive' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@taskio.com', role: 'Project Member', status: 'Active' }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Users Management
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Manage team members and their access permissions
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50">
                + Add User
              </button>
              <button className="px-4 py-2 text-gray-400 border border-gray-600 rounded-lg hover:text-white hover:bg-gray-700/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50">
                Export Users
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search users..."
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
              />
            </div>
          </div>
          
          {/* Users Table */}
          <div className="bg-gray-800 border border-purple-500/30 overflow-hidden shadow-xl rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700/30 transition-colors duration-300">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-medium">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{user.name}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-purple-900/50 text-purple-300 rounded">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          user.status === 'Active' 
                            ? 'bg-green-900/50 text-green-300' 
                            : 'bg-red-900/50 text-red-300'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-purple-400 hover:text-purple-300 transition-colors duration-300">
                            Edit
                          </button>
                          <button className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300">
                            View
                          </button>
                          <button className="text-red-400 hover:text-red-300 transition-colors duration-300">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing 1 to 4 of 4 results
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-gray-400 border border-gray-600 rounded hover:text-white hover:bg-gray-700/50 transition-all duration-300">
                Previous
              </button>
              <button className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-all duration-300">
                1
              </button>
              <button className="px-3 py-1 text-gray-400 border border-gray-600 rounded hover:text-white hover:bg-gray-700/50 transition-all duration-300">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UsersManagement; 