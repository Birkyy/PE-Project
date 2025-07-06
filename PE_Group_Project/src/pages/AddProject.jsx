import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Save, X } from 'lucide-react';
import Layout from '../components/Layout';
import { projectAPI } from '../API/apiService';

const AddProject = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    date: '',
    priorityLevel: 'medium',
    status: 'pending',
    projectManagerInCharge: '',
    contributors: [],
    contributorsInput: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic validation
    if (!formData.projectName.trim()) {
      setError('Project name is required.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Helper function to convert string to GUID
      const stringToGuid = (str) => {
        if (!str || str.trim() === '') return null;
        const trimmed = str.trim();
        // Basic GUID validation
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!guidRegex.test(trimmed)) {
          console.error('Invalid GUID format:', trimmed);
          return null;
        }
        return trimmed;
      };

      // Convert form data to match the API DTO structure
      const projectData = {
        projectName: formData.projectName,
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        status: formData.status,
        priorityLevel: formData.priorityLevel,
        projectManagerInCharge: stringToGuid(formData.projectManagerInCharge) || '00000000-0000-0000-0000-000000000000',
        contributors: formData.contributors.map(id => stringToGuid(id)).filter(id => id !== null)
      };

      console.log('Sending project data:', projectData);
      console.log('Project data JSON:', JSON.stringify(projectData, null, 2));

      // Create project using API
      const createdProject = await projectAPI.createProject(projectData);
      
      console.log('Project created successfully:', createdProject);
      
      // Navigate back to projects page
      navigate('/my-projects');
    } catch (err) {
      console.error('Error creating project:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      // Show more specific error messages
      if (err.response?.status === 400) {
        setError(`Bad Request: ${err.response.data || 'Invalid data provided'}`);
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.response?.data || 'Failed to create project. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      projectName: '',
      description: '',
      date: '',
      priorityLevel: 'medium',
      status: 'pending',
      projectManagerInCharge: '',
      contributors: [],
      contributorsInput: ''
    });
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
              
              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              {/* Project Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Project Name *
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
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

              {/* Project Manager */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Project Manager (User ID)
                </label>
                <input
                  type="text"
                  name="projectManagerInCharge"
                  value={formData.projectManagerInCharge}
                  onChange={handleInputChange}
                  placeholder="Enter project manager user ID (GUID)"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                  }`}
                />
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Enter the user ID (GUID) of the project manager. Leave empty to use default.
                </p>
              </div>

              {/* Contributors */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Users className="w-4 h-4 inline mr-2" />
                  Contributors (User IDs)
                </label>
                <input
                  type="text"
                  name="contributorsInput"
                  value={formData.contributorsInput || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const contributors = value.split(',').map(id => id.trim()).filter(id => id.length > 0);
                    setFormData(prev => ({
                      ...prev,
                      contributorsInput: value,
                      contributors: contributors
                    }));
                  }}
                  placeholder="Enter contributor user IDs separated by commas (e.g., 123e4567-e89b-12d3-a456-426614174000, 987fcdeb-51a2-43d1-9f12-345678901234)"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                  }`}
                />
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Enter user IDs (GUIDs) of contributors separated by commas. Leave empty if no contributors.
                </p>
                {formData.contributors.length > 0 && (
                  <div className="mt-2">
                    <p className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      Contributors: {formData.contributors.length} user(s) added
                    </p>
                  </div>
                )}
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
                    name="date"
                    value={formData.date}
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
                    name="priorityLevel"
                    value={formData.priorityLevel}
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
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400/50 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Save className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Creating Project...' : 'Create Project'}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className={`flex-1 flex items-center justify-center px-6 py-3 border rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400/50 ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
