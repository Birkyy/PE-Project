import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Layout from '../Layout';
import api from '../../utils/api';

const UsersManagement = () => {
  const { darkMode } = useTheme();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    nationality: '',
    phoneNumber: ''
  });
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    nationality: '',
    phoneNumber: ''
  });

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users from API...');
      const response = await api.get('/user');
      console.log('API response:', response.data);
      const apiUsers = response.data;
      
      // Transform API data to match our UI structure
      const transformedUsers = apiUsers.map((user, index) => ({
        id: index + 1,
        name: user.username,
        username: user.username,
        email: user.email,
        age: user.age,
        gender: user.gender,
        nationality: user.nationality,
        phoneNumber: user.phoneNumber,
        status: 'Active' // Default status since API doesn't provide this
      }));
      
      setUsers(transformedUsers);
      console.log('Users loaded successfully:', transformedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
      
      // Fallback to hardcoded data if API fails
      setUsers([
        { id: 1, name: 'John Doe', email: 'john@taskio.com', status: 'Active' },
        { id: 2, name: 'Jane Smith', email: 'jane@taskio.com', status: 'Active' },
        { id: 3, name: 'Mike Johnson', status: 'Inactive' },
        { id: 4, name: 'Sarah Wilson', status: 'Active' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/user', {
        Username: formData.username,
        Email: formData.email,
        Password: formData.password,
        Age: formData.age ? parseInt(formData.age) : null,
        Gender: formData.gender || null,
        Nationality: formData.nationality || null,
        PhoneNumber: formData.phoneNumber || null
      });

      setSuccess('User created successfully!');
      setFormData({
        username: '',
        email: '',
        password: '',
        age: '',
        gender: '',
        nationality: '',
        phoneNumber: ''
      });
      
      // Refresh users list
      await fetchUsers();
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowCreateModal(false);
        setSuccess('');
      }, 2000);

    } catch (err) {
      console.error('Create user error:', err);
      let errorMessage = 'Failed to create user. Please try again.';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        Username: editFormData.username,
        Email: editFormData.email,
        Age: editFormData.age ? parseInt(editFormData.age) : null,
        Gender: editFormData.gender || null,
        Nationality: editFormData.nationality || null,
        PhoneNumber: editFormData.phoneNumber || null
      };

      // Only include password if it's provided
      if (editFormData.password && editFormData.password.trim() !== '') {
        updateData.Password = editFormData.password;
      }

      console.log('Updating user with data:', updateData);
      console.log('Original email:', selectedUser.email);

      const response = await api.put(`/user/${selectedUser.email}`, updateData);

      setSuccess('User updated successfully!');
      
      // Refresh users list to show updated data
      await fetchUsers();
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowEditModal(false);
        setSuccess('');
        setSelectedUser(null);
      }, 2000);

    } catch (err) {
      console.error('Update user error:', err);
      let errorMessage = 'Failed to update user. Please try again.';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    setError('');
    setSuccess('');
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setFormData({
      username: '',
      email: '',
      password: '',
      age: '',
      gender: '',
      nationality: '',
      phoneNumber: ''
    });
    setError('');
    setSuccess('');
  };

  const openEditModal = async (user) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Try to fetch full user details from API
      try {
        const response = await api.get(`/user/${user.email}`);
        const userData = response.data;
        
        setSelectedUser(user);
        setEditFormData({
          username: userData.username || user.name,
          email: userData.email,
          password: '', // Always leave empty for security
          age: userData.age || '',
          gender: userData.gender || '',
          nationality: userData.nationality || '',
          phoneNumber: userData.phoneNumber || ''
        });
      } catch (apiError) {
        // If API call fails, use the user data we already have
        setSelectedUser(user);
        setEditFormData({
          username: user.name,
          email: user.email,
          password: '',
          age: user.age || '',
          gender: user.gender || '',
          nationality: user.nationality || '',
          phoneNumber: user.phoneNumber || ''
        });
      }
      
      setShowEditModal(true);
    } catch (err) {
      setError('Failed to open edit modal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    setEditFormData({
      username: '',
      email: '',
      password: '',
      age: '',
      gender: '',
      nationality: '',
      phoneNumber: ''
    });
    setError('');
    setSuccess('');
  };

  const openViewModal = async (user) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Try to fetch full user details from API
      try {
        const response = await api.get(`/user/${user.email}`);
        const userData = response.data;
        
        setSelectedUser({
          ...user,
          ...userData,
          name: userData.username || user.name
        });
      } catch (apiError) {
        // If API call fails, use the user data we already have
        setSelectedUser(user);
      }
      
      setShowViewModal(true);
    } catch (err) {
      setError('Failed to load user details. Please try again.');
      setSelectedUser(user); // Fallback to basic user data
      setShowViewModal(true);
    } finally {
      setLoading(false);
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedUser(null);
    setError('');
    setSuccess('');
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
              Users Management
            </h2>
            <div className="mb-8 flex justify-center">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`px-4 py-2 w-96 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  darkMode
                    ? 'bg-gray-700 border border-gray-600 placeholder-gray-400 text-white'
                    : 'bg-white border border-gray-300 placeholder-gray-500 text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex gap-4">
              <button 
                onClick={openCreateModal}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              >
                + Add User
              </button>
              <button className={`px-4 py-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
                darkMode
                  ? 'text-gray-400 border border-gray-600 hover:text-white hover:bg-gray-700/50 focus:ring-gray-400/50'
                  : 'text-gray-600 border border-gray-300 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-400/50'
              }`}>
                Export Users
              </button>
            </div>

          </div>
          
          {/* Users Table */}
          <div className={`${darkMode ? 'bg-gray-800 border-purple-500/30' : 'bg-white border-purple-300'} border overflow-hidden shadow-xl rounded-lg`}>
            <div className="overflow-x-auto">
              <table className={`min-w-full ${darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}`}>
                <thead className={`${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      User
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}`}>
                  {loading && users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Loading users...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {searchTerm ? `No users found matching "${searchTerm}"` : 'No users found'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                    <tr key={user.id} className={`transition-colors duration-300 ${darkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-medium">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-4">
                            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          user.status === 'Active' 
                            ? darkMode 
                              ? 'bg-green-900/50 text-green-300'
                              : 'bg-green-100 text-green-700'
                            : darkMode 
                              ? 'bg-red-900/50 text-red-300'
                              : 'bg-red-100 text-red-700'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => openEditModal(user)}
                            className={`transition-colors duration-300 ${darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'}`}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => openViewModal(user)}
                            className={`transition-colors duration-300 ${darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-500'}`}
                          >
                            View
                          </button>
                          <button className={`transition-colors duration-300 ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing 1 to {filteredUsers.length} of {filteredUsers.length} results
              {searchTerm && ` (filtered from ${users.length} total users)`}
            </div>
            <div className="flex space-x-2">
              <button className={`px-3 py-1 rounded transition-all duration-300 ${
                darkMode
                  ? 'text-gray-400 border border-gray-600 hover:text-white hover:bg-gray-700/50'
                  : 'text-gray-600 border border-gray-300 hover:text-gray-900 hover:bg-gray-100'
              }`}>
                Previous
              </button>
              <button className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-all duration-300">
                1
              </button>
              <button className={`px-3 py-1 rounded transition-all duration-300 ${
                darkMode
                  ? 'text-gray-400 border border-gray-600 hover:text-white hover:bg-gray-700/50'
                  : 'text-gray-600 border border-gray-300 hover:text-gray-900 hover:bg-gray-100'
              }`}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300`}>
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Create New User
                </h3>
                <button
                  onClick={closeCreateModal}
                  className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors duration-200`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="px-6 py-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 rounded-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 rounded-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 rounded-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className={`px-4 py-2 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 ${
                    darkMode
                      ? 'text-gray-400 border border-gray-600 hover:text-white hover:bg-gray-700/50 focus:ring-gray-400/50'
                      : 'text-gray-600 border border-gray-300 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-400/50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-md hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300`}>
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Edit User: {selectedUser.name}
                </h3>
                <button
                  onClick={closeEditModal}
                  className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors duration-200`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleEditUser} className="px-6 py-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={editFormData.username}
                    onChange={handleEditInputChange}
                    required
                    className={`w-full px-3 py-2 rounded-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    required
                    className={`w-full px-3 py-2 rounded-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Password (leave empty to keep current)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={editFormData.password}
                    onChange={handleEditInputChange}
                    className={`w-full px-3 py-2 rounded-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className={`px-4 py-2 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 ${
                    darkMode
                      ? 'text-gray-400 border border-gray-600 hover:text-white hover:bg-gray-700/50 focus:ring-gray-400/50'
                      : 'text-gray-600 border border-gray-300 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-400/50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-md hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all duration-300`}>
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  User Profile
                </h3>
                <button
                  onClick={closeViewModal}
                  className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors duration-200`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              {/* User Avatar and Basic Info */}
              <div className="text-center mb-6">
                <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl mb-4">
                  {selectedUser.name ? selectedUser.name.split(' ').map(n => n[0]).join('') : 'U'}
                </div>
                <h4 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedUser.name || selectedUser.username}
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedUser.email}
                </p>
              </div>

              {/* User Details */}
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h5 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Personal Information
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Name
                      </label>
                      <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedUser.username || selectedUser.name}
                      </p>
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email
                      </label>
                      <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedUser.email}
                      </p>
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Age
                      </label>
                      <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedUser.age || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Gender
                      </label>
                      <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedUser.gender || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Phone Number
                      </label>
                      <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedUser.phoneNumber || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Nationality
                      </label>
                      <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedUser.nationality || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h5 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Account Information
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        User ID:
                      </span>
                      <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        #{selectedUser.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Account Created:
                      </span>
                      <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        January 2024
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Last Login:
                      </span>
                      <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        2 hours ago
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Buttons */}
            <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end space-x-3`}>
              <button
                onClick={closeViewModal}
                className={`px-4 py-2 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 ${
                  darkMode
                    ? 'text-gray-400 border border-gray-600 hover:text-white hover:bg-gray-700/50 focus:ring-gray-400/50'
                    : 'text-gray-600 border border-gray-300 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-400/50'
                }`}
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeViewModal();
                  openEditModal(selectedUser);
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-md hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              >
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UsersManagement; 